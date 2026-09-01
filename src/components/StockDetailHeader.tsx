import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import type { Stock } from '@/types';
import Sparkline from './Sparkline';

interface StockDetailHeaderProps {
  stock: Stock;
}

export default function StockDetailHeader({ stock }: StockDetailHeaderProps) {
  const positive = stock.changePercent >= 0;
  const lastSeries = stock.series[stock.series.length - 1];
  const prevSeries = stock.series[stock.series.length - 2];
  const dayChange = lastSeries.close - prevSeries.close;
  const dayChangePercent = (dayChange / prevSeries.close) * 100;

  return (
    <div className="flex items-center gap-6 px-5 py-4 bg-slate-900/40 border border-slate-800/60 rounded-xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-100">{stock.symbol}</h1>
          <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800/60 rounded">NSE</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{stock.name}</p>
      </div>

      <div className="h-12 w-px bg-slate-800/60" />

      <div>
        <div className="text-2xl font-bold text-slate-100">
          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${positive ? 'text-teal-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {positive ? '+' : ''}{dayChange.toFixed(2)} ({positive ? '+' : ''}{dayChangePercent.toFixed(2)}%)
          <span className="text-slate-600 ml-1">today</span>
        </div>
      </div>

      <div className="h-12 w-px bg-slate-800/60" />

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">30-Day Trend</span>
        <Sparkline data={stock.series} positive={positive} width={120} height={32} />
      </div>

      <div className="h-12 w-px bg-slate-800/60" />

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Volume (30D)</span>
        <div className="flex items-center gap-1.5 text-sm text-slate-300">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          {stock.volume}
        </div>
      </div>

      <div className="h-12 w-px bg-slate-800/60" />

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">30D Range</span>
        <div className="flex items-center gap-1.5 text-sm text-slate-300">
          <span className="text-red-400/80">₹{Math.min(...stock.series.map((s) => s.low)).toFixed(0)}</span>
          <span className="text-slate-600">—</span>
          <span className="text-teal-400/80">₹{Math.max(...stock.series.map((s) => s.high)).toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
