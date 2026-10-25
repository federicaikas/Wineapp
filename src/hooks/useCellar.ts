import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, addWine, addWinesBatch, updateWine, deleteWine, adjustStock, toggleFavorite, resetToDefaultSeed, computeCellarStats } from '../db/cellarDb';
import type { WineBottle, WineFormData, CellarStats } from '../types/wine';
import type { WineCategory } from '../components/design-system/atoms/Badge';
import type { SortOption } from '../components/design-system/molecules/SearchFilterBar';
import confetti from 'canvas-confetti';

import { useAuth } from './useAuth';
import {
  fetchUserWinesFromSupabase,
  syncWineToSupabase,
  deleteWineFromSupabase,
} from '../lib/supabaseSync';
import { getWineCountryCode } from '../utils/countryFlags';

export function useCellar() {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WineCategory | 'all'>('all');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'all' | 'IT' | 'FR' | 'ES' | 'EE'>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('random');
  // Seme dell'ordine casuale: cambia ad ogni "reshuffle" (clic sulla Home) e al caricamento
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Math.floor(Math.random() * 2147483647));
  const reshuffle = useCallback(() => setShuffleSeed(Math.floor(Math.random() * 2147483647)), []);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  // Disponibilità minima: mostra solo vini con almeno N bottiglie (1 = nessun filtro extra)
  const [minStock, setMinStock] = useState<number>(1);
  const [selectedWine, setSelectedWine] = useState<WineBottle | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<WineBottle | null>(null);

  // Inizializza il database in background e sincronizza con Supabase se loggato
  useEffect(() => {
    const syncWithUser = async () => {
      await initializeDatabase();
      if (userId) {
        // Carica i vini dal cloud Supabase per questo account
        const cloudWines = await fetchUserWinesFromSupabase(userId);
        await db.wines.clear();
        if (cloudWines.length > 0) {
          await db.wines.bulkAdd(cloudWines);
        }
      } else {
        // Utente non autenticato: cantina pulita
        await db.wines.clear();
      }
    };

    syncWithUser().catch(console.error);
  }, [userId]);

  // Live query puramente di lettura (senza transazioni di scrittura)
  const allWines = useLiveQuery(() => db.wines.toArray(), []) || [];

  // Calcolo statistiche globali della cantina
  const stats: CellarStats = computeCellarStats(allWines);

  // Filtraggio e Ordinamento (Mostra solo le bottiglie presenti in cantina con stock > 0)
  const filteredWines = allWines.filter((wine) => {
    // Le bottiglie con scorte esaurite (stock <= 0) sconsigliano dalla cantina e vanno in "Stappate"
    if (wine.stock <= 0 || wine.stock < minStock) {
      return false;
    }
    // Filtro per prezzo massimo (500 corrisponde al limite massimo "Qualsiasi prezzo / Nessun limite")
    if (maxPrice < 500 && wine.price > maxPrice) {
      return false;
    }
    // Filtro per categoria
    if (selectedCategory !== 'all' && wine.category !== selectedCategory) {
      return false;
    }
    // Filtro per Paese (IT, FR, ES, EE) con classificazione geografica intelligente
    if (selectedCountryFilter !== 'all') {
      const wineCountryCode = getWineCountryCode(wine);
      if (wineCountryCode !== selectedCountryFilter) {
        return false;
      }
    }
    // Filtro per preferiti
    if (filterFavoritesOnly && !wine.favorite) {
      return false;
    }
    // Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = wine.name.toLowerCase().includes(q);
      const matchProducer = wine.producer.toLowerCase().includes(q);
      const matchAppellation = wine.appellation.toLowerCase().includes(q);
      const matchRegion = wine.region.toLowerCase().includes(q);
      const matchVintage = wine.vintage.toString().includes(q);
      const matchGrapes = wine.grapes?.some((g) => g.toLowerCase().includes(q));
      const matchLocation = wine.location.toLowerCase().includes(q);
      return matchName || matchProducer || matchAppellation || matchRegion || matchVintage || matchGrapes || matchLocation;
    }
    return true;
  });

  // Ordinamento
  const randomKey = (id: string): number => {
    let h = 2166136261 ^ shuffleSeed;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  };

  filteredWines.sort((a, b) => {
    switch (selectedSort) {
      case 'random':
        return randomKey(a.id) - randomKey(b.id);
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'vintage-desc':
        return a.vintage - b.vintage; // Più maturo prima (es. 2010 prima di 2021)
      case 'vintage-asc':
        return b.vintage - a.vintage; // Più giovane prima
      case 'price-desc':
        return b.price - a.price;
      case 'price-asc':
        return a.price - b.price;
      case 'stock-desc':
        return b.stock - a.stock;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Operazione di stappatura / variazione scorte con micro-celebrazione
  const handleStockChange = useCallback(async (id: string, delta: number) => {
    const result = await adjustStock(id, delta);
    if (userId) {
      const updated = await db.wines.get(id);
      if (updated) {
        syncWineToSupabase(updated, userId).catch(console.error);
      }
    }
    if (result.uncorked) {
      // Effetto stappatura calice con ceralacca dorata & bordeaux
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#722F37', '#B8860B', '#DFC06B', '#F5E1DA'],
        disableForReducedMotion: true,
      });
    }
  }, [userId]);

  const handleToggleFavorite = useCallback(async (id: string) => {
    await toggleFavorite(id);
    if (userId) {
      const updated = await db.wines.get(id);
      if (updated) {
        syncWineToSupabase(updated, userId).catch(console.error);
      }
    }
  }, [userId]);

  const handleAddWine = useCallback(async (data: WineFormData) => {
    const created = await addWine(data);
    if (userId) {
      syncWineToSupabase(created, userId).catch(console.error);
    }
    setIsAddDrawerOpen(false);
    return created;
  }, [userId]);

  const handleAddWinesBatch = useCallback(async (dataArray: WineFormData[]) => {
    const count = await addWinesBatch(dataArray);
    if (userId) {
      const allCurrent = await db.wines.toArray();
      for (const b of allCurrent) {
        syncWineToSupabase(b, userId).catch(console.error);
      }
    }
    setIsAddDrawerOpen(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#9F0000', '#A0A738', '#FFCC79', '#F2542D'],
    });
    return count;
  }, [userId]);

  const handleUpdateWine = useCallback(async (id: string, data: Partial<WineBottle>) => {
    await updateWine(id, data);
    const refreshed = await db.wines.get(id);
    if (userId && refreshed) {
      syncWineToSupabase(refreshed, userId).catch(console.error);
    }
    setEditingWine(null);
    if (selectedWine?.id === id && refreshed) {
      setSelectedWine(refreshed);
    }
  }, [selectedWine, userId]);

  const handleDeleteWine = useCallback(async (id: string) => {
    await deleteWine(id);
    if (userId) {
      deleteWineFromSupabase(id, userId).catch(console.error);
    }
    if (selectedWine?.id === id) {
      setSelectedWine(null);
    }
  }, [selectedWine, userId]);

  const handleResetSeed = useCallback(async () => {
    await resetToDefaultSeed();
  }, []);

  return {
    allWines,
    filteredWines,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCountryFilter,
    setSelectedCountryFilter,
    selectedSort,
    setSelectedSort,
    reshuffle,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    maxPrice,
    setMaxPrice,
    minStock,
    setMinStock,
    selectedWine,
    setSelectedWine,
    isAddDrawerOpen,
    setIsAddDrawerOpen,
    editingWine,
    setEditingWine,
    handleStockChange,
    handleToggleFavorite,
    handleAddWine,
    handleAddWinesBatch,
    handleUpdateWine,
    handleDeleteWine,
    handleResetSeed,
  };
}
