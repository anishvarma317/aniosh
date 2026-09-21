import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  X, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  BookOpen,
  Film,
  DollarSign,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { ClientProject, PENDING_WORK_CONFIG, PendingWorkCategory } from '../types';
import { formatDateString, getDaysDifference, TODAY_STR } from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface ReminderPopupNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ClientProject[];
  onQuickSnooze: (projectId: string, days: number) => void;
  onOpenConfirmModal: (project: ClientProject) => void;
  onQuickMarkResolved: (projectId: string) => void;
  onOpenDraftMessage?: (project: ClientProject) => void;
}

// Gentle in-browser chime sound using Web Audio API
function playGentleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone (523.25 Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Second tone (659.25 Hz - E5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.7);
  } catch {
    // AudioContext blocked or not supported; ignore gracefully
  }
}

export const ReminderPopupNotification: React.FC<ReminderPopupNotificationProps> = ({
  isOpen,
  onClose,
  projects,
  onQuickSnooze,
  onOpenConfirmModal,
  onQuickMarkResolved,
  onOpenDraftMessage,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserAlertAllowed, setBrowserAlertAllowed] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // Filter projects requiring attention today
  const urgentProjects = projects.filter(p => {
    if (p.status === 'resolved' || p.status === 'delivered') return false;
    if (!p.clientPromisedDate) return false;
    const diff = getDaysDifference(p.clientPromisedDate, TODAY_STR);
    return diff <= 0; // Today or overdue
  });

  // Play chime once when popup opens with active reminders
  useEffect(() => {
    if (isOpen && urgentProjects.length > 0 && soundEnabled) {
      playGentleChime();
    }
  }, [isOpen, urgentProjects.length, soundEnabled]);

  if (!isOpen) return null;

  const handleRequestBrowserNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('Desktop notifications are not supported in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setBrowserAlertAllowed(true);
        new Notification('THS Client Tracker', {
          body: `Popup notifications active! You have ${urgentProjects.length} client deadline(s) due.`,
          icon: '/favicon.svg'
        });
      }
    } catch {
      // ignore
    }
  };

  const handleSnoozeAll = () => {
    urgentProjects.forEach(p => onQuickSnooze(p.id, 1));
    onClose();
  };

  const getWorkIcon = (cat: PendingWorkCategory) => {
    switch (cat) {
      case 'album_pending':
        return <BookOpen className="w-3 h-3 text-indigo-600" />;
      case 'selection_pending':
        return <ImageIcon className="w-3 h-3 text-purple-600" />;
      case 'video_changes':
        return <Film className="w-3 h-3 text-amber-600" />;
      case 'payment_pending':
        return <DollarSign className="w-3 h-3 text-emerald-600" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-reminder-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-auto">
        
        {/* Top Header Banner */}
        <div className="bg-zinc-950 text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-zinc-800 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              {urgentProjects.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] sm:text-[11px] font-bold text-white shadow-xs">
                  {urgentProjects.length}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 id="popup-reminder-title" className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                  Client Due Date Reminders
                </h2>
                <span className="inline-flex items-center text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  In-App Notification
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {urgentProjects.length === 0
                  ? 'All caught up! No client deadlines due today.'
                  : `${urgentProjects.length} client${urgentProjects.length > 1 ? 's have' : ' has'} promised updates due today or overdue.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playGentleChime();
              }}
              title={soundEnabled ? 'Chime sound enabled (click to mute)' : 'Sound muted (click to enable)'}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 bg-zinc-50/70">
          {urgentProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-zinc-200 p-6">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">All Client Deadlines Are Clear!</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No clients are overdue or due today. The app will automatically pop up this notification when a client's promised date arrives.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Close Notification
              </button>
            </div>
          ) : (
            urgentProjects.map(project => {
              const diff = getDaysDifference(project.clientPromisedDate, TODAY_STR);
              const isToday = diff === 0;
              const isOverdue = diff < 0;
              const pendingText = formatPendingWorksList(project.pendingWorks);

              return (
                <div
                  key={project.id}
                  className={`rounded-xl border p-3.5 sm:p-4 bg-white shadow-xs transition-all ${
                    isOverdue 
                      ? 'border-rose-300 ring-1 ring-rose-200' 
                      : 'border-amber-300 ring-1 ring-amber-200'
                  }`}
                >
                  {/* Top row: Couple names & Urgency Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-900">
                          {project.coupleNames}
                        </h4>
                        <span className="text-xs text-zinc-500">
                          ({project.contactPerson} • {project.clientPhone})
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 mt-1 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Date Client Promised: <strong className="text-zinc-900">{formatDateString(project.clientPromisedDate)}</strong></span>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="self-start">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{Math.abs(diff)} Day{Math.abs(diff) > 1 ? 's' : ''} Overdue</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Due Today!</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending categories */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Pending Work:
                    </span>
                    {project.pendingWorks.map(pw => {
                      const cfg = PENDING_WORK_CONFIG[pw];
                      return (
                        <span
                          key={pw}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${cfg?.badgeClass}`}
                        >
                          {getWorkIcon(pw)}
                          <span>{cfg?.label || pw}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Notes / Details */}
                  {project.coordinationNeed && (
                    <div className="mt-2 text-xs text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                      <span className="text-zinc-500 font-medium">Notes: </span>
                      {project.coordinationNeed}
                    </div>
                  )}

                  {/* Review Link if provided */}
                  {project.draftReviewLink && (
                    <div className="mt-2">
                      <a
                        href={project.draftReviewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-medium break-all"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>Open Draft Review / Album Link</span>
                      </a>
                    </div>
                  )}

                  {/* Direct Action Buttons inside Notification */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                      <span className="text-zinc-500 text-[11px] font-medium shrink-0">Snooze:</span>
                      <button
                        type="button"
                        onClick={() => onQuickSnooze(project.id, 1)}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-xs transition-colors shrink-0"
                        title="Remind me tomorrow"
                      >
                        +1 Day
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickSnooze(project.id, 2)}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-xs transition-colors shrink-0"
                        title="Remind me in 2 days"
                      >
                        +2 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickSnooze(project.id, 7)}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-xs transition-colors shrink-0"
                        title="Remind me next week"
                      >
                        +7 Days
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
                      {onOpenDraftMessage && (
                        <button
                          type="button"
                          onClick={() => onOpenDraftMessage(project)}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-700 hover:text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                          title="Draft message template"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Draft Msg</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenConfirmModal(project)}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-700 hover:text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Change Date</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onQuickMarkResolved(project.id)}
                        className="col-span-2 sm:col-span-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                        title="Mark received to clear reminder"
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Mark Updated in App</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Control Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {!browserAlertAllowed ? (
              <button
                type="button"
                onClick={handleRequestBrowserNotification}
                className="text-zinc-700 hover:text-zinc-900 underline font-medium flex items-center gap-1 text-[11px] sm:text-xs"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Enable Desktop Notification Alerts</span>
              </button>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px] sm:text-xs">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Desktop notifications enabled</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {urgentProjects.length > 0 && (
              <button
                type="button"
                onClick={handleSnoozeAll}
                className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200 text-center"
              >
                Snooze All (+1d)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-xs text-center"
            >
              Dismiss / Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
