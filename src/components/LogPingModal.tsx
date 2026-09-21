import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Send, Check } from 'lucide-react';
import { ClientProject } from '../types';
import { TODAY_STR, addDays } from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface LogPingModalProps {
  isOpen: boolean;
  project: ClientProject | null;
  onClose: () => void;
  onSaveLog: (projectId: string, logData: {
    channel: 'WhatsApp' | 'Phone Call' | 'Email';
    actionTaken: string;
    clientResponse?: string;
    newPromisedDate?: string;
    nextReminderDate: string;
    isResolved?: boolean;
  }) => void;
}

export const LogPingModal: React.FC<LogPingModalProps> = ({
  isOpen,
  project,
  onClose,
  onSaveLog,
}) => {
  const [channel, setChannel] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [actionTaken, setActionTaken] = useState('');
  const [clientResponse, setClientResponse] = useState('');
  const [hasNewPromisedDate, setHasNewPromisedDate] = useState(false);
  const [newPromisedDate, setNewPromisedDate] = useState(TODAY_STR);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setChannel('WhatsApp');
      setActionTaken('');
      setClientResponse('');
      setHasNewPromisedDate(false);
      setNewPromisedDate(project.clientPromisedDate || addDays(TODAY_STR, 2));
      setIsResolved(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const pendingText = formatPendingWorksList(project.pendingWorks);

  const quickActionPresets = [
    `Sent WhatsApp reminder for ${pendingText}`,
    'Client replied: will review tonight and send notes',
    'Client requested 2 more days to finish selection',
    'Client transferred milestone payment',
    'Client sent song changes and timecode list'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTaken.trim()) {
      alert('Please describe what outreach or client response occurred.');
      return;
    }

    const nextReminderDate = hasNewPromisedDate && newPromisedDate 
      ? newPromisedDate 
      : (project.clientPromisedDate || TODAY_STR);

    onSaveLog(project.id, {
      channel,
      actionTaken: actionTaken.trim(),
      clientResponse: clientResponse.trim() || undefined,
      newPromisedDate: hasNewPromisedDate ? newPromisedDate : undefined,
      nextReminderDate,
      isResolved,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col rounded-xl bg-white shadow-xl border border-zinc-200 my-auto overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-zinc-900 truncate">
              Log WhatsApp Follow-up & Client Reply
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              Client: <span className="font-semibold text-zinc-800">{project.coupleNames}</span> • Pending: {pendingText}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Channel Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['WhatsApp', 'Phone Call', 'Email'] as const).map(ch => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    channel === ch
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              What action was taken?
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickActionPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActionTaken(preset)}
                  className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-1 rounded transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              required
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder="e.g. Sent WhatsApp check-in asking about the album layout proof..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Client Response Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Client's WhatsApp Reply (Optional)
            </label>
            <input
              type="text"
              value={clientResponse}
              onChange={e => setClientResponse(e.target.value)}
              placeholder="e.g. 'Both of us are working late, will check this Sunday without fail!'"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Did client give a new promised date? */}
          <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNewPromisedDate}
                onChange={e => setHasNewPromisedDate(e.target.checked)}
                className="rounded border-zinc-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-sky-900">
                Did the client give a new promised date?
              </span>
            </label>

            {hasNewPromisedDate && (
              <div className="pt-2 pl-6">
                <label className="block text-xs font-semibold text-sky-900 mb-1">
                  New Date Client Provided:
                </label>
                <input
                  type="date"
                  value={newPromisedDate}
                  onChange={e => setNewPromisedDate(e.target.value)}
                  className="w-full rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs focus:outline-none font-semibold"
                />
                <span className="text-[11px] text-sky-700 mt-1 block">
                  The app will reschedule your exact reminder for this date!
                </span>
              </div>
            )}
          </div>

          {/* Mark Resolved Option */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isResolved}
                onChange={e => setIsResolved(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-emerald-900">
                Client completed the update! Mark as updated in app to stop reminders.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
            >
              Save Log & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
