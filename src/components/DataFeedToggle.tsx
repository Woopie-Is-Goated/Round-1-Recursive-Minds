import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface DataFeedToggleProps {
  outage: boolean;
  onToggle: (value: boolean) => void;
}

export default function DataFeedToggle({ outage, onToggle }: DataFeedToggleProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/80 border-t border-slate-800/60">
      <div className="flex items-center gap-2">
        {outage ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-teal-400" />}
        <span className="text-sm font-medium text-slate-300">Simulate Data Feed Outage</span>
      </div>

      <button
        onClick={() => onToggle(!outage)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          outage ? 'bg-amber-500/80' : 'bg-slate-700'
        }`}
        aria-label="Toggle data feed outage simulation"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            outage ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {outage && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Feed offline — fallback mode active</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Agents: {outage ? '2/3 Online' : '3/3 Online'}
        </span>
        <span>InvestIQ v1.0 — Demo Mode</span>
      </div>
    </div>
  );
}
