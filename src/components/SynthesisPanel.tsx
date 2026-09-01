import { Layers, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AgentResult } from '@/types';

interface SynthesisPanelProps {
  recommendation: string | null;
  confidence: number | null;
  label: 'Bullish' | 'Bearish' | 'Neutral' | null;
  reasoningTrace: string[] | null;
  loading: boolean;
}

const labelStyles: Record<string, { bg: string; text: string; icon: typeof Minus }> = {
  Bullish: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: TrendingUp },
  Bearish: { bg: 'bg-red-500/15', text: 'text-red-400', icon: TrendingDown },
  Neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: Minus },
};

export default function SynthesisPanel({ recommendation, confidence, label, reasoningTrace, loading }: SynthesisPanelProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10">
          <Layers className="w-4 h-4 text-teal-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Synthesis Panel</h3>
        <span className="text-xs text-slate-500 ml-auto">Multi-Agent Consensus Engine</span>
      </div>

      <div className="p-5">
        {loading || !recommendation ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-7 w-40 bg-slate-800/60 rounded animate-pulse" />
              <div className="h-6 w-24 bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-slate-800/50 rounded animate-pulse" />
            </div>
            <div className="text-xs text-slate-600 italic">Waiting for agent outputs to synthesize...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-lg font-bold text-slate-100">{recommendation}</span>
              {label && (() => {
                const style = labelStyles[label];
                const LabelIcon = style.icon;
                return (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold ${style.bg} ${style.text}`}>
                    <LabelIcon className="w-4 h-4" />
                    {label}
                  </div>
                );
              })()}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-500">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${confidence}%`,
                        background: label === 'Bullish'
                          ? 'linear-gradient(90deg, #14b8a6, #2dd4bf)'
                          : label === 'Bearish'
                          ? 'linear-gradient(90deg, #ef4444, #f87171)'
                          : 'linear-gradient(90deg, #64748b, #94a3b8)',
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 w-10">{confidence}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reasoning Trace</h4>
              <ul className="space-y-1.5">
                {reasoningTrace?.map((trace, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-slate-800/80 text-slate-500 flex items-center justify-center text-[10px] font-semibold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{trace}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
