import { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain } from 'lucide-react';
import type { RiskProfile, SessionLogEntry, AgentResult } from '@/types';
import { stocks } from '@/data/mockData';
import { analyzeTechnical, technicalToAgentResult } from '@/analysis/technicalAgent';
import { analyzeFundamental, fundamentalToAgentResult } from '@/analysis/fundamentalAgent';
import { useSentimentAgent } from '@/hooks/useSentimentAgent';
import { newsHeadlines } from '@/data/mockData';
import Watchlist from '@/components/Watchlist';
import RiskProfileSelector from '@/components/RiskProfileSelector';
import AgentCard from '@/components/AgentCard';
import SynthesisPanel from '@/components/SynthesisPanel';
import SessionLog from '@/components/SessionLog';
import DataFeedToggle from '@/components/DataFeedToggle';
import StockDetailHeader from '@/components/StockDetailHeader';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('Moderate');
  const [outage, setOutage] = useState(false);
  const [logEntries, setLogEntries] = useState<SessionLogEntry[]>([]);
  const [logId, setLogId] = useState(1);

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol)!;

  const technicalResult: AgentResult = useMemo(() => {
    const analysis = analyzeTechnical(selectedStock.series);
    return technicalToAgentResult(analysis, outage);
  }, [selectedStock, outage]);

  const fundamentalResult: AgentResult = useMemo(() => {
    const analysis = analyzeFundamental(selectedStock);
    return fundamentalToAgentResult(analysis);
  }, [selectedStock]);

  const stockNews = useMemo(() => {
    const symbolLower = selectedStock.symbol.toLowerCase();
    const nameLower = selectedStock.name.toLowerCase();
    const nameWords = nameLower.split(/\s+/).filter((w) => w.length > 2);
    return newsHeadlines.filter((n) => {
      const headlineLower = n.headline.toLowerCase();
      return (
        headlineLower.includes(symbolLower) ||
        headlineLower.includes(nameLower) ||
        nameWords.some((w) => headlineLower.includes(w))
      );
    });
  }, [selectedStock]);

  const sentiment = useSentimentAgent(selectedSymbol, stockNews);

  const addLogEntry = useCallback((action: string, latencyMs: number, signalAccuracy: number) => {
    const now = new Date();
    const timestamp = now.toTimeString().slice(0, 8);
    setLogEntries((prev) => [
      { id: logId, timestamp, action, latencyMs, signalAccuracy },
      ...prev,
    ].slice(0, 50));
    setLogId((prev) => prev + 1);
  }, [logId]);

  useEffect(() => {
    addLogEntry(`Loaded ${selectedSymbol} into analysis panel`, 42, 87);
  }, [selectedSymbol, addLogEntry]);

  useEffect(() => {
    addLogEntry(
      `Technical Agent: ${technicalResult.label} @ ${technicalResult.confidence}% confidence${outage ? ' [DEGRADED]' : ''}`,
      outage ? 5 : 38,
      outage ? 45 : 85 + Math.floor(Math.random() * 10),
    );
  }, [technicalResult, outage, addLogEntry]);

  useEffect(() => {
    addLogEntry(
      `Fundamental Agent: ${fundamentalResult.label} @ ${fundamentalResult.confidence}% confidence — retrieved SEBI filing`,
      52,
      80 + Math.floor(Math.random() * 15),
    );
  }, [fundamentalResult, addLogEntry]);

  useEffect(() => {
    if (sentiment.loading) {
      addLogEntry('Sentiment Agent: querying Claude API for news analysis...', 0, 0);
    } else if (sentiment.error) {
      addLogEntry(`Sentiment Agent: unavailable — ${sentiment.error}`, 0, 0);
    } else if (sentiment.result) {
      addLogEntry(
        `Sentiment Agent: ${sentiment.result.label} @ ${sentiment.result.confidence}% confidence`,
        120 + Math.floor(Math.random() * 80),
        78 + Math.floor(Math.random() * 15),
      );
    }
  }, [sentiment, addLogEntry]);

  useEffect(() => {
    addLogEntry(`Risk profile changed to ${riskProfile}`, 18, 92);
  }, [riskProfile, addLogEntry]);

  useEffect(() => {
    if (outage) {
      addLogEntry('Data feed outage simulated — Technical Agent degraded', 5, 45);
    } else {
      addLogEntry('Data feed restored — all agents online', 12, 88);
    }
  }, [outage, addLogEntry]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        'Heartbeat: agent status check',
        'Cache refresh: market data snapshot',
        'Signal re-evaluation cycle',
        'Sentiment index recalculated',
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const latency = Math.floor(20 + Math.random() * 80);
      const accuracy = Math.floor(75 + Math.random() * 20);
      addLogEntry(action, latency, accuracy);
    }, 8000);
    return () => clearInterval(interval);
  }, [addLogEntry]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500/20 to-teal-600/5 border border-teal-500/20">
            <Brain className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">InvestIQ</h1>
            <p className="text-[10px] text-slate-500 -mt-0.5">Multi-Agent Financial Intelligence</p>
          </div>
        </div>
        <div className="ml-auto">
          <RiskProfileSelector value={riskProfile} onChange={setRiskProfile} />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Watchlist */}
        <aside className="w-72 flex-shrink-0 border-r border-slate-800/60 bg-slate-900/30">
          <Watchlist stocks={stocks} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <StockDetailHeader stock={selectedStock} />

          {/* Agent Cards */}
          <div className="grid grid-cols-3 gap-4">
            <AgentCard
              title="Technical Agent"
              icon="technical"
              result={technicalResult}
              loading={false}
              degraded={outage}
            />
            <AgentCard
              title="Sentiment Agent"
              icon="sentiment"
              result={sentiment.result}
              loading={sentiment.loading}
              error={sentiment.error}
            />
            <AgentCard
              title="Fundamental Agent"
              icon="fundamental"
              result={fundamentalResult}
              loading={false}
            />
          </div>

          {/* Synthesis Panel */}
          <SynthesisPanel
            recommendation={null}
            confidence={null}
            label={null}
            reasoningTrace={null}
            loading={true}
          />
        </main>

        {/* Right Sidebar — Session Log */}
        <aside className="w-80 flex-shrink-0 border-l border-slate-800/60 bg-slate-900/30">
          <SessionLog entries={logEntries} />
        </aside>
      </div>

      {/* Bottom Bar — Data Feed Toggle */}
      <DataFeedToggle outage={outage} onToggle={setOutage} />
    </div>
  );
}

export default App;
