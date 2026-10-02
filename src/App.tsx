import { useCellar } from './hooks/useCellar';
import { CellarHeader, CellarGrid, QuickAddDrawer, WineDetailModal } from './components/organisms';
import './App.css';

export function App() {
  const {
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
  } = useCellar();

  return (
    <div className="cellar-app">
      {/* Testata di Cantina */}
      <CellarHeader
        stats={stats}
        onOpenAdd={() => {
          setEditingWine(null);
          setIsAddDrawerOpen(true);
        }}
        onResetSeed={handleResetSeed}
        filterFavoritesOnly={filterFavoritesOnly}
        onToggleFilterFavorites={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
      />

      {/* Main Workspace con Griglia e Filtri */}
      <main className="cellar-main">
        <CellarGrid
          wines={filteredWines}
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onSelectWine={(wine) => setSelectedWine(wine)}
          onStockChange={handleStockChange}
          onToggleFavorite={handleToggleFavorite}
          onOpenAdd={() => {
            setEditingWine(null);
            setIsAddDrawerOpen(true);
          }}
        />
      </main>

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
      />

      {/* Footer Editoriale O,nice! Studio */}
      <footer className="cellar-footer">
        <div className="cellar-footer__inner">
          <div className="cellar-footer__lot">
            <span>REGISTRO DI CANTINA PRIVATA • LOT N° 2026/04</span>
          </div>
          <p className="cellar-footer__credits">
            CELLAR — Curatela, archivio e catalogazione enologica sartoriale.
            <br />
            Design &amp; Tipografia ispirati all’estetica materica di <em>O,nice! Studio</em>.
          </p>
          <div className="cellar-footer__ornament">
            <span>◆ ❦ ◆</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
