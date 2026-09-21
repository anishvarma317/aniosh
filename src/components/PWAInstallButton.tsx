import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, X, Check, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/80 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        title="Install THS app on your phone or desktop"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-700" />
        <span>Install App</span>
      </button>

      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-amber-400 font-black text-sm shadow-xs">
                  THS
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Install THS on Your Phone</h3>
                  <p className="text-xs text-zinc-500">Run as a standalone app on your home screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Android instructions */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                <div className="flex items-center gap-2 font-semibold text-emerald-950 text-xs mb-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Android (Chrome / Samsung Internet)</span>
                </div>
                <ol className="text-xs text-emerald-900 space-y-1 pl-5 list-decimal">
                  <li>Open this link on your phone in <strong>Google Chrome</strong>.</li>
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right corner.</li>
                  <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                  <li>Confirm by tapping <strong>Add</strong>.</li>
                </ol>
              </div>

              {/* iPhone / iOS instructions */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
                <div className="flex items-center gap-2 font-semibold text-amber-950 text-xs mb-1.5">
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <ol className="text-xs text-amber-900 space-y-1 pl-5 list-decimal">
                  <li>Open this link in <strong>Safari</strong> on your iPhone.</li>
                  <li>Tap the <strong>Share</strong> button at the bottom (box with arrow pointing up).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-800" />.</li>
                  <li>Tap <strong>Add</strong> in the top right corner.</li>
                </ol>
              </div>

              {/* Quick URL copy helper */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-xs text-zinc-600 mb-1 font-medium">To open on your phone right now:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full text-xs font-mono bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-zinc-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('App link copied to clipboard! Send this link to your phone via WhatsApp or email to open and install.');
                    }}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
