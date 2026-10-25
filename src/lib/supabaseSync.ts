import { supabase } from './supabase';
import type { WineBottle } from '../types/wine';
import type { Database } from '../types/database.types';

type WineRow = Database['public']['Tables']['wines']['Row'];
type WineInsert = Database['public']['Tables']['wines']['Insert'];

/**
 * Converte una riga del database Supabase nel modello TypeScript WineBottle
 */
export function dbRowToWine(row: WineRow): WineBottle {
  const tasting = (row.tasting_notes as any) || {};

  return {
    id: row.id,
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    category: row.category,
    subCategory: row.sub_category || undefined,
    appellation: row.appellation || '',
    country: row.country,
    region: row.region,
    grapes: row.grapes || [],
    alcohol: row.alcohol ? Number(row.alcohol) : 13.5,
    bottleSize: row.bottle_size || '750 ml',
    stock: row.stock,
    price: row.price ? Number(row.price) : 0,
    location: row.location || 'Cantina principale',
    drinkingStatus: row.drinking_status,
    drinkingWindow: {
      start: row.drinking_window_start || row.vintage,
      end: row.drinking_window_end || row.vintage + 5,
      peakYear: row.drinking_window_peak || row.vintage + 2,
    },
    rating: 4,
    lotNumber: '',
    favorite: row.favorite ?? false,
    purchaseChannel: row.purchase_channel || 'cantina',
    notes: row.notes || undefined,
    uncorkedCount: 0,
    imageUrl: row.image_url || undefined,
    aiCalculated: row.ai_calculated ?? false,
    aiCalculatedDetails: row.ai_details || undefined,
    tastingNotes: {
      aroma: Array.isArray(tasting.aroma) ? tasting.aroma : [],
      palate: typeof tasting.palate === 'string' ? tasting.palate : '',
      pairing: typeof tasting.pairing === 'string' ? tasting.pairing : '',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Converte il modello WineBottle nella riga d'inserimento o aggiornamento per Supabase
 */
export function wineToDbInsert(wine: WineBottle, userId: string): WineInsert {
  return {
    id: wine.id.includes('-') && wine.id.length === 36 ? wine.id : undefined, // UUID valido o auto-generato
    user_id: userId,
    name: wine.name,
    producer: wine.producer,
    vintage: wine.vintage,
    country: wine.country || 'Italia',
    region: wine.region || 'Sconosciuta',
    appellation: wine.appellation || null,
    sub_category: wine.subCategory || null,
    category: wine.category,
    grapes: wine.grapes || [],
    alcohol: wine.alcohol || null,
    bottle_size: wine.bottleSize || '750 ml',
    price: wine.price || 0,
    stock: wine.stock,
    favorite: wine.favorite || false,
    location: wine.location || null,
    purchase_channel: wine.purchaseChannel || null,
    drinking_status: wine.drinkingStatus || 'ready',
    drinking_window_start: wine.drinkingWindow?.start || null,
    drinking_window_end: wine.drinkingWindow?.end || null,
    drinking_window_peak: wine.drinkingWindow?.peakYear || null,
    ai_calculated: wine.aiCalculated || false,
    ai_details: wine.aiCalculatedDetails || null,
    tasting_notes: {
      aroma: wine.tastingNotes?.aroma || [],
      palate: wine.tastingNotes?.palate || '',
      pairing: wine.tastingNotes?.pairing || '',
    },
    notes: wine.notes || null,
    image_url: wine.imageUrl || null,
  };
}

/**
 * Recupera tutti i vini dell'utente loggato da Supabase
 */
export async function fetchUserWinesFromSupabase(userId: string): Promise<WineBottle[]> {
  try {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore nel recupero vini da Supabase:', error);
      return [];
    }

    return (data || []).map(dbRowToWine);
  } catch (err) {
    console.error('Errore imprevisto fetchUserWinesFromSupabase:', err);
    return [];
  }
}

/**
 * Sincronizza una bottiglia (inserimento o aggiornamento) su Supabase
 */
export async function syncWineToSupabase(wine: WineBottle, userId: string): Promise<string | null> {
  try {
    const dbPayload = wineToDbInsert(wine, userId);

    const { data, error } = await supabase
      .from('wines')
      .upsert(dbPayload, { onConflict: 'id' })
      .select('id')
      .single();

    if (error) {
      console.error('Errore durante la sincronizzazione su Supabase:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Errore syncWineToSupabase:', err);
    return null;
  }
}

/**
 * Elimina un vino da Supabase
 */
export async function deleteWineFromSupabase(wineId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wines')
      .delete()
      .eq('id', wineId)
      .eq('user_id', userId);

    if (error) {
      console.error('Errore cancellazione vino da Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Errore deleteWineFromSupabase:', err);
    return false;
  }
}
