import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, CheckCircle2 } from 'lucide-react';
import { ClientProject } from '../types';
import { generateWeddingWhatsAppMessages, GeneratedTemplate } from '../utils/messageTemplates';

interface MessageGeneratorModalProps {
  isOpen: boolean;
  project: ClientProject | null;
  onClose: () => void;
  onMarkPingSent: (projectId: string, channel: string, messageNote: string) => void;
}

export const MessageGeneratorModal: React.FC<MessageGeneratorModalProps> = ({
  isOpen,
  project,
  onClose,
  onMarkPingSent,
}) => {
  const [templates, setTemplates] = useState<GeneratedTemplate[]>([]);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [editedBody, setEditedBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      const generated = generateWeddingWhatsAppMessages(project);
      setTemplates(generated);
      setSelectedTemplateIndex(0);
      setEditedBody(generated[0]?.body || '');
      setCopied(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    setEditedBody(templates[index]?.body || '');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentTemplate = templates[selectedTemplateIndex];

  const handleLogAndClose = () => {
    onMarkPingSent(
      project.id, 
      'Manual Message', 
      `Drafted/sent ${currentTemplate?.title}: "${editedBody.slice(0, 80)}..."`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-xl bg-white shadow-xl border border-zinc-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-900 shrink-0">
              <FileText className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-900 truncate">
                Client Message & Outreach Drafts
              </h2>
              <p className="text-xs text-zinc-500 truncate">
                Couple: <strong className="text-zinc-800">{project.coupleNames}</strong> • {project.clientPhone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Select Message Draft Angle:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(idx)}
                  className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                    selectedTemplateIndex === idx
                      ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="font-semibold truncate">{tpl.title}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedTemplateIndex === idx ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {tpl.tone}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700">
                Message Text (Editable for manual copying):
              </label>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Wedding deliverable update reminder
              </span>
            </div>
            <textarea
              rows={6}
              value={editedBody}
              onChange={e => setEditedBody(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-3 text-xs leading-relaxed text-zinc-900 focus:border-zinc-900 focus:outline-none font-sans"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              <span>{copied ? 'Message Copied to Clipboard!' : 'Copy Message Text'}</span>
            </button>

            <button
              onClick={handleLogAndClose}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
              title="Record this note and close"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Save Note & Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
