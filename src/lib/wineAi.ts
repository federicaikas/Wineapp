import { supabase } from './supabase';
import type { WineBottle } from '../types/wine';

export interface MomentoTopResult {
  windowStart: number;
  peakYear: number;
  windowEnd: number;
  summary: string;
  confidence: 'alta' | 'media' | 'bassa';
  sources: Array<{ title: string; url: string }>;
}

/** Errore della ricerca online, con un messaggio già pronto da mostrare. */
export class WineAiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const MESSAGES: Record<string, string> = {
  not_configured: 'Il collegamento al cloud non è configurato.',
  missing_api_key: 'La ricerca online non è ancora attiva: manca la chiave del servizio AI.',
  vintage_unknown: 'Per calcolare il momento top serve un’annata nota.',
};

/**
 * Calcola il momento top cercando davvero su internet (funzione cloud con ricerca web).
 * Non inventa i risultati: se il servizio non risponde, lancia un errore con un messaggio chiaro.
 */
export async function fetchMomentoTop(wine: WineBottle): Promise<MomentoTopResult> {
  if (!supabase) throw new WineAiError('not_configured', MESSAGES.not_configured);

  const { data, error } = await supabase.functions.invoke('wine-drinking-window', {
    body: {
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage,
      appellation: wine.appellation,
      region: wine.region,
      country: wine.country,
      category: wine.category,
      grapes: wine.grapes,
    },
  });

  if (error) {
    let code = 'upstream';
    try {
      const ctx = (error as { context?: Response }).context;
      const body = ctx ? await ctx.json() : null;
      if (body?.error) code = String(body.error);
    } catch {
      /* risposta non leggibile */
    }
    throw new WineAiError(code, MESSAGES[code] ?? 'Ricerca online non riuscita. Riprova tra poco.');
  }

  return data as MomentoTopResult;
}
