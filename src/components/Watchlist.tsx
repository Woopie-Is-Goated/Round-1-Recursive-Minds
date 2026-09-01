import type { Stock } from '@/types';
import Sparkline from './Sparkline';

interface WatchlistProps {
  stocks: Stock[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export default function Watchlist({ stocks, selectedSymbol, onSelect }: WatchlistProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Watchlist</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {stocks.map((stock) => {
          const positive = stock.changePercent >= 0;
          const isSelected = stock.symbol === selectedSymbol;
          return (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-800/40 text-left transition-colors group hover:bg-slate-800/40 ${
                isSelected ? 'bg-slate-800/60 border-l-2 border-l-teal-400' : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">{stock.symbol}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{stock.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-300">
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-xs font-medium ${positive ? 'text-teal-400' : 'text-red-400'}`}>
                    {positive ? '+' : ''}{stock.changePercent}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Sparkline data={stock.series} positive={positive} />
                <span className="text-[10px] text-slate-600">Vol {stock.volume}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
