import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, addWine, addWinesBatch, updateWine, deleteWine, adjustStock, toggleFavorite, resetToDefaultSeed, computeCellarStats } from '../db/cellarDb';
import type { WineBottle, WineFormData, CellarStats } from '../types/wine';
import type { WineCategory } from '../components/design-system/atoms/Badge';
import type { SortOption } from '../components/design-system/molecules/SearchFilterBar';
import confetti from 'canvas-confetti';

export function useCellar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WineCategory | 'all'>('all');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'all' | 'IT' | 'FR' | 'ES' | 'EE'>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('date-desc');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [selectedWine, setSelectedWine] = useState<WineBottle | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<WineBottle | null>(null);

  // Inizializza il database in background al montaggio se vuoto
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Live query puramente di lettura (senza transazioni di scrittura)
  const allWines = useLiveQuery(() => db.wines.toArray(), []) || [];

  // Calcolo statistiche globali della cantina
  const stats: CellarStats = computeCellarStats(allWines);

  // Filtraggio e Ordinamento (Mostra solo le bottiglie presenti in cantina con stock > 0)
  const filteredWines = allWines.filter((wine) => {
    // Le bottiglie con scorte esaurite (stock <= 0) sconsigliano dalla cantina e vanno in "Stappate"
    if (wine.stock <= 0) {
      return false;
    }
    // Filtro per prezzo massimo
    if (wine.price > maxPrice) {
      return false;
    }
    // Filtro per categoria
    if (selectedCategory !== 'all' && wine.category !== selectedCategory) {
      return false;
    }
    // Filtro per Paese (IT, FR, ES, EE)
    if (selectedCountryFilter !== 'all') {
      const country = (wine.country || 'Italia').trim().toLowerCase();
      if (selectedCountryFilter === 'IT' && !country.includes('ital')) return false;
      if (selectedCountryFilter === 'FR' && !country.includes('franc')) return false;
      if (selectedCountryFilter === 'ES' && !country.includes('spagn') && !country.includes('spain')) return false;
      if (selectedCountryFilter === 'EE' && (country.includes('ital') || country.includes('franc') || country.includes('spagn') || country.includes('spain'))) return false;
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

  const handleAddWinesBatch = useCallback(async (dataArray: WineFormData[]) => {
    const count = await addWinesBatch(dataArray);
    setIsAddDrawerOpen(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#9F0000', '#A0A738', '#FFCC79', '#F2542D'],
    });
    return count;
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
    selectedCountryFilter,
    setSelectedCountryFilter,
    selectedSort,
    setSelectedSort,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    maxPrice,
    setMaxPrice,
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
