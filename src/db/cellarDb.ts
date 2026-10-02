import Dexie, { Table } from 'dexie';
import { WineBottle, CellarStats, WineFormData } from '../types/wine';
import { SEED_WINES } from './seedWines';

export class CellarDatabase extends Dexie {
  wines!: Table<WineBottle, string>;

  constructor() {
    super('CellarEnotequeDB');
    this.version(1).stores({
      wines: 'id, name, producer, vintage, category, drinkingStatus, stock, favorite, createdAt, updatedAt',
    });
  }
}

export const db = new CellarDatabase();

// Inizializzazione automatica con i seed data se vuoto
export async function initializeDatabase(): Promise<void> {
  const count = await db.wines.count();
  if (count === 0) {
    await db.wines.bulkAdd(SEED_WINES);
  }
}

// Operazioni CRUD
export async function getAllWines(): Promise<WineBottle[]> {
  await initializeDatabase();
  return db.wines.orderBy('createdAt').reverse().toArray();
}

export async function getWineById(id: string): Promise<WineBottle | undefined> {
  return db.wines.get(id);
}

export async function addWine(data: WineFormData): Promise<WineBottle> {
  const now = new Date().toISOString();
  const id = `wine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newBottle: WineBottle = {
    ...data,
    id,
    uncorkedCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.wines.add(newBottle);
  return newBottle;
}

export async function updateWine(id: string, updates: Partial<WineBottle>): Promise<void> {
  const now = new Date().toISOString();
  await db.wines.update(id, {
    ...updates,
    updatedAt: now,
  });
}

export async function deleteWine(id: string): Promise<void> {
  await db.wines.delete(id);
}

export async function adjustStock(id: string, delta: number): Promise<{ newStock: number; uncorked: boolean }> {
  const wine = await db.wines.get(id);
  if (!wine) throw new Error('Vino non trovato');

  const newStock = Math.max(0, wine.stock + delta);
  const uncorked = delta < 0;
  const newUncorked = uncorked ? (wine.uncorkedCount || 0) + Math.abs(delta) : (wine.uncorkedCount || 0);

  await updateWine(id, {
    stock: newStock,
    uncorkedCount: newUncorked,
  });

  return { newStock, uncorked };
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const wine = await db.wines.get(id);
  if (!wine) return false;
  const newFav = !wine.favorite;
  await updateWine(id, { favorite: newFav });
  return newFav;
}

export async function resetToDefaultSeed(): Promise<void> {
  await db.wines.clear();
  await db.wines.bulkAdd(SEED_WINES);
}

export async function exportCellarData(): Promise<string> {
  const wines = await db.wines.toArray();
  return JSON.stringify(wines, null, 2);
}

export async function importCellarData(jsonString: string): Promise<number> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error('Formato non valido');
    await db.wines.clear();
    await db.wines.bulkAdd(parsed);
    return parsed.length;
  } catch (err) {
    throw new Error('Impossibile importare il file JSON: dati non conformi.');
  }
}

// Calcolo Statistiche Cantina
export function computeCellarStats(wines: WineBottle[]): CellarStats {
  const initialCategoryCounts = {
    red: 0,
    white: 0,
    sparkling: 0,
    rose: 0,
    orange: 0,
    dessert: 0,
  };

  return wines.reduce(
    (acc, wine) => {
      acc.totalBottles += wine.stock;
      acc.uniqueLabels += 1;
      acc.totalEstimatedValue += (wine.price || 0) * wine.stock;

      if (wine.stock > 0) {
        if (wine.drinkingStatus === 'ready') acc.readyToDrinkCount += wine.stock;
        if (wine.drinkingStatus === 'aging') acc.agingCount += wine.stock;
        if (wine.drinkingStatus === 'peak') acc.peakCount += wine.stock;
      } else {
        acc.depletedCount += 1;
      }

      if (wine.favorite) acc.favoritesCount += 1;

      if (wine.category in acc.categoryBreakdown) {
        acc.categoryBreakdown[wine.category] += wine.stock;
      }

      return acc;
    },
    {
      totalBottles: 0,
      uniqueLabels: 0,
      totalEstimatedValue: 0,
      readyToDrinkCount: 0,
      agingCount: 0,
      peakCount: 0,
      favoritesCount: 0,
      depletedCount: 0,
      categoryBreakdown: initialCategoryCounts,
    }
  );
}
