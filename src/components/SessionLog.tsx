import { ScrollText, Clock, Zap, Target } from 'lucide-react';
import type { SessionLogEntry } from '@/types';

interface SessionLogProps {
  entries: SessionLogEntry[];
}

export default function SessionLog({ entries }: SessionLogProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Session Log</h2>
      </div>

      <div className="px-4 py-2 border-b border-slate-800/40 grid grid-cols-[1fr_1.2fr_0.7fr_0.7fr] gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>Time</span>
        <span>Action</span>
        <span>Latency</span>
        <span>Accuracy</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 px-4 py-8">
            <ScrollText className="w-6 h-6" />
            <span className="text-xs text-center">No actions logged yet. Interact with the dashboard to generate entries.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_1.2fr_0.7fr_0.7fr] gap-2 px-4 py-2.5 text-xs hover:bg-slate-800/30 transition-colors">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {entry.timestamp}
                </span>
                <span className="text-slate-300 truncate">{entry.action}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 flex-shrink-0 text-amber-400/70" />
                  {entry.latencyMs}ms
                </span>
                <span className={`flex items-center gap-1 font-medium ${
                  entry.signalAccuracy >= 80 ? 'text-teal-400' : entry.signalAccuracy >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  <Target className="w-3 h-3 flex-shrink-0" />
                  {entry.signalAccuracy}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
