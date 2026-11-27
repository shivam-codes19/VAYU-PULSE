import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Wind, X } from 'lucide-react';

interface BreathingModalProps {
  open: boolean;
  indoorPm25: number;
  onClose: () => void;
}

const TOTAL_SECONDS = 120;

export const BreathingModal: React.FC<BreathingModalProps> = ({
  open,
  indoorPm25,
  onClose,
}) => {
  const [running, setRunning] = useState(true);
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (!open) {
      setRemaining(TOTAL_SECONDS);
      setRunning(true);
      return;
    }
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, running, remaining]);

  if (!open) return null;

  // 14-second calm cycle: 4s inhale, 4s hold, 6s slow exhale
  const elapsed = TOTAL_SECONDS - remaining;
  const cycleSec = elapsed % 14;
  let phase = 'Inhale slowly';
  let phaseSub = 'Through your nose · 4 sec';
  let ringScale = 1.06;
  if (cycleSec >= 4 && cycleSec < 8) {
    phase = 'Hold gently';
    phaseSub = 'Relax shoulders · 4 sec';
    ringScale = 1.1;
  } else if (cycleSec >= 8) {
    phase = 'Exhale steadily';
    phaseSub = 'Slow calm breath out · 6 sec';
    ringScale = 0.94;
  }

  const mins = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B130E]/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-[28px] bg-[#112018] text-white border border-[#24392D] p-6 shadow-2xl space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#9BB0A1]">Breathing room · Indoor {indoorPm25} µg/m³</p>
            <h2 id="breathing-modal-title" className="text-xl font-semibold mt-0.5">
              2 min reset, windows closed
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close breathing reset"
            className="min-h-[40px] min-w-[40px] rounded-full bg-[#1C3025] hover:bg-[#263E30] flex items-center justify-center text-[#DCE7DF] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center py-4">
          <div
            className="w-44 h-44 rounded-full border-[8px] border-[#B9E45A] bg-[#192D22] flex flex-col items-center justify-center transition-transform duration-1000"
            style={{ transform: `scale(${running && remaining > 0 ? ringScale : 1})` }}
          >
            <Wind className="w-5 h-5 text-[#B9E45A] mb-1" />
            <span className="text-3xl font-bold font-mono tabular-nums text-[#B9E45A]">
              {mins}:{secs}
            </span>
            <span className="text-xs font-medium text-white mt-1">
              {remaining === 0 ? 'Reset complete' : phase}
            </span>
          </div>
          <p className="mt-4 text-xs text-[#A9B9AE]">
            {remaining === 0
              ? 'Nicely done — your indoor sanctuary stays calm.'
              : phaseSub}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="flex-1 min-h-[44px] rounded-[14px] bg-[#B9E45A] text-[#101D15] text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#C6EC72] transition-colors cursor-pointer"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : remaining === 0 ? 'Done' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRemaining(TOTAL_SECONDS);
              setRunning(true);
            }}
            aria-label="Restart 2 minute breathing timer"
            className="min-h-[44px] px-4 rounded-[14px] bg-[#1C3025] text-[#DCE7DF] hover:bg-[#263E30] inline-flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
