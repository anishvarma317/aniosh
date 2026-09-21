import React from 'react';
import { Plus, SlidersHorizontal, AlertTriangle, CheckCircle2, Film, Clock, CalendarDays, BellRing } from 'lucide-react';
import { formatDateString, TODAY_STR, computeUrgency } from '../utils/dateUtils';
import { ClientProject, PendingWorkCategory, PENDING_WORK_CONFIG, UserWorkflowPreferences } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  projects: ClientProject[];
  preferences?: UserWorkflowPreferences;
  onOpenNewModal: () => void;
  onOpenQuestionnaire: () => void;
  onOpenReminderPopup?: () => void;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  preferences,
  onOpenNewModal,
  onOpenQuestionnaire,
  onOpenReminderPopup,
  activeFilter,
  onSelectFilter,
}) => {
  const needsActionCount = projects.filter(p => {
    if (p.status === 'resolved' || p.status === 'delivered') return false;
    return computeUrgency(p).isActionRequiredToday;
  }).length;

  const resolvedCount = projects.filter(p => p.status === 'resolved' || p.status === 'delivered').length;

  // Category counts
  const albumPendingCount = projects.filter(p => (p.status !== 'resolved') && p.pendingWorks?.includes('album_pending')).length;
  const selectionPendingCount = projects.filter(p => (p.status !== 'resolved') && p.pendingWorks?.includes('selection_pending')).length;
  const videoChangesCount = projects.filter(p => (p.status !== 'resolved') && p.pendingWorks?.includes('video_changes')).length;
  const paymentPendingCount = projects.filter(p => (p.status !== 'resolved') && p.pendingWorks?.includes('payment_pending')).length;

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              {/* Studio Logo Icon / Custom Image / Monogram */}
              <button
                type="button"
                onClick={onOpenQuestionnaire}
                className="group relative cursor-pointer focus:outline-none"
                title="Click to customize Studio Logo & Settings"
              >
                {preferences?.studioLogoUrl ? (
                  <img
                    src={preferences.studioLogoUrl}
                    alt={preferences.studioName || 'App Logo'}
                    className="h-10 w-10 rounded-lg object-contain bg-zinc-950 p-1 border border-zinc-300 shadow-xs group-hover:border-amber-500 transition-colors"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-xs border border-zinc-800 group-hover:border-amber-400/80 transition-colors">
                    {preferences?.logoText ? (
                      <span className="font-black text-xs text-amber-400 tracking-wider">
                        {preferences.logoText}
                      </span>
                    ) : (
                      <Film className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                )}
              </button>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                  <span>{preferences?.studioName || 'THS'}</span>
                  <span className="text-sm font-normal text-zinc-400">|</span>
                  <span className="text-sm font-medium text-zinc-700">Client Tracker</span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    Exact Date Reminders
                  </span>
                </h1>
                <p className="text-xs text-zinc-500 font-medium">
                  Track client-promised dates for Album, Selection, Video Changes & Payment • Today: <span className="font-semibold text-zinc-700">{formatDateString(TODAY_STR)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <PWAInstallButton />

            {onOpenReminderPopup && (
              <button
                id="open-reminder-popup-btn"
                onClick={onOpenReminderPopup}
                className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 shadow-2xs cursor-pointer shrink-0"
                title="Open In-App Reminder Popup"
              >
                <BellRing className={`w-4 h-4 text-amber-800 shrink-0 ${needsActionCount > 0 ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Popup Alerts</span>
                <span className="sm:hidden">Alerts</span>
                {needsActionCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-black text-white shrink-0">
                    {needsActionCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="open-questionnaire-btn"
              onClick={onOpenQuestionnaire}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200 shrink-0"
              title="Configure studio preferences"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="hidden sm:inline">Studio Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>

            <button
              id="new-coordination-btn"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Add New Client</span>
              <span className="sm:hidden">+ Client</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar by Status & Category */}
        <div className="w-full min-w-0 py-2 border-t border-zinc-100 text-xs flex items-center justify-between gap-3">
          <div className="w-full min-w-0 overflow-x-auto flex items-center gap-1.5 pb-1 touch-pan-x overscroll-x-contain">
            <button
              id="filter-all-btn"
              onClick={() => onSelectFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All Clients ({projects.length})
            </button>

            <button
              id="filter-action-btn"
              onClick={() => onSelectFilter('action_needed')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                activeFilter === 'action_needed'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Remind Today / Overdue ({needsActionCount})</span>
              <span className="sm:hidden">Due / Overdue ({needsActionCount})</span>
            </button>

            <span className="text-zinc-300 mx-0.5 shrink-0">|</span>

            {/* Category quick filters */}
            <button
              onClick={() => onSelectFilter('cat_album')}
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'cat_album'
                  ? 'bg-indigo-700 text-white font-semibold'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <span>Album Pending ({albumPendingCount})</span>
            </button>

            <button
              onClick={() => onSelectFilter('cat_selection')}
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'cat_selection'
                  ? 'bg-purple-700 text-white font-semibold'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span>Selection Pending ({selectionPendingCount})</span>
            </button>

            <button
              onClick={() => onSelectFilter('cat_video')}
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'cat_video'
                  ? 'bg-amber-700 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>Video Changes ({videoChangesCount})</span>
            </button>

            <button
              onClick={() => onSelectFilter('cat_payment')}
              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'cat_payment'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>Payment Pending ({paymentPendingCount})</span>
            </button>

            <span className="text-zinc-300 mx-0.5 shrink-0">|</span>

            <button
              id="filter-resolved-btn"
              onClick={() => onSelectFilter('resolved')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'resolved'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Updated in App ({resolvedCount})</span>
            </button>
          </div>

          <div className="text-zinc-500 text-xs hidden xl:flex items-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Keeps reminding until marked updated in app
          </div>
        </div>
      </div>
    </header>
  );
};
