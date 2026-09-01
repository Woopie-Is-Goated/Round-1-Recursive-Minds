import type { Stock, SEBIFiling, AgentResult, AgentLabel, AgentCitation } from '@/types';
import { sebiFilings } from '@/data/mockData';

const bullishKeywords = [
  'growth', 'beat estimates', 'profit', 'surge', 'rally', 'record', 'strong',
  'improve', 'gain', 'expansion', 'capex', 'buyback', 'premium', 'raise',
  'crosses', 'wins', 'adequacy', 'retained earnings',
];

const bearishKeywords = [
  'decline', 'investigation', 'loss', 'drop', 'fall', 'weak', 'pressure',
  'cut', 'compression', 'clarification', 'tightening', 'headwinds', 'tariff',
  'default', 'downgrade', 'miss', 'guidance cut',
];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9\s]+/).flatMap((w) => w.trim().split(/\s+/)).filter(Boolean);
}

function keywordOverlap(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => {
    return lower.includes(kw) ? count + 1 : count;
  }, 0);
}

function scoreFiling(filing: SEBIFiling, stock: Stock): number {
  const filingText = (filing.title + ' ' + filing.text).toLowerCase();
  const stockNameTokens = tokenize(stock.name);
  const stockSymbolTokens = tokenize(stock.symbol);

  let score = 0;
  for (const token of stockNameTokens) {
    if (token.length >= 3 && filingText.includes(token)) score += 2;
  }
  for (const token of stockSymbolTokens) {
    if (token.length >= 3 && filingText.includes(token)) score += 1;
  }

  const sectorKeywords: Record<string, string[]> = {
    RELIANCE: ['retail', 'digital', 'telecom', 'jio', 'petrochemical'],
    TCS: ['software', 'it services', 'consulting', 'buyback'],
    INFY: ['software', 'it services', 'bfsi'],
    HDFCBANK: ['bank', 'capital adequacy', 'basel', 'nim', 'tier-1'],
    ITC: ['fmcg', 'tobacco', 'diversification'],
    SBIN: ['bank', 'loan', 'gnpa', 'asset quality'],
    TATAMOTORS: ['automobile', 'ev', 'jlr', 'commercial vehicle'],
    ADANIENT: ['port', 'power', 'infrastructure', 'mining'],
  };

  const sector = sectorKeywords[stock.symbol] ?? [];
  for (const kw of sector) {
    if (filingText.includes(kw)) score += 1;
  }

  return score;
}

export interface FundamentalAnalysis {
  matchedFiling: SEBIFiling | null;
  matchScore: number;
  label: AgentLabel;
  confidence: number;
  reasoning: string;
  citation: AgentCitation | null;
}

export function analyzeFundamental(stock: Stock): FundamentalAnalysis {
  const scored = sebiFilings
    .map((f) => ({ filing: f, score: scoreFiling(f, stock) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const matchedFiling = best && best.score > 0 ? best.filing : null;
  const matchScore = best ? best.score : 0;

  if (!matchedFiling) {
    return {
      matchedFiling: null,
      matchScore: 0,
      label: 'Neutral',
      confidence: 40,
      reasoning: 'No relevant SEBI filing found for this stock. Insufficient fundamental data for a directional signal.',
      citation: null,
    };
  }

  const filingText = matchedFiling.title + ' ' + matchedFiling.text;
  const bullishCount = keywordOverlap(filingText, bullishKeywords);
  const bearishCount = keywordOverlap(filingText, bearishKeywords);

  let label: AgentLabel;
  if (bullishCount > bearishCount) {
    label = 'Bullish';
  } else if (bearishCount > bullishCount) {
    label = 'Bearish';
  } else {
    label = 'Neutral';
  }

  const totalSignals = bullishCount + bearishCount;
  const dominant = Math.max(bullishCount, bearishCount);
  const confidence = Math.min(45 + dominant * 12 + matchScore * 3, 92);

  const matchedKeywords: string[] = [];
  const allKeywords = label === 'Bullish' ? bullishKeywords : label === 'Bearish' ? bearishKeywords : [...bullishKeywords, ...bearishKeywords];
  for (const kw of allKeywords) {
    if (filingText.toLowerCase().includes(kw) && matchedKeywords.length < 3) {
      matchedKeywords.push(`"${kw}"`);
    }
  }

  const reasoning = `Retrieved "${matchedFiling.title}" (match score: ${matchScore}). Keyword sentiment: ${bullishCount} bullish / ${bearishCount} bearish signals (${matchedKeywords.join(', ')}). Grounded in SEBI filing dated ${matchedFiling.date}.`;

  const citation: AgentCitation = {
    text: matchedFiling.text,
    source: 'Simulated SEBI Filing',
    title: matchedFiling.title,
    date: matchedFiling.date,
  };

  return {
    matchedFiling,
    matchScore,
    label,
    confidence: Math.round(confidence),
    reasoning,
    citation,
  };
}

export function fundamentalToAgentResult(analysis: FundamentalAnalysis): AgentResult {
  return {
    label: analysis.label,
    confidence: analysis.confidence,
    reasoning: analysis.reasoning,
    citation: analysis.citation ?? undefined,
  };
}
