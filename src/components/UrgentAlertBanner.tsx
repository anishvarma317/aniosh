import React from 'react';
import { BellRing, AlertTriangle, FileText, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { ClientProject } from '../types';
import { computeUrgency, getDaysDifference, formatDateString, TODAY_STR } from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface UrgentAlertBannerProps {
  projects: ClientProject[];
  onOpenMessageModal: (project: ClientProject) => void;
  onOpenConfirmModal: (project: ClientProject) => void;
  onOpenReminderPopup?: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  projects,
  onOpenMessageModal,
  onOpenConfirmModal,
  onOpenReminderPopup,
}) => {
  // Find all projects where client promised date is TODAY or in the PAST (overdue), and not yet resolved
  const urgentProjects = projects.filter(p => {
    if (p.status === 'resolved' || p.status === 'delivered') return false;
    const urgency = computeUrgency(p);
    return urgency.isActionRequiredToday;
  });

  if (urgentProjects.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50/80 p-3 sm:p-5 shadow-xs w-full max-w-full overflow-hidden">
      <div className="flex items-start gap-2.5 sm:gap-3 w-full min-w-0">
        <div className="mt-0.5 rounded-lg bg-amber-500/20 p-1.5 sm:p-2 text-amber-900 shrink-0">
          <BellRing className="h-4 w-4 sm:h-5 sm:w-5 text-amber-800 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-amber-950 leading-snug break-words min-w-0">
              {urgentProjects.length} Client Reminder{urgentProjects.length > 1 ? 's' : ''} Due on Exact Promised Date
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              {onOpenReminderPopup && (
                <button
                  type="button"
                  onClick={onOpenReminderPopup}
                  className="text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 px-2.5 sm:px-3 py-1 rounded-lg border border-amber-400 shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  <span>View Notification Popup</span>
                </button>
              )}
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300 shrink-0">
                Active until updated in app
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-amber-900 font-medium leading-relaxed break-words min-w-0">
            These clients gave exact dates to update regarding pending deliverables. The app will remind you with popup notifications until you mark the work updated or log a new date.
          </p>

          <div className="mt-3.5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {urgentProjects.map(project => {
              const daysDiff = project.clientPromisedDate 
                ? getDaysDifference(project.clientPromisedDate, TODAY_STR)
                : null;
              const isToday = daysDiff === 0;
              const isOverdue = daysDiff !== null && daysDiff < 0;
              const pendingText = formatPendingWorksList(project.pendingWorks);

              return (
                <div
                  key={project.id}
                  className={`flex flex-col justify-between rounded-lg p-3 sm:p-3.5 border shadow-2xs w-full min-w-0 overflow-hidden ${
                    isOverdue 
                      ? 'bg-rose-50/90 border-rose-200' 
                      : 'bg-white border-amber-200'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-xs min-w-0">
                      <span className="font-bold text-zinc-900 truncate flex-1 min-w-0">
                        {project.coupleNames}
                      </span>
                      {isToday && (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                          <BellRing className="w-3 h-3" /> Today!
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
                          <AlertTriangle className="w-3 h-3" /> {Math.abs(daysDiff!)}d Overdue!
                        </span>
                      )}
                    </div>

                    {/* Pending work reminder badge */}
                    <div className="text-xs font-semibold text-zinc-800 bg-white/80 p-1.5 rounded border border-zinc-200/70 min-w-0 break-words">
                      <span className="text-zinc-500 font-medium">Pending: </span>
                      <span className="text-amber-950 font-bold">{pendingText}</span>
                    </div>

                    <div className="text-[11px] text-zinc-600 truncate min-w-0">
                      Promised Date: <strong className="text-zinc-800">{formatDateString(project.clientPromisedDate)}</strong>
                    </div>

                    {project.coordinationNeed && (
                      <div className="text-[11px] text-zinc-600 truncate italic min-w-0">
                        "{project.coordinationNeed}"
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-200/70 grid grid-cols-2 gap-2 w-full min-w-0">
                    <button
                      onClick={() => onOpenMessageModal(project)}
                      className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 py-1.5 px-1.5 rounded-md transition-colors shadow-2xs min-w-0"
                    >
                      <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">Draft Message</span>
                    </button>
                    <button
                      onClick={() => onOpenConfirmModal(project)}
                      className="w-full inline-flex items-center justify-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 py-1.5 px-1.5 rounded-md transition-colors border border-emerald-300 min-w-0"
                      title="Mark update received or record revised date"
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Mark Updated</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
