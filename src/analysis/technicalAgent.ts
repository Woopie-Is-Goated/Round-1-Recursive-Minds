import type { OHLCV, AgentResult, AgentLabel } from '@/types';

function movingAverage(data: OHLCV[], period: number): number {
  const slice = data.slice(-period);
  return slice.reduce((sum, d) => sum + d.close, 0) / slice.length;
}

function averageVolume(data: OHLCV[], period: number): number {
  const slice = data.slice(-period);
  return slice.reduce((sum, d) => sum + d.volume, 0) / slice.length;
}

export interface TechnicalAnalysis {
  ma5: number;
  ma20: number;
  latestVolume: number;
  avgVolume20: number;
  volumeRatio: number;
  volumeAnomaly: boolean;
  label: AgentLabel;
  confidence: number;
  reasoning: string;
}

export function analyzeTechnical(series: OHLCV[]): TechnicalAnalysis {
  const ma5 = movingAverage(series, 5);
  const ma20 = movingAverage(series, 20);
  const latestVolume = series[series.length - 1].volume;
  const avgVolume20 = averageVolume(series, 20);
  const volumeRatio = latestVolume / avgVolume20;
  const volumeAnomaly = volumeRatio > 1.5;

  let label: AgentLabel;
  const maDiff = ma5 - ma20;
  const maDiffPercent = (maDiff / ma20) * 100;

  if (Math.abs(maDiffPercent) < 0.3) {
    label = 'Neutral';
  } else if (ma5 > ma20) {
    label = 'Bullish';
  } else {
    label = 'Bearish';
  }

  let confidence: number;
  if (label === 'Neutral') {
    confidence = Math.round(35 + Math.random() * 15);
  } else {
    const maStrength = Math.min(Math.abs(maDiffPercent) / 3, 1) * 50;
    const volStrength = volumeAnomaly ? 25 : Math.min((volumeRatio - 0.5) / 1.0, 1) * 25;
    confidence = Math.round(45 + maStrength + volStrength);
    confidence = Math.min(Math.max(confidence, 40), 95);
  }

  const maDirection = ma5 > ma20 ? 'above' : ma5 < ma20 ? 'below' : 'equal to';
  const volPhrase = volumeAnomaly
    ? `volume ${volumeRatio.toFixed(1)}x average — momentum confirmed`
    : `volume ${volumeRatio.toFixed(1)}x average — no volume confirmation`;

  const reasoning = `5-day MA (₹${ma5.toFixed(1)}) ${maDirection} 20-day MA (₹${ma20.toFixed(1)}); ${volPhrase}`;

  return {
    ma5: +ma5.toFixed(2),
    ma20: +ma20.toFixed(2),
    latestVolume,
    avgVolume20,
    volumeRatio: +volumeRatio.toFixed(2),
    volumeAnomaly,
    label,
    confidence,
    reasoning,
  };
}

export function technicalToAgentResult(analysis: TechnicalAnalysis, degraded: boolean): AgentResult {
  let reasoning = analysis.reasoning;
  if (degraded) {
    reasoning = `${analysis.reasoning} [FALLBACK: using cached OHLCV snapshot — live feed unavailable]`;
  }
  return {
    label: analysis.label,
    confidence: analysis.confidence,
    reasoning,
    degraded,
  };
}
