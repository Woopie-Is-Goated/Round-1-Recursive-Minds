import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, FileText, Loader2, AlertCircle } from 'lucide-react';
import type { AgentResult } from '@/types';

interface AgentCardProps {
  title: string;
  icon: 'technical' | 'sentiment' | 'fundamental';
  result: AgentResult | null;
  loading: boolean;
  degraded?: boolean;
  error?: string | null;
}

const iconMap = {
  technical: Activity,
  sentiment: TrendingUp,
  fundamental: TrendingDown,
};

const labelStyles: Record<string, { bg: string; text: string; icon: typeof Minus }> = {
  Bullish: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: TrendingUp },
  Bearish: { bg: 'bg-red-500/15', text: 'text-red-400', icon: TrendingDown },
  Neutral: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: Minus },
};

export default function AgentCard({ title, icon, result, loading, degraded, error }: AgentCardProps) {
  const Icon = iconMap[icon];
  const showError = error && !loading;

  return (
    <div className={`relative flex flex-col bg-slate-900/60 border rounded-xl overflow-hidden transition-all ${
    degraded ? 'border-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]' : 'border-slate-800/60'
  }`}>
      {degraded && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-medium text-amber-400">DEGRADED — using fallback data</span>
        </div>
      )}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80">
          <Icon className="w-4 h-4 text-teal-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        {loading ? (
          <>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Analyzing market data...</span>
            </div>
            <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-slate-700 rounded-full animate-pulse" />
            </div>
            <div className="mt-2">
              <div className="h-5 w-20 bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="h-3 w-full bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-slate-800/50 rounded animate-pulse" />
            </div>
          </>
        ) : showError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <AlertCircle className="w-8 h-8 text-red-400/60" />
            <span className="text-sm font-medium text-red-400">Sentiment Agent unavailable</span>
            <span className="text-[11px] text-slate-600 text-center max-w-[200px] leading-relaxed">
              Could not reach the sentiment analysis service. Other agents remain active.
            </span>
          </div>
        ) : !result ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Confidence</span>
              <div className="h-4 w-12 bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-slate-700 rounded-full" />
            </div>
            <div className="mt-2">
              <div className="h-5 w-20 bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="h-3 w-full bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-slate-800/50 rounded animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Confidence</span>
              <span className="text-sm font-semibold text-slate-200">{result.confidence}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${result.confidence}%`,
                  background: result.label === 'Bullish'
                    ? 'linear-gradient(90deg, #14b8a6, #2dd4bf)'
                    : result.label === 'Bearish'
                    ? 'linear-gradient(90deg, #ef4444, #f87171)'
                    : 'linear-gradient(90deg, #64748b, #94a3b8)',
                }}
              />
            </div>
            {(() => {
              const style = labelStyles[result.label];
              const LabelIcon = style.icon;
              return (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold w-fit ${style.bg} ${style.text}`}>
                  <LabelIcon className="w-3.5 h-3.5" />
                  {result.label}
                </div>
              );
            })()}
            <p className="text-xs text-slate-400 leading-relaxed mt-1">{result.reasoning}</p>
            {result.citation && (
              <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1.5">
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <blockquote className="text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-slate-700/50 pl-2.5">
                    {result.citation.text}
                  </blockquote>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/60 rounded text-slate-400 font-medium">
                    {result.citation.source}
                  </span>
                  <span>·</span>
                  <span>{result.citation.date}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
