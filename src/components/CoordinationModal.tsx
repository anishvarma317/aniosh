import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Check, ChevronDown, BookOpen, Film, DollarSign, Image, Sparkles } from 'lucide-react';
import { ClientProject, PendingWorkCategory, PENDING_WORK_CONFIG } from '../types';
import { TODAY_STR, addDays, formatDateString } from '../utils/dateUtils';

interface CoordinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<ClientProject>) => void;
  initialProject?: ClientProject | null;
}

const CATEGORY_OPTIONS: { id: PendingWorkCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { 
    id: 'album_pending', 
    label: 'Album Pending', 
    icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
    desc: 'Album layout proof approval or photo replacements'
  },
  { 
    id: 'selection_pending', 
    label: 'Selection Pending', 
    icon: <Image className="w-4 h-4 text-purple-600" />,
    desc: 'Shortlisting favorite photos or raw video selections'
  },
  { 
    id: 'video_changes', 
    label: 'Video Changes Pending', 
    icon: <Film className="w-4 h-4 text-amber-600" />,
    desc: 'Song swaps, timecode cuts, or draft revision notes'
  },
  { 
    id: 'payment_pending', 
    label: 'Payment Pending', 
    icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
    desc: 'Milestone installment or final balance transfer'
  },
];

export const CoordinationModal: React.FC<CoordinationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Multi-select Pending Works (2-3 works per client as requested)
  const [pendingWorks, setPendingWorks] = useState<PendingWorkCategory[]>(['album_pending']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [coordinationNeed, setCoordinationNeed] = useState('');
  const [draftReviewLink, setDraftReviewLink] = useState('');
  
  // Exact Date Client Provided
  const [clientPromisedDate, setClientPromisedDate] = useState(TODAY_STR);
  const [notes, setNotes] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialProject) {
      setCoupleNames(initialProject.coupleNames || '');
      setWeddingDate(initialProject.weddingDate || '');
      setContactPerson(initialProject.contactPerson || '');
      setClientPhone(initialProject.clientPhone || '');
      setClientEmail(initialProject.clientEmail || '');
      setPendingWorks(
        initialProject.pendingWorks && initialProject.pendingWorks.length > 0 
          ? initialProject.pendingWorks 
          : ['album_pending']
      );
      setCoordinationNeed(initialProject.coordinationNeed || '');
      setDraftReviewLink(initialProject.draftReviewLink || '');
      setClientPromisedDate(initialProject.clientPromisedDate || TODAY_STR);
      setNotes(initialProject.notes || '');
    } else {
      // Clean defaults for new client
      setCoupleNames('');
      setWeddingDate(addDays(TODAY_STR, -20));
      setContactPerson('');
      setClientPhone('+91 ');
      setClientEmail('');
      setPendingWorks(['album_pending']);
      setCoordinationNeed('');
      setDraftReviewLink('');
      setClientPromisedDate(TODAY_STR);
      setNotes('');
    }
    setIsDropdownOpen(false);
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (catId: PendingWorkCategory) => {
    setPendingWorks(prev => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(c => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim()) {
      alert('Please enter the client / couple names (e.g. Prashant & Sally)');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Please enter the client WhatsApp phone number');
      return;
    }
    if (pendingWorks.length === 0) {
      alert('Please select at least one pending work category');
      return;
    }
    if (!clientPromisedDate) {
      alert('Please provide the date the client promised to update you by');
      return;
    }

    onSave({
      coupleNames: coupleNames.trim(),
      weddingDate: weddingDate || undefined,
      contactPerson: contactPerson.trim() || coupleNames.split('&')[0]?.trim() || 'Client',
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      pendingWorks,
      coordinationNeed: coordinationNeed.trim() || undefined,
      draftReviewLink: draftReviewLink.trim() || undefined,
      clientPromisedDate,
      nextFollowUpDate: clientPromisedDate,
      status: clientPromisedDate === TODAY_STR ? 'date_due_today' : 'date_promised_active',
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col rounded-xl bg-white shadow-xl border border-zinc-200 my-auto overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {initialProject ? 'Edit Client & Pending Works' : 'Add New Client Coordination'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select pending categories and set the exact date client provided to update.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Couple & Primary Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Client / Couple Names *
              </label>
              <input
                type="text"
                required
                value={coupleNames}
                onChange={e => setCoupleNames(e.target.value)}
                placeholder="e.g. Prashant & Sally"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Prashant (Groom)"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Client WhatsApp Phone *
              </label>
              <input
                type="text"
                required
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Wedding Date (Optional)
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={e => setWeddingDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {/* PENDING CATEGORY DROPDOWN MENU (Supports 2-3 works) */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-800">
                Pending Works Category (Choose 1, 2, or 3) *
              </label>
              <span className="text-[11px] text-zinc-500">
                {pendingWorks.length} selected
              </span>
            </div>

            {/* Dropdown Toggle Button */}
            <div className="relative">
              <button
                type="button"
                id="pending-works-dropdown-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-xs text-left shadow-2xs hover:border-zinc-400 focus:outline-none focus:border-zinc-900"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  {pendingWorks.map(pw => (
                    <span
                      key={pw}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${PENDING_WORK_CONFIG[pw]?.badgeClass}`}
                    >
                      {PENDING_WORK_CONFIG[pw]?.label}
                    </span>
                  ))}
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Menu Options */}
              {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg p-2 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Select pending works for this client:
                  </div>
                  {CATEGORY_OPTIONS.map(opt => {
                    const isSelected = pendingWorks.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleCategory(opt.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-zinc-100/90' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {opt.icon}
                            <span className="text-xs font-semibold text-zinc-900">{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{opt.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Click Badges to Toggle Directly */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-500 mr-1">Quick toggle:</span>
              {CATEGORY_OPTIONS.map(opt => {
                const isSelected = pendingWorks.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggleCategory(opt.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      isSelected
                        ? `${PENDING_WORK_CONFIG[opt.id].badgeClass} shadow-2xs font-semibold`
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THE DATE CLIENT PROVIDED (Exact reminder date) */}
          <div className="rounded-xl border-2 border-sky-400/70 bg-sky-50/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-700" />
                <span>Exact Date Client Provided to Update *</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                Reminder Target
              </span>
            </div>

            <p className="text-xs text-sky-900">
              The app will automatically remind you on this exact date. If the client hasn't sent the update, it will keep reminding you until marked updated!
            </p>

            <input
              type="date"
              required
              value={clientPromisedDate}
              onChange={e => setClientPromisedDate(e.target.value)}
              className="w-full rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
            />

            {/* Quick shortcuts for client dates */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-sky-800 font-medium">Quick set date:</span>
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'In 2 Days', days: 2 },
                { label: 'This Weekend', days: 3 },
                { label: 'In 5 Days', days: 5 },
                { label: 'Next Week', days: 7 },
              ].map(s => (
                <button
                  key={s.days}
                  type="button"
                  onClick={() => setClientPromisedDate(addDays(TODAY_STR, s.days))}
                  className="text-[11px] bg-white hover:bg-sky-100 text-sky-900 border border-sky-200 px-2 py-0.5 rounded font-medium transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Coordination Need & Review Link */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Specific Coordination Need / Details (Optional)
            </label>
            <input
              type="text"
              value={coordinationNeed}
              onChange={e => setCoordinationNeed(e.target.value)}
              placeholder="e.g. Approve 50-page digital album layout proof, or send cut timecodes"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Review / Gallery Link (Optional)
            </label>
            <input
              type="url"
              value={draftReviewLink}
              onChange={e => setDraftReviewLink(e.target.value)}
              placeholder="https://albumdraft.com/review/... or Drive / Frame.io link"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Internal Post-Production Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Client traveling until Saturday. Promised to sit with family and update by the exact date above."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs focus:border-zinc-900 focus:outline-none"
            />
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
              {initialProject ? 'Save Changes' : 'Start Tracking Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
