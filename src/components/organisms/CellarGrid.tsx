import React, { useState } from 'react';
import type { WineBottle, CellarStats } from '../../types/wine';
import { WineCard } from './WineCard';
import { SearchFilterBar, type SortOption } from '../design-system/molecules/SearchFilterBar';
import { EmptyState, Badge, Typography, StockCounter, RatingStars, Tag, Button } from '../design-system';
import type { WineCategory } from '../design-system/atoms/Badge';
import { LayoutGrid, List, ChevronDown, Check, Wine, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import './CellarGrid.css';

const INITIAL_BATCH_SIZE = 10;
const BATCH_INCREMENT = 10;

export interface CellarGridProps {
  wines: WineBottle[];
  stats: CellarStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: WineCategory | 'all';
  onCategoryChange: (cat: WineCategory | 'all') => void;
  selectedCountryFilter?: 'all' | 'IT' | 'FR' | 'ES' | 'EE';
  onCountryFilterChange?: (country: 'all' | 'IT' | 'FR' | 'ES' | 'EE') => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  maxPrice?: number;
  onMaxPriceChange?: (price: number) => void;
  onSelectWine: (wine: WineBottle) => void;
  onEditWine: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAdd: () => void;
  onOpenStats?: () => void;
}

export const CellarGrid: React.FC<CellarGridProps> = ({
  wines,
  stats,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCountryFilter,
  onCountryFilterChange,
  selectedSort,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  onSelectWine,
  onEditWine,
  onStockChange,
  onToggleFavorite,
  onOpenAdd,
  onOpenStats,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);

  // Resetta il conteggio visualizzato al mutare dei filtri o della ricerca senza cascading effect
  const filterKey = `${searchQuery}_${selectedCategory}_${selectedCountryFilter}_${selectedSort}_${maxPrice}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_BATCH_SIZE);
  }

  const totalWinesCount = wines.length;
  const displayedWines = wines.slice(0, visibleCount);
  const hasMore = visibleCount < totalWinesCount;
  const remainingCount = totalWinesCount - visibleCount;
  const nextBatchSize = Math.min(BATCH_INCREMENT, remainingCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, totalWinesCount));
  };

  const handleShowAll = () => {
    setVisibleCount(totalWinesCount);
  };

  const viewToggleElement = (
    <div className="cellar-view-toggle" role="group" aria-label="Modalità visualizzazione">
      <button
        type="button"
        className={`cellar-view-toggle__item ${viewMode === 'grid' ? 'cellar-view-toggle__item--active' : ''}`}
        onClick={() => setViewMode('grid')}
        aria-label="Vista etichette a griglia"
      >
        <LayoutGrid size={15} />
        <span>Griglia</span>
      </button>
      <button
        type="button"
        className={`cellar-view-toggle__item ${viewMode === 'list' ? 'cellar-view-toggle__item--active' : ''}`}
        onClick={() => setViewMode('list')}
        aria-label="Vista registro a catalogo"
      >
        <List size={15} />
        <span>Registro</span>
      </button>
    </div>
  );

  return (
    <div className="cellar-grid-wrapper">
      {/* Dashboard Statistiche a 3 Tile Liquid Glass */}
      {onOpenStats && (
        <section className="cellar-liquid-stats-board" aria-label="Panoramica Statistiche Cantina">
          <div className="cellar-liquid-stats-board__tiles">
            {/* Tile 1: Collezione */}
            <div
              className="cellar-liquid-tile"
              onClick={onOpenStats}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenStats(); }}
              title="Clicca per aprire le statistiche complete"
            >
              <div className="cellar-liquid-tile__header">
                <span className="cellar-liquid-tile__label">BOTTIGLIE IN CANTINA</span>
                <div className="cellar-liquid-tile__icon-glass cellar-liquid-tile__icon-glass--wine">
                  <Wine size={16} />
                </div>
              </div>
              <div className="cellar-liquid-tile__main">
                <span className="cellar-liquid-tile__number">{stats.totalBottles}</span>
                <span className="cellar-liquid-tile__sub">{stats.uniqueLabels} etichette uniche</span>
              </div>
            </div>

            {/* Tile 2: Patrimonio */}
            <div
              className="cellar-liquid-tile"
              onClick={onOpenStats}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenStats(); }}
              title="Clicca per aprire le statistiche complete"
            >
              <div className="cellar-liquid-tile__header">
                <span className="cellar-liquid-tile__label">VALORE STIMATO</span>
                <div className="cellar-liquid-tile__icon-glass cellar-liquid-tile__icon-glass--gold">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="cellar-liquid-tile__main">
                <span className="cellar-liquid-tile__number">
                  € {stats.totalEstimatedValue ? stats.totalEstimatedValue.toLocaleString('it-IT') : '0'}
                </span>
                <span className="cellar-liquid-tile__sub">Patrimonio cantina</span>
              </div>
            </div>

            {/* Tile 3: Pronte al Calice */}
            <div
              className="cellar-liquid-tile"
              onClick={onOpenStats}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenStats(); }}
              title="Clicca per aprire le statistiche complete"
            >
              <div className="cellar-liquid-tile__header">
                <span className="cellar-liquid-tile__label">PRONTE AL CALICE</span>
                <div className="cellar-liquid-tile__icon-glass cellar-liquid-tile__icon-glass--ready">
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="cellar-liquid-tile__main">
                <span className="cellar-liquid-tile__number">{stats.readyToDrinkCount + stats.peakCount}</span>
                <span className="cellar-liquid-tile__sub">All'apice evolutivo</span>
              </div>
            </div>
          </div>

          {/* Footer Bar Liquid Glass per Mappa & Report Completo */}
          <div
            className="cellar-liquid-stats-board__footer"
            onClick={onOpenStats}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenStats(); }}
          >
            <span className="cellar-liquid-stats-board__footer-text">
              Consulta tipologie, valore per cru e mappa delle regioni d'Italia
            </span>
            <span className="cellar-liquid-stats-board__footer-link">
              Apri Report &amp; Mappa <ArrowRight size={14} />
            </span>
          </div>
        </section>
      )}

      {/* Barra Filtri, Ricerca e Toggle Viste */}
      <div className="cellar-grid-toolbar">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedCountryFilter={selectedCountryFilter}
          onCountryFilterChange={onCountryFilterChange}
          selectedSort={selectedSort}
          onSortChange={onSortChange}
          maxPrice={maxPrice}
          onMaxPriceChange={onMaxPriceChange}
          viewToggle={viewToggleElement}
        />
      </div>

      {/* Risultati o Stato Vuoto */}
      {wines.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nessun vino corrisponde alla ricerca' : 'La cantina è attualmente vuota'}
          description={
            searchQuery
              ? `Nessuna bottiglia risponde a "${searchQuery}". Prova a modificare i termini di ricerca o azzerare i filtri.`
              : 'Inizia registrando la tua prima bottiglia di pregio, cru o grande millesimo per valorizzare la tua collezione enologica.'
          }
          actionLabel={searchQuery ? 'Azzera Ricerca' : 'Aggiungi la Prima Bottiglia'}
          onAction={searchQuery ? () => onSearchChange('') : onOpenAdd}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* Vista a Griglia Etichette */
            <div className="cellar-cards-grid">
              {displayedWines.map((wine) => (
                <WineCard
                  key={wine.id}
                  wine={wine}
                  onSelect={onSelectWine}
                  onEdit={onEditWine}
                  onStockChange={onStockChange}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            /* Vista a Registro Sartoriale (Elenco Dettagliato) */
            <div className="cellar-list-ledger">
              <div className="cellar-list-ledger__header">
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-wine">Vino &amp; Produttore</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-vintage">Millesimo</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-category">Tipologia</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-status">Stato Beva</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-rating">Critica</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-stock">Scorte</Typography>
                <Typography variant="eyebrow" color="muted" className="cellar-list-ledger__col-price">Valore</Typography>
              </div>

              <div className="cellar-list-ledger__body">
                {displayedWines.map((wine) => (
                  <div
                    key={wine.id}
                    className="cellar-list-row"
                    onClick={() => onSelectWine(wine)}
                  >
                    <div className="cellar-list-ledger__col-wine">
                      <Typography variant="serif-italic" color="secondary" className="cellar-list-row__producer">
                        {wine.producer}
                      </Typography>
                      <Typography variant="serif-title" size="sm" className="cellar-list-row__name">
                        {wine.name}
                      </Typography>
                      <Typography variant="body-sm" color="muted" className="cellar-list-row__appellation">
                        {wine.appellation} • {wine.region}
                      </Typography>
                    </div>

                    <div className="cellar-list-ledger__col-vintage">
                      <Tag variant="pill">{wine.vintage}</Tag>
                    </div>

                    <div className="cellar-list-ledger__col-category">
                      <Badge variant="wine-type" category={wine.category} size="sm">
                        {wine.category === 'red' && 'Rosso'}
                        {wine.category === 'white' && 'Bianco'}
                        {wine.category === 'sparkling' && 'Bollicine'}
                        {wine.category === 'rose' && 'Rosato'}
                        {wine.category === 'orange' && 'Orange'}
                        {wine.category === 'dessert' && 'Passito'}
                      </Badge>
                    </div>

                    <div className="cellar-list-ledger__col-status">
                      <Badge variant="drinking-status" status={wine.drinkingStatus} size="sm">
                        {wine.drinkingStatus === 'ready' && 'Pronto'}
                        {wine.drinkingStatus === 'aging' && 'Affinamento'}
                        {wine.drinkingStatus === 'peak' && 'All’apice'}
                        {wine.drinkingStatus === 'past' && 'Oltre picco'}
                      </Badge>
                    </div>

                    <div className="cellar-list-ledger__col-rating">
                      {wine.criticScore ? (
                        <Typography variant="stamp-mono" color="primary">
                          {wine.criticScore} PTS
                        </Typography>
                      ) : (
                        <RatingStars value={wine.rating} size="sm" />
                      )}
                    </div>

                    <div
                      className="cellar-list-ledger__col-stock"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StockCounter
                        count={wine.stock}
                        size="sm"
                        onIncrement={() => onStockChange(wine.id, 1)}
                        onDecrement={() => onStockChange(wine.id, -1)}
                      />
                    </div>

                    <div className="cellar-list-ledger__col-price">
                      <Typography variant="serif-title" size="sm" color="primary">
                        € {wine.price}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sezione Carica Altri / Paginazione Sartoriale */}
          {totalWinesCount > INITIAL_BATCH_SIZE && (
            <div className="cellar-load-more-section" aria-label="Controllo paginazione catalogo">
              <div className="cellar-load-more__info">
                <Typography variant="body-sm" color="secondary" className="cellar-load-more__counter">
                  Visualizzati <strong>{displayedWines.length}</strong> di <strong>{totalWinesCount}</strong> vini
                </Typography>
                <div className="cellar-load-more__progress-track" aria-hidden="true">
                  <div
                    className="cellar-load-more__progress-fill"
                    style={{ width: `${Math.min(100, (displayedWines.length / totalWinesCount) * 100)}%` }}
                  />
                </div>
              </div>

              {hasMore ? (
                <div className="cellar-load-more__actions">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleLoadMore}
                    className="cellar-load-more__btn"
                    icon={<ChevronDown size={16} />}
                    iconPosition="right"
                  >
                    Carica altri {nextBatchSize} vini
                  </Button>
                  {remainingCount > BATCH_INCREMENT && (
                    <button
                      type="button"
                      onClick={handleShowAll}
                      className="cellar-load-more__show-all"
                    >
                      Mostra tutti i {totalWinesCount} vini
                    </button>
                  )}
                </div>
              ) : (
                <div className="cellar-load-more__complete">
                  <span className="cellar-load-more__complete-badge">
                    <Check size={14} />
                    Tutti i {totalWinesCount} vini della selezione sono visualizzati
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

