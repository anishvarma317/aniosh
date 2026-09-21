import React, { useState, useEffect, useRef } from 'react';
import { X, Check, HelpCircle, Save, Film, MessageSquare, Calendar, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { UserWorkflowPreferences } from '../types';

interface QuestionnaireDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserWorkflowPreferences;
  onSavePreferences: (updated: UserWorkflowPreferences) => void;
}

export const QuestionnaireDrawer: React.FC<QuestionnaireDrawerProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [studioName, setStudioName] = useState(preferences.studioName || 'THS Post-Production');
  const [editorName, setEditorName] = useState(preferences.editorName || 'Post-Production Lead');
  const [studioLogoUrl, setStudioLogoUrl] = useState(preferences.studioLogoUrl || '');
  const [logoText, setLogoText] = useState(preferences.logoText || 'THS');
  const [interval, setInterval] = useState(preferences.defaultFollowUpIntervalDays || 2);
  const [escalateDays, setEscalateDays] = useState(preferences.autoEscalateOverdueDays || 1);
  const [enableInAppPopupAlerts, setEnableInAppPopupAlerts] = useState(preferences.enableInAppPopupAlerts ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStudioName(preferences.studioName || 'THS Post-Production');
      setEditorName(preferences.editorName || 'Post-Production Lead');
      setStudioLogoUrl(preferences.studioLogoUrl || '');
      setLogoText(preferences.logoText || 'THS');
      setInterval(preferences.defaultFollowUpIntervalDays || 2);
      setEscalateDays(preferences.autoEscalateOverdueDays || 1);
      setEnableInAppPopupAlerts(preferences.enableInAppPopupAlerts ?? true);
      setSavedSuccess(false);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setStudioLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    onSavePreferences({
      studioName: studioName.trim() || 'THS Post-Production',
      editorName: editorName.trim() || 'Post-Production Lead',
      studioLogoUrl: studioLogoUrl.trim() || undefined,
      logoText: logoText.trim() || 'THS',
      defaultFollowUpIntervalDays: interval,
      autoEscalateOverdueDays: escalateDays,
      enableInAppPopupAlerts,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col justify-between overflow-y-auto border-l border-zinc-200">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                <Film className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Studio Workflow & WhatsApp Settings
                </h2>
                <p className="text-xs text-zinc-500">
                  Configure wedding post-production follow-ups & calendar reminders.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Questions */}
          <div className="p-5 space-y-5 text-xs">
            {/* Studio Info & Name */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-900 text-xs">
                Wedding Film Company / Studio Name
              </label>
              <input
                type="text"
                value={studioName}
                onChange={e => setStudioName(e.target.value)}
                placeholder="e.g. THS Wedding Films"
                className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-zinc-900 focus:outline-none"
              />
            </div>

            {/* APP LOGO & BRANDING CUSTOMIZER */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>App Logo & Branding</span>
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload an image or use your custom monogram (e.g. THS)
                  </p>
                </div>

                {/* Live Logo Preview */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">Preview:</span>
                  {studioLogoUrl ? (
                    <img
                      src={studioLogoUrl}
                      alt="Logo Preview"
                      className="h-9 w-9 rounded-lg object-contain bg-zinc-900 p-1 border border-zinc-300 shadow-2xs"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 font-black text-xs tracking-wider border border-zinc-800 shadow-2xs">
                      {logoText || 'THS'}
                    </div>
                  )}
                </div>
              </div>

              {/* Monogram / Brand Initials */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Logo Text / Monogram (Shown when no image is uploaded)
                </label>
                <input
                  type="text"
                  value={logoText}
                  onChange={e => setLogoText(e.target.value)}
                  placeholder="e.g. THS"
                  maxLength={6}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs font-bold tracking-wider focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {/* Upload Image Section (Drag & Drop or Browse) */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Upload Custom Logo Image (PNG, JPG, SVG, WebP)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <Upload className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                  <p className="text-xs font-medium text-zinc-700">
                    Click to browse or drag & drop logo here
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Recommended: Square transparent PNG or SVG
                  </p>
                </div>

                {/* Or enter Direct Image URL */}
                <div className="mt-2">
                  <input
                    type="url"
                    value={studioLogoUrl}
                    onChange={e => setStudioLogoUrl(e.target.value)}
                    placeholder="Or paste image URL (https://.../logo.png)"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-[11px] focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {studioLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setStudioLogoUrl('')}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove uploaded image (Use THS text monogram)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-900 text-xs">
                Your Name / Role (Used in WhatsApp Messages)
              </label>
              <input
                type="text"
                value={editorName}
                onChange={e => setEditorName(e.target.value)}
                placeholder="e.g. Rahul (Post-Production Lead)"
                className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-zinc-900 focus:outline-none"
              />
            </div>

            {/* Follow up frequency */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-900 text-xs">
                WhatsApp Follow-up Frequency (When Awaiting Client Reply)
              </label>
              <p className="text-zinc-500 text-[11px]">
                How often should the app prompt you to ping clients who haven't committed to a date?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 2, label: 'Every 2 Days', desc: 'Tight delivery' },
                  { days: 3, label: 'Every 3 Days', desc: 'Recommended' },
                  { days: 5, label: 'Every 5 Days', desc: 'Relaxed post-wedding' }
                ].map(opt => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setInterval(opt.days)}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      interval === opt.days
                        ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 ${interval === opt.days ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overdue alert threshold */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-zinc-900 text-xs">
                Promised Date Overdue Alert Trigger
              </label>
              <p className="text-zinc-500 text-[11px]">
                Trigger a critical alert if the client misses their promised update date by:
              </p>
              <select
                value={escalateDays}
                onChange={e => setEscalateDays(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-zinc-900 focus:outline-none bg-white font-medium"
              >
                <option value={1}>Same day / 1 day after promised date (Strict)</option>
                <option value={2}>2 days after promised date (Recommended)</option>
                <option value={3}>3 days after promised date</option>
              </select>
            </div>

            {/* In-App Popup Notification Setting */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableInAppPopupAlerts}
                  onChange={e => setEnableInAppPopupAlerts(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-zinc-900 block text-xs">
                    Enable Automatic In-App Due Date Popup Notifications
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    Automatically displays a popup reminder dialog when you open the app if any client deadlines are due today or overdue.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
