import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, addWine, updateWine, deleteWine, adjustStock, toggleFavorite, resetToDefaultSeed, computeCellarStats } from '../db/cellarDb';
import { WineBottle, WineFormData, CellarStats } from '../types/wine';
import { WineCategory } from '../components/design-system/atoms/Badge';
import { SortOption } from '../components/design-system/molecules/SearchFilterBar';
import confetti from 'canvas-confetti';

export function useCellar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WineCategory | 'all'>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('date-desc');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineBottle | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<WineBottle | null>(null);

  // Assicura l'inizializzazione del database
  const allWines = useLiveQuery(async () => {
    await initializeDatabase();
    return db.wines.toArray();
  }, []) || [];

  // Calcolo statistiche globali della cantina
  const stats: CellarStats = computeCellarStats(allWines);

  // Filtraggio e Ordinamento
  const filteredWines = allWines.filter((wine) => {
    // Filtro per categoria
    if (selectedCategory !== 'all' && wine.category !== selectedCategory) {
      return false;
    }
    // Filtro per preferiti
    if (filterFavoritesOnly && !wine.favorite) {
      return false;
    }
    // Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = wine.name.toLowerCase().includes(q);
      const matchProducer = wine.producer.toLowerCase().includes(q);
      const matchAppellation = wine.appellation.toLowerCase().includes(q);
      const matchRegion = wine.region.toLowerCase().includes(q);
      const matchVintage = wine.vintage.toString().includes(q);
      const matchGrapes = wine.grapes.some((g) => g.toLowerCase().includes(q));
      const matchLocation = wine.location.toLowerCase().includes(q);
      return matchName || matchProducer || matchAppellation || matchRegion || matchVintage || matchGrapes || matchLocation;
    }
    return true;
  });

  // Ordinamento
  filteredWines.sort((a, b) => {
    switch (selectedSort) {
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'vintage-desc':
        return a.vintage - b.vintage; // Più maturo prima (es. 2010 prima di 2021)
      case 'vintage-asc':
        return b.vintage - a.vintage; // Più giovane prima
      case 'rating-desc':
        return (b.criticScore || b.rating * 20) - (a.criticScore || a.rating * 20);
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
  }, []);

  const handleToggleFavorite = useCallback(async (id: string) => {
    await toggleFavorite(id);
  }, []);

  const handleAddWine = useCallback(async (data: WineFormData) => {
    const created = await addWine(data);
    setIsAddDrawerOpen(false);
    return created;
  }, []);

  const handleUpdateWine = useCallback(async (id: string, data: Partial<WineBottle>) => {
    await updateWine(id, data);
    setEditingWine(null);
    if (selectedWine?.id === id) {
      const refreshed = await db.wines.get(id);
      if (refreshed) setSelectedWine(refreshed);
    }
  }, [selectedWine]);

  const handleDeleteWine = useCallback(async (id: string) => {
    await deleteWine(id);
    if (selectedWine?.id === id) {
      setSelectedWine(null);
    }
  }, [selectedWine]);

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
    selectedSort,
    setSelectedSort,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    selectedWine,
    setSelectedWine,
    isAddDrawerOpen,
    setIsAddDrawerOpen,
    editingWine,
    setEditingWine,
    handleStockChange,
    handleToggleFavorite,
    handleAddWine,
    handleUpdateWine,
    handleDeleteWine,
    handleResetSeed,
  };
}
