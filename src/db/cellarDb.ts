import Dexie, { type Table } from 'dexie';
import type { WineBottle, CellarStats, WineFormData } from '../types/wine';
import type { WineCategory } from '../components/design-system/atoms/Badge';
import { SEED_WINES } from './seedWines';
import { calculateWineLocation } from '../utils/locationUtils';

export class CellarDatabase extends Dexie {
  wines!: Table<WineBottle, string>;

  constructor() {
    super('CellarEnotequeDB');
    this.version(1).stores({
      wines: 'id, name, producer, vintage, category, drinkingStatus, stock, favorite, createdAt, updatedAt',
    });
    this.on('populate', () => {
      this.wines.bulkAdd(SEED_WINES);
    });
  }
}

export const db = new CellarDatabase();

// Inizializzazione automatica e popolamento cantina utente
export async function initializeDatabase(): Promise<void> {
  const isPopulatedKey = 'cellar_wines_imported_user_v1';
  if (!localStorage.getItem(isPopulatedKey)) {
    await db.wines.clear();
    await db.wines.bulkAdd(SEED_WINES);
    localStorage.setItem(isPopulatedKey, 'true');
  }

  // Migrazione automatica: trasforma tutte le annate 2026 in 0 (Sconosciuta)
  await migrateVintage2026ToUnknown();
  // Migrazione automatica: trasforma tutte le bottiglie "ready" in "aging" (Affinamento)
  await migrateReadyToAging();
  // Migrazione automatica: ricalcola le ubicazioni delle rastrelliere (Rack 1 sx, Rack 2 centro, Rack 3 dx, Rack 4 mobile)
  await migrateLocations();
}

export async function migrateVintage2026ToUnknown(): Promise<number> {
  try {
    const wines2026 = await db.wines.filter((w) => w.vintage === 2026).toArray();
    if (wines2026.length > 0) {
      await db.wines.bulkUpdate(
        wines2026.map((w) => ({
          key: w.id,
          changes: { vintage: 0 },
        }))
      );
    }
    return wines2026.length;
  } catch (err) {
    console.error('Errore migrazione annate 2026:', err);
    return 0;
  }
}

export async function migrateReadyToAging(): Promise<number> {
  try {
    const readyWines = await db.wines.filter((w) => w.drinkingStatus === 'ready').toArray();
    if (readyWines.length > 0) {
      await db.wines.bulkUpdate(
        readyWines.map((w) => ({
          key: w.id,
          changes: { drinkingStatus: 'aging' as const },
        }))
      );
    }
    return readyWines.length;
  } catch (err) {
    console.error('Errore migrazione status pronti in affinamento:', err);
    return 0;
  }
}

export async function migrateLocations(): Promise<number> {
  try {
    const allWines = await db.wines.toArray();
    if (allWines.length > 0) {
      const updates = allWines.map((w) => ({
        key: w.id,
        changes: {
          location: calculateWineLocation(w),
        },
      }));
      await db.wines.bulkUpdate(updates);
    }
    return allWines.length;
  } catch (err) {
    console.error('Errore ricalcolo ubicazione rack cantina:', err);
    return 0;
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

export async function addWinesBatch(winesData: WineFormData[]): Promise<number> {
  const now = new Date().toISOString();
  const bottlesToInsert: WineBottle[] = winesData.map((data, index) => ({
    ...data,
    id: `wine-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    uncorkedCount: 0,
    createdAt: now,
    updatedAt: now,
  }));
  await db.wines.bulkAdd(bottlesToInsert);
  return bottlesToInsert.length;
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
  const createCategoryCounts = (): Record<WineCategory, number> => ({
    red: 0,
    white: 0,
    sparkling: 0,
    rose: 0,
    orange: 0,
    dessert: 0,
  });

  return wines.reduce(
    (acc, wine) => {
      acc.totalBottles += wine.stock;
      acc.uniqueLabels += 1;
      acc.totalEstimatedValue += (wine.price || 0) * wine.stock;

      if (wine.stock > 0) {
        // Increment global category breakdown
        if (wine.category in acc.categoryBreakdown) {
          acc.categoryBreakdown[wine.category] += wine.stock;
          acc.statusCategoryBreakdown.all[wine.category] += wine.stock;
        }

        // Increment per drinking status
        if (wine.drinkingStatus === 'ready') {
          acc.readyToDrinkCount += wine.stock;
          acc.statusCategoryBreakdown.ready[wine.category] = (acc.statusCategoryBreakdown.ready[wine.category] || 0) + wine.stock;
        }
        if (wine.drinkingStatus === 'aging') {
          acc.agingCount += wine.stock;
          acc.statusCategoryBreakdown.aging[wine.category] = (acc.statusCategoryBreakdown.aging[wine.category] || 0) + wine.stock;
        }
        if (wine.drinkingStatus === 'peak') {
          acc.peakCount += wine.stock;
          acc.statusCategoryBreakdown.peak[wine.category] = (acc.statusCategoryBreakdown.peak[wine.category] || 0) + wine.stock;
        }
      } else {
        acc.depletedCount += 1;
      }

      if (wine.favorite) acc.favoritesCount += 1;

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
      categoryBreakdown: createCategoryCounts(),
      statusCategoryBreakdown: {
        all: createCategoryCounts(),
        ready: createCategoryCounts(),
        peak: createCategoryCounts(),
        aging: createCategoryCounts(),
      },
    }
  );
}
