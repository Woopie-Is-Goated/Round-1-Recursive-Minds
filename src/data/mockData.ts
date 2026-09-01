import type { Stock, SEBIFiling, NewsItem, OHLCV } from '@/types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeries(startPrice: number, trend: number, volatility: number, seed: number): OHLCV[] {
  const rng = seededRandom(seed);
  const series: OHLCV[] = [];
  let price = startPrice;
  const now = new Date('2026-09-01');

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dailyTrend = trend / 30;
    const dailyVol = volatility * price;
    const change = (rng() - 0.45 + dailyTrend) * dailyVol;
    const open = price;
    const close = Math.max(open + change, open * 0.85);
    const high = Math.max(open, close) + rng() * dailyVol * 0.5;
    const low = Math.min(open, close) - rng() * dailyVol * 0.5;
    const volume = Math.floor((1_000_000 + rng() * 5_000_000) * (1 + Math.abs(change / price) * 5));

    series.push({
      date: date.toISOString().slice(0, 10),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +Math.max(low, 0).toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return series;
}

const stockMeta: { symbol: string; name: string; start: number; trend: number; vol: number; seed: number }[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', start: 2845, trend: 120, vol: 0.018, seed: 101 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', start: 4120, trend: 85, vol: 0.014, seed: 202 },
  { symbol: 'INFY', name: 'Infosys Ltd', start: 1865, trend: -45, vol: 0.016, seed: 303 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', start: 1680, trend: 60, vol: 0.012, seed: 404 },
  { symbol: 'ITC', name: 'ITC Ltd', start: 468, trend: 15, vol: 0.011, seed: 505 },
  { symbol: 'SBIN', name: 'State Bank of India', start: 842, trend: 38, vol: 0.020, seed: 606 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', start: 985, trend: -72, vol: 0.024, seed: 707 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', start: 3120, trend: 210, vol: 0.028, seed: 808 },
];

export const stocks: Stock[] = stockMeta.map((m) => {
  const series = generateSeries(m.start, m.trend, m.vol, m.seed);
  const last = series[series.length - 1];
  const first = series[0];
  const changePercent = ((last.close - first.close) / first.close) * 100;
  const volTotal = series.reduce((s, d) => s + d.volume, 0);
  const formatVol = (v: number) => {
    if (v >= 1e7) return (v / 1e7).toFixed(2) + 'Cr';
    if (v >= 1e5) return (v / 1e5).toFixed(2) + 'L';
    return (v / 1e3).toFixed(1) + 'K';
  };
  return {
    symbol: m.symbol,
    name: m.name,
    price: last.close,
    changePercent: +changePercent.toFixed(2),
    volume: formatVol(volTotal),
    series,
  };
});

export const sebiFilings: SEBIFiling[] = [
  {
    id: 1,
    title: 'Reliance Industries — Q1 FY26 Earnings Disclosure',
    text: 'Reliance Industries reported a consolidated net profit of Rs 21,243 crore for Q1 FY26, up 12.4% YoY, driven by strong performance in retail and digital services. Revenue from operations stood at Rs 2,42,891 crore. The company announced a capex guidance of Rs 1,20,000 crore for the fiscal year.',
    date: '2026-08-28',
  },
  {
    id: 2,
    title: 'SEBI Insider Trading Regulation Amendment',
    text: 'SEBI has amended Regulation 4 of the PIT Regulations, tightening the definition of "connected person" to include immediate relatives of senior management. The amendment takes effect 90 days from notification. Listed entities must update their code of conduct within 60 days.',
    date: '2026-08-25',
  },
  {
    id: 3,
    title: 'TCS — Buyback Proposal Filing',
    text: 'Tata Consultancy Services filed a buyback proposal with SEBI for up to 4 crore equity shares at Rs 4,500 per share, representing a 9.2% premium over the current market price. The total buyback size is approximately Rs 18,000 crore.',
    date: '2026-08-22',
  },
  {
    id: 4,
    title: 'Adani Enterprises — Related Party Transaction Disclosure',
    text: 'Adani Enterprises disclosed related party transactions worth Rs 3,400 crore for the quarter ended June 2026, primarily involving port operations and power trading with group entities. SEBI has sought additional clarification on pricing methodology.',
    date: '2026-08-20',
  },
  {
    id: 5,
    title: 'HDFC Bank — Basel III Capital Adequacy Filing',
    text: 'HDFC Bank reported a Capital Adequacy Ratio of 18.2% under Basel III norms, well above the regulatory minimum of 11.5%. Tier-1 capital stood at 16.4%. The bank attributed the strong ratios to retained earnings and controlled asset growth.',
    date: '2026-08-18',
  },
];

export const newsHeadlines: NewsItem[] = [
  { id: 1, headline: 'Reliance Jio crosses 480 million subscribers, analysts raise price targets', source: 'Economic Times', sentiment: 'positive', timestamp: '2026-08-30 09:15' },
  { id: 2, headline: 'TCS wins multi-year $2.4 billion deal with European retailer', source: 'Mint', sentiment: 'positive', timestamp: '2026-08-29 14:30' },
  { id: 3, headline: 'Infosys cuts FY26 revenue guidance citing weak BFSI demand in North America', source: 'Bloomberg', sentiment: 'negative', timestamp: '2026-08-28 11:00' },
  { id: 4, headline: 'HDFC Bank NIM compression likely to persist for two more quarters, says CFO', source: 'Business Standard', sentiment: 'negative', timestamp: '2026-08-27 16:45' },
  { id: 5, headline: 'ITC diversification into FMCG showing steady margins despite tobacco headwinds', source: 'Financial Express', sentiment: 'neutral', timestamp: '2026-08-26 10:20' },
  { id: 6, headline: 'SBI loan book grows 14% YoY; asset quality improves with GNPA at 2.9%', source: 'LiveMint', sentiment: 'positive', timestamp: '2026-08-25 13:10' },
  { id: 7, headline: 'Tata Motors EV sales hit record high but JLR margins under pressure from tariff costs', source: 'Reuters', sentiment: 'negative', timestamp: '2026-08-24 15:55' },
  { id: 8, headline: 'Adani Group stocks rally as Supreme Court reserves judgment on Hindenburg case', source: 'CNBC-TV18', sentiment: 'positive', timestamp: '2026-08-23 12:00' },
  { id: 9, headline: 'FII inflows into Indian equities reach 3-month high on rate cut hopes', source: 'ET Now', sentiment: 'positive', timestamp: '2026-08-22 09:30' },
  { id: 10, headline: 'Crude oil volatility may impact OMC margins; sector under watch, says rating agency', source: 'Moneycontrol', sentiment: 'neutral', timestamp: '2026-08-21 17:15' },
];
