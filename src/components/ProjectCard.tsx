import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Trash2, 
  Phone,
  ExternalLink,
  BookOpen,
  Film,
  DollarSign,
  Image,
  BellRing
} from 'lucide-react';
import { ClientProject, PENDING_WORK_CONFIG, PendingWorkCategory } from '../types';
import { 
  computeUrgency, 
  formatDateString, 
  getDaysDifference, 
  TODAY_STR 
} from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface ProjectCardProps {
  project: ClientProject;
  onOpenMessageModal: (project: ClientProject) => void;
  onOpenLogModal: (project: ClientProject) => void;
  onConfirmDateModal: (project: ClientProject) => void;
  onEditProject: (project: ClientProject) => void;
  onDeleteProject: (projectId: string) => void;
  onQuickSnooze: (projectId: string, days: number) => void;
  onQuickMarkResolved?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenMessageModal,
  onOpenLogModal,
  onConfirmDateModal,
  onEditProject,
  onDeleteProject,
  onQuickSnooze,
  onQuickMarkResolved,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const urgency = computeUrgency(project);
  const isResolved = project.status === 'resolved' || project.status === 'delivered';

  const daysDiff = project.clientPromisedDate 
    ? getDaysDifference(project.clientPromisedDate, TODAY_STR)
    : null;
  const isToday = daysDiff === 0;
  const isOverdue = daysDiff !== null && daysDiff < 0;

  const pendingText = formatPendingWorksList(project.pendingWorks);

  const getWorkIcon = (cat: PendingWorkCategory) => {
    switch (cat) {
      case 'album_pending':
        return <BookOpen className="w-3 h-3 text-indigo-600" />;
      case 'selection_pending':
        return <Image className="w-3 h-3 text-purple-600" />;
      case 'video_changes':
        return <Film className="w-3 h-3 text-amber-600" />;
      case 'payment_pending':
        return <DollarSign className="w-3 h-3 text-emerald-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
      isOverdue && !isResolved
        ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
        : isToday && !isResolved
          ? 'border-amber-300 shadow-xs ring-1 ring-amber-200'
          : 'border-zinc-200 shadow-2xs hover:shadow-xs'
    }`}>
      <div>
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-wrap items-start justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base text-zinc-900 tracking-tight">
                {project.coupleNames}
              </h3>
              {project.weddingDate && (
                <span className="text-[11px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded font-medium">
                  Wedding: {formatDateString(project.weddingDate)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span>Contact: <strong className="text-zinc-800">{project.contactPerson}</strong></span>
              <span>•</span>
              <span className="font-medium text-zinc-700">{project.clientPhone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Pill */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${urgency.badgeClass}`}>
              {isOverdue && !isResolved && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
              {isToday && !isResolved && <BellRing className="w-3.5 h-3.5 text-amber-700 animate-pulse" />}
              {isResolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              {!isResolved && !isOverdue && !isToday && <Clock className="w-3.5 h-3.5 text-sky-600" />}
              
              {isResolved 
                ? 'Updated / Completed' 
                : isOverdue 
                  ? `${Math.abs(daysDiff!)}d Overdue (Keep Reminding!)` 
                  : isToday 
                    ? 'Due Today!' 
                    : `Promised in ${daysDiff}d`}
            </span>

            <div className="flex items-center text-zinc-400">
              <button
                onClick={() => onEditProject(project)}
                className="p-1 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                title="Edit Client & Works"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="p-1 hover:text-rose-600 hover:bg-zinc-100 rounded transition-colors"
                title="Delete Client"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories & Reminder Card */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Pending Works Category Badges */}
          <div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Pending Works from Client:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {project.pendingWorks && project.pendingWorks.length > 0 ? (
                project.pendingWorks.map(pw => {
                  const cfg = PENDING_WORK_CONFIG[pw];
                  return (
                    <span
                      key={pw}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${cfg?.badgeClass}`}
                    >
                      {getWorkIcon(pw)}
                      <span>{cfg?.label || pw}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-zinc-400">No category assigned</span>
              )}
            </div>
          </div>

          {/* Coordination Need / Specific Notes */}
          {project.coordinationNeed && (
            <div className="text-xs text-zinc-700 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/70">
              <strong className="text-zinc-900">Details:</strong> {project.coordinationNeed}
            </div>
          )}

          {/* Draft Review Link if available */}
          {project.draftReviewLink && (
            <div className="flex items-center gap-2">
              <a
                href={project.draftReviewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-1 rounded border border-sky-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Review / Album Link</span>
              </a>
            </div>
          )}

          {/* EXACT DATE CLIENT PROVIDED REMINDER BOX */}
          <div className={`p-3 rounded-lg border transition-all ${
            isResolved 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
              : isOverdue 
                ? 'bg-rose-50 border-rose-300 text-rose-950' 
                : isToday 
                  ? 'bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-300' 
                  : 'bg-sky-50/60 border-sky-200 text-sky-950'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Calendar className="w-4 h-4 shrink-0 text-zinc-700" />
                <span>Date Client Provided:</span>
                <span className="underline decoration-2 underline-offset-2">
                  {formatDateString(project.clientPromisedDate)}
                </span>
              </div>

              {isResolved ? (
                <p className="text-[11px] text-emerald-800 font-medium">
                  ✅ Client update received and marked complete in app!
                </p>
              ) : isToday ? (
                <p className="text-xs font-bold text-amber-900">
                  🔔 Exact promised date is TODAY! Check client updates for {pendingText}.
                </p>
              ) : isOverdue ? (
                <p className="text-xs font-bold text-rose-800">
                  ⚠️ {Math.abs(daysDiff!)} day{Math.abs(daysDiff!) > 1 ? 's' : ''} overdue! Still pending update in app. Reminder active.
                </p>
              ) : (
                <p className="text-[11px] text-sky-800 font-medium">
                  Client promised to update in {daysDiff} days. App will remind you with a popup on {formatDateString(project.clientPromisedDate)}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-zinc-50 p-4 border-t border-zinc-200 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-zinc-500 font-medium">
            {project.totalFollowUpsSent > 0 ? (
              <span>{project.totalFollowUpsSent} follow-up log{project.totalFollowUpsSent > 1 ? 's' : ''} recorded</span>
            ) : (
              <span>Automatic popup reminder active</span>
            )}
          </div>

          {!isResolved && (
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-zinc-400">Snooze:</span>
              <button
                onClick={() => onQuickSnooze(project.id, 1)}
                className="px-1.5 py-0.5 rounded hover:bg-zinc-200 text-zinc-600 font-medium"
                title="Remind me tomorrow"
              >
                +1d
              </button>
              <button
                onClick={() => onQuickSnooze(project.id, 2)}
                className="px-1.5 py-0.5 rounded hover:bg-zinc-200 text-zinc-600 font-medium"
                title="Remind me in 2 days"
              >
                +2d
              </button>
            </div>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onOpenMessageModal(project)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
            title="View message draft templates to copy"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Draft Message</span>
          </button>

          <button
            onClick={() => onConfirmDateModal(project)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Update client promised date or record notes"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Update Date</span>
          </button>

          <button
            onClick={() => onConfirmDateModal(project)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors col-span-2 sm:col-span-1 ${
              isResolved 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
            }`}
            title="Mark updated in app to stop reminders"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isResolved ? 'Mark Delivered' : 'Mark Updated'}</span>
          </button>
        </div>

        {/* History Accordion Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-[11px] font-medium text-zinc-600 hover:text-zinc-800 py-1"
          >
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              <span>Outreach & Reply History ({project.logs?.length || 0})</span>
            </span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 pt-2 border-t border-zinc-200/80 max-h-48 overflow-y-auto">
              {project.logs && project.logs.length > 0 ? (
                project.logs.map(log => (
                  <div key={log.id} className="text-[11px] p-2 bg-white rounded border border-zinc-200/70">
                    <div className="flex items-center justify-between text-zinc-400 mb-0.5">
                      <span className="font-semibold text-zinc-700">{log.channel}</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-zinc-800 font-medium">{log.actionTaken}</div>
                    {log.clientResponse && (
                      <div className="mt-1 text-zinc-600 italic bg-zinc-50 p-1.5 rounded border border-zinc-100">
                        Client: "{log.clientResponse}"
                      </div>
                    )}
                    {log.newPromisedDate && (
                      <div className="mt-1 text-sky-700 font-semibold text-[10px]">
                        📅 Client promised to update by: {formatDateString(log.newPromisedDate)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-zinc-400 py-1 text-center">
                  No WhatsApp logs recorded yet. Use "Send Message" above!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
