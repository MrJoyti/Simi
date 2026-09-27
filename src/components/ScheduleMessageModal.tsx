import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Clock,
  Calendar,
  X,
  Send,
  Trash2,
  Zap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  onScheduledSuccess: () => void;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  messageText,
  onScheduledSuccess,
}) => {
  const {
    currentRoomId,
    scheduleMessage,
    scheduledMessages,
    cancelScheduledMessage,
    sendScheduledMessageNow,
    replyingTo,
    theme,
  } = useChat();

  const isMale = theme === 'midnight';
  const [activeTab, setActiveTab] = useState<'schedule' | 'manage'>('schedule');

  // Filter scheduled messages for this specific room
  const roomScheduled = useMemo(() => {
    return scheduledMessages.filter(
      (m) => m.roomId === currentRoomId && m.status === 'scheduled'
    );
  }, [scheduledMessages, currentRoomId]);

  // Compute default scheduled time: 30 minutes from now formatted for datetime-local
  const getDefaultDateTime = () => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:mm in local time
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [selectedDateTime, setSelectedDateTime] = useState<string>(getDefaultDateTime);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute minimum datetime allowed (current minute)
  const minDateTime = useMemo(() => {
    const d = new Date(Date.now() + 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, [isOpen]);

  if (!isOpen) return null;

  // Relative label calculation for preview
  const scheduledTimeMs = new Date(selectedDateTime).getTime();
  const diffMs = scheduledTimeMs - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  const getRelativeSummary = () => {
    if (isNaN(scheduledTimeMs)) return 'Select a valid date and time';
    if (diffMs <= 0) return 'Please pick a time in the future';

    const dateObj = new Date(scheduledTimeMs);
    const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const isToday = new Date().toDateString() === dateObj.toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = tomorrow.toDateString() === dateObj.toDateString();

    const dateLabel = isToday
      ? 'Today'
      : isTomorrow
      ? 'Tomorrow'
      : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (diffMinutes < 60) {
      return `Will be sent in ${diffMinutes} minutes (${dateLabel} at ${timeStr})`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMins = diffMinutes % 60;
    return `Will be sent in ~${diffHours}h ${remainingMins > 0 ? remainingMins + 'm' : ''} (${dateLabel} at ${timeStr})`;
  };

  // Quick Preset Helper
  const applyPreset = (minutesToAdd: number) => {
    sounds.playClick();
    setErrorMsg(null);
    const d = new Date(Date.now() + minutesToAdd * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setSelectedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const applyTomorrowMorning = () => {
    sounds.playClick();
    setErrorMsg(null);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDateTime(`${year}-${month}-${day}T09:00`);
  };

  const applyTonightEvening = () => {
    sounds.playClick();
    setErrorMsg(null);
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    if (d.getTime() <= Date.now() + 10 * 60 * 1000) {
      // Already past 8 PM today, set to tomorrow 8 PM
      d.setDate(d.getDate() + 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDateTime(`${year}-${month}-${day}T20:00`);
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setErrorMsg('Please write a message first before scheduling.');
      return;
    }

    const targetTime = new Date(selectedDateTime).getTime();
    if (isNaN(targetTime) || targetTime <= Date.now() + 30000) {
      setErrorMsg('Scheduled time must be at least 1 minute in the future.');
      return;
    }

    if (!currentRoomId) {
      setErrorMsg('No active chat room selected.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await scheduleMessage(currentRoomId, messageText.trim(), targetTime);
      onScheduledSuccess();
      onClose();
    } catch (err) {
      setErrorMsg('Failed to schedule message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className={`rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 ${
        isMale ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-pink-100 text-slate-800'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${
          isMale
            ? 'bg-slate-950/80 border-slate-800'
            : 'bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-pink-100/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs ${
              isMale ? 'bg-blue-600' : 'bg-gradient-to-tr from-pink-500 to-rose-400'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-extrabold tracking-tight ${isMale ? 'text-white' : 'text-slate-800'}`}>
                Schedule Message
              </h3>
              <p className={`text-[11px] font-medium ${isMale ? 'text-blue-400' : 'text-pink-600'}`}>
                Sent automatically via Firebase background triggers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-full transition-colors ${
              isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (Schedule New vs View Existing) */}
        <div className={`flex items-center border-b px-4 pt-2 gap-2 ${
          isMale ? 'bg-slate-950 border-slate-800' : 'bg-pink-50/30 border-pink-100'
        }`}>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('schedule');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'schedule'
                ? isMale
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-pink-600 border-b-2 border-pink-500'
                : isMale
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Schedule Message
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('manage');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? isMale
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-pink-600 border-b-2 border-pink-500'
                : isMale
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Pending</span>
            {roomScheduled.length > 0 && (
              <span className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold ${
                isMale ? 'bg-blue-600' : 'bg-rose-500'
              }`}>
                {roomScheduled.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Schedule Form */}
        {activeTab === 'schedule' ? (
          <form onSubmit={handleConfirmSchedule} className="p-5 flex-1 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Message Preview Box */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isMale ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Message Preview
              </label>
              <div className={`p-3 rounded-2xl border text-xs font-medium max-h-24 overflow-y-auto ${
                isMale ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-pink-50/50 border-pink-100 text-slate-700'
              }`}>
                {replyingTo && (
                  <div className={`text-[10px] mb-1 border-l-2 pl-2 ${
                    isMale ? 'text-blue-400 border-blue-500' : 'text-pink-600 border-pink-400'
                  }`}>
                    Replying to {replyingTo.senderName}: &quot;{replyingTo.text.slice(0, 40)}&quot;
                  </div>
                )}
                {messageText.trim() ? (
                  <p className="whitespace-pre-wrap break-words">{messageText}</p>
                ) : (
                  <p className="text-slate-500 italic">No message text entered yet in chat input</p>
                )}
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isMale ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(15)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    isMale
                      ? 'bg-slate-950 hover:bg-slate-800 text-blue-400 border-slate-800'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200/60'
                  }`}
                >
                  ⏱️ In 15 mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(30)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    isMale
                      ? 'bg-slate-950 hover:bg-slate-800 text-blue-400 border-slate-800'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200/60'
                  }`}
                >
                  ⏱️ In 30 mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(60)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    isMale
                      ? 'bg-slate-950 hover:bg-slate-800 text-blue-400 border-slate-800'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200/60'
                  }`}
                >
                  ⏱️ In 1 hour
                </button>
                <button
                  type="button"
                  onClick={applyTonightEvening}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    isMale
                      ? 'bg-slate-950 hover:bg-slate-800 text-indigo-400 border-slate-800'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200/60'
                  }`}
                >
                  Tonight (8:00 PM)
                </button>
                <button
                  type="button"
                  onClick={applyTomorrowMorning}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    isMale
                      ? 'bg-slate-950 hover:bg-slate-800 text-cyan-400 border-slate-800'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60'
                  }`}
                >
                  Tomorrow (9:00 AM)
                </button>
              </div>
            </div>

            {/* Date & Time Picker */}
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isMale ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Custom Date & Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={selectedDateTime}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setSelectedDateTime(e.target.value);
                  }}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                    isMale
                      ? 'bg-slate-950 border border-slate-800 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Delivery Time Summary Card */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
              isMale
                ? 'bg-blue-950/40 border-blue-900/60'
                : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200/80'
            }`}>
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isMale ? 'text-blue-400' : 'text-emerald-500'}`} />
              <div className="min-w-0">
                <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                  isMale ? 'text-blue-400' : 'text-pink-700'
                }`}>
                  Delivery Plan
                </span>
                <span className={`text-xs font-semibold truncate block ${isMale ? 'text-slate-200' : 'text-slate-700'}`}>
                  {getRelativeSummary()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 px-4 rounded-2xl border font-bold text-xs transition-colors ${
                  isMale
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !messageText.trim() || diffMs <= 0}
                className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSubmitting || !messageText.trim() || diffMs <= 0
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                    : isMale
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200 hover:opacity-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Scheduling...' : 'Schedule Message'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Manage Pending Scheduled Messages for this room */
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {roomScheduled.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Calendar className={`w-10 h-10 mx-auto mb-2 ${isMale ? 'text-slate-700' : 'text-pink-200'}`} />
                <p className={`text-xs font-bold ${isMale ? 'text-slate-300' : 'text-slate-600'}`}>No scheduled messages for this chat</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pick a date and time to send a message automatically.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`mt-3 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isMale
                      ? 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/40'
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              roomScheduled.map((item) => {
                const targetTime = new Date(item.scheduledFor);
                const isDue = item.scheduledFor <= Date.now();
                const timeString = targetTime.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                });
                const dateString = targetTime.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                const minutesLeft = Math.max(0, Math.round((item.scheduledFor - Date.now()) / 60000));

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border shadow-xs flex flex-col gap-2 transition-all ${
                      isMale
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-white/95 border-pink-100 hover:border-pink-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isMale
                          ? 'bg-blue-950 text-blue-400 border-blue-900/60'
                          : 'bg-pink-50 text-pink-600 border-pink-200/50'
                      }`}>
                        <Clock className={`w-3 h-3 ${isMale ? 'text-blue-400' : 'text-pink-500'}`} />
                        <span>
                          {isDue ? 'Sending now...' : `In ~${minutesLeft} mins (${dateString} at ${timeString})`}
                        </span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => sendScheduledMessageNow(item.id)}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Send immediately now"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Send now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelScheduledMessage(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Cancel scheduled message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs whitespace-pre-wrap font-medium pl-1 ${isMale ? 'text-slate-200' : 'text-slate-700'}`}>
                      {item.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

