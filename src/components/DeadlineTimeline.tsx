import React from 'react';
import { Calendar, CheckCircle, Clock, BellRing, AlertTriangle, FileText } from 'lucide-react';
import { ClientProject, PENDING_WORK_CONFIG } from '../types';
import { formatDateString, getDaysDifference, TODAY_STR } from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface DeadlineTimelineProps {
  projects: ClientProject[];
  onSelectProject: (project: ClientProject) => void;
  onConfirmDateModal: (project: ClientProject) => void;
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({
  projects,
  onSelectProject,
  onConfirmDateModal,
}) => {
  // Sort projects by client promised date ascending
  const sortedProjects = [...projects].sort((a, b) => {
    if (!a.clientPromisedDate) return 1;
    if (!b.clientPromisedDate) return -1;
    return new Date(a.clientPromisedDate).getTime() - new Date(b.clientPromisedDate).getTime();
  });

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-3.5 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-zinc-100 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-700 shrink-0" />
            <span>Client-Promised Dates Schedule</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organized chronologically by the exact date each client provided to send their updates or payment.
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0">
          {projects.length} Clients Tracked
        </span>
      </div>

      <div className="space-y-3">
        {sortedProjects.map(project => {
          const daysDiff = project.clientPromisedDate 
            ? getDaysDifference(project.clientPromisedDate, TODAY_STR)
            : null;
          const isResolved = project.status === 'resolved' || project.status === 'delivered';
          const isToday = daysDiff === 0;
          const isOverdue = daysDiff !== null && daysDiff < 0;
          const pendingText = formatPendingWorksList(project.pendingWorks);

          return (
            <div
              key={project.id}
              className={`rounded-lg border p-4 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                isResolved
                  ? 'bg-zinc-50/50 border-zinc-200'
                  : isOverdue
                    ? 'bg-rose-50/50 border-rose-300'
                    : isToday
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-zinc-50/50 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900">
                    {project.coupleNames}
                  </span>
                  
                  {isResolved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> Updated in App
                    </span>
                  ) : isToday ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300 animate-pulse">
                      <BellRing className="w-3 h-3" /> Due Today!
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded border border-rose-300">
                      <AlertTriangle className="w-3 h-3" /> {Math.abs(daysDiff!)}d Overdue (Keep Reminding)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                      <Clock className="w-3 h-3" /> Due in {daysDiff} days
                    </span>
                  )}
                </div>

                {/* Pending categories */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-zinc-500">Pending:</span>
                  {project.pendingWorks.map(pw => (
                    <span
                      key={pw}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${PENDING_WORK_CONFIG[pw]?.badgeClass}`}
                    >
                      {PENDING_WORK_CONFIG[pw]?.label}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-zinc-600 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-zinc-800 font-medium">
                    Date Client Provided: <strong className="underline">{formatDateString(project.clientPromisedDate)}</strong>
                  </span>
                  <span>•</span>
                  <span>Contact: {project.contactPerson} ({project.clientPhone})</span>
                </div>

                {project.coordinationNeed && (
                  <div className="text-[11px] text-zinc-500 italic">
                    Note: "{project.coordinationNeed}"
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                <button
                  onClick={() => onSelectProject(project)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-2xs"
                  title="Draft message template"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Draft Message</span>
                </button>

                <button
                  onClick={() => onConfirmDateModal(project)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>Update Date</span>
                </button>

                <button
                  onClick={() => onConfirmDateModal(project)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isResolved ? 'Mark Delivered' : 'Mark Updated'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
