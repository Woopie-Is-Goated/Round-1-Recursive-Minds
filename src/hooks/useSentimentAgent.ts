import { useState, useEffect, useCallback } from 'react';
import type { AgentResult, NewsItem } from '@/types';

interface SentimentState {
  result: AgentResult | null;
  loading: boolean;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSentimentAgent(stockSymbol: string, news: NewsItem[]): SentimentState {
  const [state, setState] = useState<SentimentState>({
    result: null,
    loading: false,
    error: null,
  });

  const fetchSentiment = useCallback(async (symbol: string, headlines: NewsItem[]) => {
    setState({ result: null, loading: true, error: null });

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/sentiment-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          stockSymbol: symbol,
          headlines: headlines.map((h) => ({ headline: h.headline, sentiment: h.sentiment })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `Request failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.label || typeof data.confidence !== 'number' || typeof data.reasoning !== 'string') {
        throw new Error('Invalid response shape from sentiment agent');
      }

      setState({
        result: {
          label: data.label,
          confidence: data.confidence,
          reasoning: data.reasoning,
        },
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        result: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Sentiment Agent unavailable',
      });
    }
  }, []);

  useEffect(() => {
    fetchSentiment(stockSymbol, news);
  }, [stockSymbol, fetchSentiment, news]);

  return state;
}
