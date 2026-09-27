import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId || '(default)';

// Initialize Firestore with built-in multi-tab offline persistence
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, dbId);
} catch {
  // If Firestore is already initialized or in environments without IndexedDB support
  firestoreDb = getFirestore(app, dbId);
}

// Initialize Realtime Database (for presence and ephemeral signaling where available)
let rtdbInstance: Database | null = null;
try {
  const rtdbUrl = (firebaseConfig as any).databaseURL;
  if (rtdbUrl) {
    rtdbInstance = getDatabase(app, rtdbUrl);
  }
} catch {
  rtdbInstance = null;
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const rtdb = rtdbInstance;

// Test firestore server connection on boot without breaking offline mode
export async function testFirestoreConnection() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.info('Firestore offline mode active: Using cached message history & drafts.');
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline note:', error);
    }
  }
}

testFirestoreConnection();

export default app;
