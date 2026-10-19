import React, { useState } from 'react';
import type { WineBottle, CellarStats } from '../../types/wine';
import { WineCard } from './WineCard';
import { SearchFilterBar, type SortOption } from '../design-system/molecules/SearchFilterBar';
import { EmptyState, Badge, FeatureCard, Typography, StockCounter, RatingStars, Tag } from '../design-system';
import type { WineCategory } from '../design-system/atoms/Badge';
import { LayoutGrid, List } from 'lucide-react';
import './CellarGrid.css';

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
      {/* Sezione Superiore: Statistiche Cantina (80%) e Legenda (20%) su desktop */}
      <div className="cellar-top-banner">
        {onOpenStats && (
          <section className="cellar-top-banner__stats" aria-label="Statistiche della Cantina">
            <FeatureCard
              badgeText="REPORT & ANALISI"
              title="Statistiche Cantina"
              onClick={onOpenStats}
              accentBorder={true}
              className="cellar-stats-card-link"
            >
              <div className="cellar-stats-card-link__content">
                <div className="cellar-stats-card-link__number-group">
                  <span className="cellar-stats-card-link__bottles-count">
                    <strong>{stats.totalBottles}</strong> {stats.totalBottles === 1 ? 'bottiglia totale' : 'bottiglie totali'}
                  </span>
                  <span className="cellar-stats-card-link__open-text">
                    Apri statistiche →
                  </span>
                </div>
                <span className="cellar-stats-card-link__subtitle">
                  Consulta patrimonio, tipologie e mappa delle regioni
                </span>
              </div>
            </FeatureCard>
          </section>
        )}

        {/* Legenda Colori & Tipologie Vino (visibile su desktop, nascosta solo da mobile) */}
        <div className="cellar-color-legend" aria-label="Legenda Colori e Tipologie Vini">
          <span className="cellar-color-legend__title">Legenda Tipologie:</span>
          <div className="cellar-color-legend__items">
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'red' ? 'all' : 'red')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="red" size="sm">Rosso</Badge>
            </div>
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'white' ? 'all' : 'white')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="white" size="sm">Bianco</Badge>
            </div>
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'sparkling' ? 'all' : 'sparkling')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="sparkling" size="sm">Bollicine</Badge>
            </div>
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'rose' ? 'all' : 'rose')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="rose" size="sm">Rosato</Badge>
            </div>
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'orange' ? 'all' : 'orange')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="orange" size="sm">Orange</Badge>
            </div>
            <div className="cellar-color-legend__item" onClick={() => onCategoryChange(selectedCategory === 'dessert' ? 'all' : 'dessert')} style={{ cursor: 'pointer' }}>
              <Badge variant="wine-type" category="dessert" size="sm">Dolce</Badge>
            </div>
          </div>
        </div>
      </div>

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
      ) : viewMode === 'grid' ? (
        /* Vista a Griglia Etichette */
        <div className="cellar-cards-grid">
          {wines.map((wine) => (
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
            {wines.map((wine) => (
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
    </div>
  );
};

