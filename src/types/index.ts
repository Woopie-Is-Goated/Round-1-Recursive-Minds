export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  series: OHLCV[];
}

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type AgentLabel = 'Bullish' | 'Bearish' | 'Neutral';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';

export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  sentiment: Sentiment;
  timestamp: string;
}

export interface SEBIFiling {
  id: number;
  title: string;
  text: string;
  date: string;
}

export interface AgentCitation {
  text: string;
  source: string;
  title: string;
  date: string;
}

export interface AgentResult {
  label: AgentLabel;
  confidence: number;
  reasoning: string;
  degraded?: boolean;
  citation?: AgentCitation;
}

export interface SessionLogEntry {
  id: number;
  timestamp: string;
  action: string;
  latencyMs: number;
  signalAccuracy: number;
}
