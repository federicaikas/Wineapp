import { useState, useEffect } from 'react';
import { useCellar } from './hooks/useCellar';
import { useAuth } from './hooks/useAuth';
import { CellarHeader, CellarGrid, QuickAddDrawer, WineDetailModal, AuthModal, AuthCard } from './components/organisms';
import { DesignSystemShowcase, Divider } from './components/design-system';
import affinappLogo from './assets/affinapp-logo.svg';
import { CellarStatsPage } from './components/pages/CellarStatsPage';
import { UncorkedWinesPage } from './components/pages/UncorkedWinesPage';
import { ManageCellarPage } from './components/pages/ManageCellarPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function CellarAppContent() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'cellar' | 'stats' | 'uncorked' | 'showcase' | 'manage'>('cellar');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const {
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
  } = useCellar();

  const totalUncorkedCount = allWines.reduce((sum, w) => sum + (w.uncorkedCount || (w.stock === 0 ? 1 : 0)), 0);

  const handleGoHome = () => {
    setViewMode('cellar');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCountryFilter('all');
    setFilterFavoritesOnly(false);
    setSelectedWine(null);
    // Ordine casuale e sempre diverso ad ogni clic sulla Home
    setSelectedSort('random');
    reshuffle();
  };

  const handleOpenRandomWine = () => {
    // Seleziona solo vini disponibili in cantina (stock > 0)
    const availableWines = allWines.filter((w) => w.stock > 0);
    if (availableWines.length === 0) {
      alert('Non ci sono bottiglie disponibili attualmente in cantina!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableWines.length);
    setSelectedWine(availableWines[randomIndex]);
  };

  return (
    <div className="cellar-app">
      {/* Barra Scrollytelling Cantina */}
      <div
        className="cellar-scrollytelling-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Testata di Cantina */}
      <CellarHeader
        stats={stats}
        uncorkedCount={totalUncorkedCount}
        currentView={viewMode}
        onOpenAdd={() => {
          setEditingWine(null);
          setIsAddDrawerOpen(true);
        }}
        onResetSeed={handleResetSeed}
        filterFavoritesOnly={filterFavoritesOnly}
        onToggleFilterFavorites={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
        onOpenUncorked={() => setViewMode(viewMode === 'uncorked' ? 'cellar' : 'uncorked')}
        onOpenRandomWine={handleOpenRandomWine}
        onOpenManage={() => setViewMode('manage')}
        onGoHome={handleGoHome}
      />

      {viewMode === 'stats' ? (
        <CellarStatsPage
          wines={allWines}
          stats={stats}
          onBack={() => setViewMode('cellar')}
          onSelectWine={(wine) => setSelectedWine(wine)}
        />
      ) : viewMode === 'manage' ? (
        <ManageCellarPage
          wines={allWines}
          onBack={() => setViewMode('cellar')}
          onOpenAdd={() => setIsAddDrawerOpen(true)}
          onImportWines={async (w) => { await handleAddWinesBatch(w); }}
        />
      ) : viewMode === 'uncorked' ? (
        <UncorkedWinesPage
          wines={allWines}
          onBack={() => setViewMode('cellar')}
          onSelectWine={(wine) => setSelectedWine(wine)}
          onEditWine={(wine) => setEditingWine(wine)}
          onStockChange={handleStockChange}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : viewMode === 'showcase' ? (
        <DesignSystemShowcase />
      ) : !user ? (
        <main className="cellar-main cellar-main--auth">
          <AuthCard inline />
        </main>
      ) : (
        <main className="cellar-main">
          <CellarGrid
            wines={filteredWines}
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCountryFilter={selectedCountryFilter}
            onCountryFilterChange={setSelectedCountryFilter}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            minStock={minStock}
            onMinStockChange={setMinStock}
            onSelectWine={(wine) => setSelectedWine(wine)}
            onEditWine={(wine) => setEditingWine(wine)}
            onStockChange={handleStockChange}
            onToggleFavorite={handleToggleFavorite}
            onOpenAdd={() => {
              setEditingWine(null);
              setIsAddDrawerOpen(true);
            }}
            onOpenStats={() => setViewMode('stats')}
          />
        </main>
      )}

      {/* Drawer di Registrazione / Modifica Bottiglia */}
      <QuickAddDrawer
        isOpen={isAddDrawerOpen || editingWine !== null}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setEditingWine(null);
        }}
        onSave={async (data) => {
          if (editingWine) {
            await handleUpdateWine(editingWine.id, data);
          } else {
            await handleAddWine(data);
          }
        }}
        onSaveBatch={async (dataArray) => {
          await handleAddWinesBatch(dataArray);
        }}
        editingWine={editingWine}
      />

      {/* Modal Dossier di Degustazione Completo */}
      <WineDetailModal
        wine={selectedWine}
        isOpen={selectedWine !== null}
        onClose={() => setSelectedWine(null)}
        onEdit={(wine) => {
          setEditingWine(wine);
        }}
        onDelete={handleDeleteWine}
        onStockChange={handleStockChange}
        onToggleFavorite={handleToggleFavorite}
        onUpdateWine={handleUpdateWine}
      />

      {/* Modal Autenticazione (se aperto manualmente) */}
      <AuthModal />

      {/* Footer */}
      <footer className="cellar-footer">
        <div className="cellar-footer__inner">
          <button
            type="button"
            className="cellar-footer__brand"
            onClick={handleGoHome}
            title="Torna alla Cantina (Home)"
            aria-label="AFFINAPP — torna alla Home"
          >
            <img src={affinappLogo} alt="AFFINAPP" className="cellar-footer__logo" />
          </button>
          {user && (
            <button
              type="button"
              className="cellar-footer__manage-link"
              onClick={() => setViewMode('manage')}
            >
              Carica tutti i dati della tua cantina in un click
            </button>
          )}
          <Divider variant="ornament" symbol="◆ ❦ ◆" spacing="sm" />
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CellarAppContent />
    </AuthProvider>
  );
}

export default App;

