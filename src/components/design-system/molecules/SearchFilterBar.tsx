import React, { useState } from 'react';
import { Search, X, ArrowUpDown, SlidersHorizontal, ChevronDown, RotateCcw, Globe } from 'lucide-react';
import { FlagCircle } from '../atoms/FlagCircle';
import type { WineCategory } from '../atoms/Badge';
import './SearchFilterBar.css';

export type SortOption =
  | 'name-desc'
  | 'stock-asc'
  | 'category-asc'
  | 'category-desc'
  | 'status-asc'
  | 'status-desc'
  | 'random'
  | 'date-desc'
  | 'vintage-desc'
  | 'vintage-asc'
  | 'price-desc'
  | 'price-asc'
  | 'stock-desc'
  | 'name-asc';

export type CountryFilterOption = 'all' | 'IT' | 'FR' | 'ES' | 'EE';

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: WineCategory | 'all';
  onCategoryChange: (category: WineCategory | 'all') => void;
  selectedCountryFilter?: CountryFilterOption;
  onCountryFilterChange?: (country: CountryFilterOption) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  maxPrice?: number;
  onMaxPriceChange?: (price: number) => void;
  minStock?: number;
  onMinStockChange?: (n: number) => void;
  viewToggle?: React.ReactNode;
}

const CATEGORIES: Array<{ key: WineCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Tutti' },
  { key: 'red', label: 'Rossi' },
  { key: 'white', label: 'Bianchi' },
  { key: 'sparkling', label: 'Bollicine' },
  { key: 'orange', label: 'Orange' },
  { key: 'rose', label: 'Rosati' },
  { key: 'dessert', label: 'Dolci' },
];

const COUNTRIES: Array<{ key: CountryFilterOption; label: string; flag: React.ReactNode }> = [
  { key: 'all', label: 'Tutte le Nazioni', flag: <Globe size={15} /> },
  { key: 'IT', label: 'IT', flag: <FlagCircle flag="IT" size={16} /> },
  { key: 'FR', label: 'FR', flag: <FlagCircle flag="FR" size={16} /> },
  { key: 'ES', label: 'ES', flag: <FlagCircle flag="ES" size={16} /> },
  { key: 'EE', label: 'EE (Estero)', flag: <Globe size={15} /> },
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCountryFilter = 'all',
  onCountryFilterChange,
  selectedSort,
  onSortChange,
  maxPrice = 500,
  onMaxPriceChange,
  minStock = 1,
  onMinStockChange,
  viewToggle,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCountryFilter !== 'all' ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (minStock > 1 ? 1 : 0);

  const handleResetFilters = () => {
    onCategoryChange('all');
    onCountryFilterChange?.('all');
    onMaxPriceChange?.(500);
    onMinStockChange?.(1);
  };

  return (
    <div className="cellar-filterbar">
      <div className="cellar-filterbar__top">
        {/* Campo di ricerca */}
        <div className="cellar-filterbar__search-wrap">
          <Search className="cellar-filterbar__search-icon" size={18} />
          <input
            type="text"
            className="cellar-filterbar__search-input"
            placeholder="Cerca per produttore, denominazione, vitigno, annata..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cellar-filterbar__clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Cancella ricerca"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Gruppo Controlli: Filtri, Ordina e Griglia/Registro (in una sola riga su mobile) */}
        <div className="cellar-filterbar__actions-group">
          {/* Pulsante Menu a Tendina Filtri Collassati */}
          <button
            type="button"
            className={`cellar-filterbar__dropdown-toggle ${isDropdownOpen ? 'cellar-filterbar__dropdown-toggle--active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <SlidersHorizontal size={15} />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="cellar-filterbar__active-badge">{activeFiltersCount}</span>
            )}
            <ChevronDown
              size={15}
              className={`cellar-filterbar__chevron ${isDropdownOpen ? 'cellar-filterbar__chevron--open' : ''}`}
            />
          </button>

          {/* Ordinamento con testo segnaposto 'ordina' in viola come filtri */}
          <div className="cellar-filterbar__sort-wrap">
            <div className="cellar-filterbar__dropdown-toggle cellar-filterbar__sort-btn">
              <ArrowUpDown size={15} />
              <span>ordina</span>
              <ChevronDown size={15} className="cellar-filterbar__chevron" />
              <select
                className="cellar-filterbar__sort-native-select"
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Ordina bottiglie"
              >
                <option value="date-desc">Recenti prima</option>
                <option value="vintage-desc">Annata: Più maturi</option>
                <option value="vintage-asc">Annata: Più giovani</option>
                <option value="random">Ordine casuale</option>
                <option value="price-desc">Prezzo: Dal più caro</option>
                <option value="price-asc">Prezzo: Dal meno caro</option>
                <option value="stock-desc">Quantità residua</option>
                <option value="name-asc">Nome alfabetico (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Switcher Griglia/Registro */}
          {viewToggle && (
            <div className="cellar-filterbar__toggle-slot">
              {viewToggle}
            </div>
          )}
        </div>
      </div>

      {/* Menu a Tendina Collassato per Filtri (Tipologia & Paese) */}
      {isDropdownOpen && (
        <div className="cellar-filterbar__dropdown-panel">
          {/* Sezione 1: Tipologia di Vino (Senza numeri) */}
          <div className="cellar-filterbar__group">
            <div className="cellar-filterbar__group-title">Tipologia di Vino:</div>
            <div className="cellar-filterbar__chips-row">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`cellar-filterbar__chip ${isSelected ? 'cellar-filterbar__chip--active' : ''} ${cat.key !== 'all' ? `cellar-filterbar__chip--${cat.key}` : ''}`}
                    onClick={() => onCategoryChange(isSelected && cat.key !== 'all' ? 'all' : cat.key)}
                  >
                    <span className="cellar-filterbar__chip-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sezione 2: Paese d'Origine (solo bandiere) */}
          {onCountryFilterChange && (
            <div className="cellar-filterbar__group">
              <div className="cellar-filterbar__group-title">Paese:</div>
              <div className="cellar-filterbar__chips-row">
                {COUNTRIES.map((c) => {
                  const isSelected = selectedCountryFilter === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      className={`cellar-filterbar__chip cellar-filterbar__chip--country ${isSelected ? 'cellar-filterbar__chip--active' : ''}`}
                      onClick={() => onCountryFilterChange(isSelected && c.key !== 'all' ? 'all' : c.key)}
                      title={c.label}
                      aria-label={c.label}
                      aria-pressed={isSelected}
                    >
                      <span className="cellar-filterbar__chip-flag">{c.flag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sezione 3: Disponibilità e prezzo massimo (slider corto) */}
          {onMaxPriceChange && (
            <div className="cellar-filterbar__group cellar-filterbar__group--price">
              <div className="cellar-filterbar__group-title">
                Prezzo max:{' '}
                <strong className="cellar-filterbar__price-value">
                  {maxPrice >= 500 ? 'nessun limite' : `fino a € ${maxPrice}`}
                </strong>
              </div>
              <div className="cellar-filterbar__price-row">
                {onMinStockChange && (
                  <button
                    type="button"
                    className={`cellar-filterbar__stock-btn ${minStock > 1 ? 'cellar-filterbar__stock-btn--active' : ''}`}
                    onClick={() => onMinStockChange(minStock >= 4 ? 1 : minStock + 1)}
                    title="Bottiglie disponibili: clicca per cambiare (1+, 2+, 3+, 4+)"
                    aria-label={`Disponibilità minima: ${minStock} o più bottiglie`}
                  >
                    {minStock}+ btg.
                  </button>
                )}
                <input
                  type="range"
                  className="cellar-filterbar__price-slider"
                  min="10"
                  max="500"
                  step="5"
                  value={maxPrice}
                  aria-label="Prezzo massimo bottiglia"
                  onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Tasto Reset se filtri attivi */}
          {activeFiltersCount > 0 && (
            <div className="cellar-filterbar__reset-wrap cellar-filterbar__reset-wrap--inline">
              <button
                type="button"
                className="cellar-filterbar__reset-btn"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} />
                <span>Azzera Filtri</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
