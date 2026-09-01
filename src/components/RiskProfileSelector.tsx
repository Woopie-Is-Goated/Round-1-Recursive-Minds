import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import type { RiskProfile } from '@/types';

interface RiskProfileSelectorProps {
  value: RiskProfile;
  onChange: (profile: RiskProfile) => void;
}

const profiles: { label: RiskProfile; description: string; color: string }[] = [
  { label: 'Conservative', description: 'Low risk tolerance, capital preservation focus', color: 'text-teal-400' },
  { label: 'Moderate', description: 'Balanced risk and return profile', color: 'text-amber-400' },
  { label: 'Aggressive', description: 'High risk tolerance, growth-oriented', color: 'text-red-400' },
];

export default function RiskProfileSelector({ value, onChange }: RiskProfileSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = profiles.find((p) => p.label === value)!;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Profile</span>
      </div>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg hover:border-slate-600 transition-colors"
        >
          <span className={`text-sm font-semibold ${current.color}`}>{current.label}</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 right-0 w-72 bg-slate-800 border border-slate-700/60 rounded-lg shadow-xl z-50 overflow-hidden">
            {profiles.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  onChange(p.label);
                  setOpen(false);
                }}
                className={`w-full flex flex-col gap-1 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/40 last:border-b-0 ${
                  value === p.label ? 'bg-slate-700/30' : ''
                }`}
              >
                <span className={`text-sm font-semibold ${p.color}`}>{p.label}</span>
                <span className="text-xs text-slate-500">{p.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
