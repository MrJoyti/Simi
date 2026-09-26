import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  limit,
  Firestore,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);

// Initialize Firebase for server background triggers
const configPath = path.join(__dirname, 'firebase-applet-config.json');
let db: Firestore | null = null;

if (fs.existsSync(configPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    db = getFirestore(firebaseApp, dbId);
    console.log(`[Firebase Background Trigger] Connected to database: ${dbId}`);
  } catch (err) {
    console.error('[Firebase Background Trigger] Config init error:', err);
  }
}

// Background trigger worker: processes due scheduled messages
let isProcessingScheduled = false;

export async function processScheduledMessages() {
  if (!db || isProcessingScheduled) return;
  isProcessingScheduled = true;
  try {
    const now = Date.now();
    const scheduledCol = collection(db, 'scheduledMessages');
    const q = query(
      scheduledCol,
      where('status', '==', 'scheduled'),
      where('scheduledFor', '<=', now),
      limit(25)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log(`[Firebase Background Trigger] Found ${snapshot.size} due scheduled message(s) to deliver.`);
      for (const docSnap of snapshot.docs) {
        const scheduled = docSnap.data();
        const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

        const newMsg: Record<string, any> = {
          id: msgId,
          roomId: scheduled.roomId,
          senderId: scheduled.senderId,
          senderName: scheduled.senderName,
          senderAvatar: scheduled.senderAvatar,
          senderTheme: scheduled.senderTheme || 'strawberry',
          type: scheduled.type || 'text',
          content: scheduled.content,
          reactions: {},
          timestamp: Date.now(),
          readBy: [scheduled.senderId],
        };

        if (scheduled.senderCustomAvatar) newMsg.senderCustomAvatar = scheduled.senderCustomAvatar;
        if (scheduled.senderBadge) newMsg.senderBadge = scheduled.senderBadge;
        if (scheduled.attachmentUrl) newMsg.attachmentUrl = scheduled.attachmentUrl;
        if (scheduled.audioDuration) newMsg.audioDuration = scheduled.audioDuration;
        if (scheduled.replyTo) newMsg.replyTo = scheduled.replyTo;

        // 1. Write message to room messages subcollection
        const msgDocRef = doc(db, 'rooms', scheduled.roomId, 'messages', msgId);
        await setDoc(msgDocRef, newMsg);

        // 2. Update room lastMessage metadata
        const roomDocRef = doc(db, 'rooms', scheduled.roomId);
        const previewText =
          scheduled.type === 'sticker'
            ? '🎨 Sticker'
            : scheduled.type === 'voice'
            ? '🎙️ Voice note'
            : scheduled.type === 'image'
            ? '📷 Photo'
            : scheduled.content.slice(0, 35);

        await updateDoc(roomDocRef, {
          lastMessage: previewText,
          lastMessageTime: Date.now(),
        }).catch(() => {});

        // 3. Mark scheduled message as sent in Firestore
        await updateDoc(docSnap.ref, {
          status: 'sent',
          sentAt: Date.now(),
        });

        console.log(`[Firebase Background Trigger] Delivered scheduled message ${docSnap.id} to room ${scheduled.roomId}`);
      }
    }
  } catch (err) {
    console.error('[Firebase Background Trigger] Error:', err);
  } finally {
    isProcessingScheduled = false;
  }
}

// Simple health API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Simi Realtime Server', timestamp: Date.now() });
});

// Manual / webhook invocation endpoint for background triggers
app.post('/api/triggers/process-scheduled', async (req, res) => {
  await processScheduledMessages();
  res.json({ ok: true, timestamp: Date.now() });
});

// Mount Vite or static dist
async function setupViteOrStatic() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Simi app server running on http://0.0.0.0:${PORT}`);
    // Start background scheduled messages trigger polling every 3 seconds
    setInterval(processScheduledMessages, 3000);
  });
});
