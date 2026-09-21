import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, CheckCircle, BellRing } from 'lucide-react';
import { ClientProject } from '../types';
import { formatDateString, addDays, TODAY_STR } from '../utils/dateUtils';
import { formatPendingWorksList } from '../utils/messageTemplates';

interface ConfirmDateModalProps {
  isOpen: boolean;
  project: ClientProject | null;
  onClose: () => void;
  onConfirmPromisedDate: (
    projectId: string, 
    promisedDate: string, 
    isResolved: boolean, 
    notes?: string
  ) => void;
}

export const ConfirmDateModal: React.FC<ConfirmDateModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirmPromisedDate,
}) => {
  const [mode, setMode] = useState<'record_date' | 'mark_resolved'>('record_date');
  const [promisedDate, setPromisedDate] = useState(TODAY_STR);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (project) {
      setPromisedDate(project.clientPromisedDate || TODAY_STR);
      setMode(project.status === 'resolved' ? 'mark_resolved' : 'record_date');
      setNotes('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const pendingText = formatPendingWorksList(project.pendingWorks);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'record_date' && !promisedDate) {
      alert('Please select the date the client promised to update you by.');
      return;
    }

    onConfirmPromisedDate(
      project.id,
      promisedDate,
      mode === 'mark_resolved',
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col rounded-xl bg-white shadow-xl border border-zinc-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-900">
              <Calendar className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Update Client Status & Date
              </h2>
              <p className="text-xs text-zinc-500">
                Client: <strong className="text-zinc-800">{project.coupleNames}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* Pending items reminder notice */}
          <div className="text-xs bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
            <span className="text-zinc-500 font-medium">Pending Works: </span>
            <strong className="text-zinc-900">{pendingText}</strong>
          </div>

          {/* Toggle between recording a new promised date vs marking resolved */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('record_date')}
              className={`py-2 rounded-md transition-all ${
                mode === 'record_date'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              📅 Client Gave a Date
            </button>
            <button
              type="button"
              onClick={() => setMode('mark_resolved')}
              className={`py-2 rounded-md transition-all ${
                mode === 'mark_resolved'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ✅ Mark Updated in App
            </button>
          </div>

          {mode === 'record_date' ? (
            <div className="space-y-3">
              <div className="bg-sky-50/80 p-3 rounded-lg border border-sky-200 text-xs text-sky-900">
                Record the date the client promised on WhatsApp that they will send the update. The app will remind you on this exact date.
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Promised Date from Client *
                </label>
                <input
                  type="date"
                  required
                  value={promisedDate}
                  onChange={e => setPromisedDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-500">Quick set:</span>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 2 Days', days: 2 },
                    { label: 'This Weekend (3d)', days: 3 },
                    { label: 'Next Week (7d)', days: 7 },
                  ].map(quick => (
                    <button
                      key={quick.days}
                      type="button"
                      onClick={() => setPromisedDate(addDays(TODAY_STR, quick.days))}
                      className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded transition-colors"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Mark Update Received in App</span>
                </div>
                <p>
                  This stops all daily reminders and overdue alerts for this client for {pendingText}.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              WhatsApp Reply or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Client confirmed on WhatsApp: 'Sent the song changes and photo list!'"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                mode === 'mark_resolved' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {mode === 'mark_resolved' ? 'Confirm Update Received' : 'Save Promised Date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
