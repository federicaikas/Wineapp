import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { WineCategory } from '../atoms/Badge';
import './SearchFilterBar.css';

export type SortOption = 
  | 'date-desc' 
  | 'vintage-desc' 
  | 'vintage-asc' 
  | 'rating-desc' 
  | 'stock-desc' 
  | 'name-asc';

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: WineCategory | 'all';
  onCategoryChange: (category: WineCategory | 'all') => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts?: Record<string, number>;
  totalCount?: number;
}

const CATEGORIES: Array<{ key: WineCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Tutti' },
  { key: 'red', label: 'Rossi' },
  { key: 'white', label: 'Bianchi' },
  { key: 'sparkling', label: 'Bollicine' },
  { key: 'rose', label: 'Rosati' },
  { key: 'orange', label: 'Orange' },
  { key: 'dessert', label: 'Passiti' },
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  counts,
  totalCount,
}) => {
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

        {/* Ordinamento */}
        <div className="cellar-filterbar__sort-wrap">
          <ArrowUpDown size={15} className="cellar-filterbar__sort-icon" />
          <select
            className="cellar-filterbar__sort-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="date-desc">Recenti prima</option>
            <option value="vintage-desc">Annata: Più maturi</option>
            <option value="vintage-asc">Annata: Più giovani</option>
            <option value="rating-desc">Punteggio più alto</option>
            <option value="stock-desc">Quantità residua</option>
            <option value="name-asc">Nome alfabetico (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Chips di Filtro Categoria */}
      <div className="cellar-filterbar__categories">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = cat.key === 'all' ? totalCount : counts?.[cat.key];

          return (
            <button
              key={cat.key}
              type="button"
              className={`cellar-filterbar__chip ${isSelected ? 'cellar-filterbar__chip--active' : ''} ${cat.key !== 'all' ? `cellar-filterbar__chip--${cat.key}` : ''}`}
              onClick={() => onCategoryChange(cat.key)}
            >
              <span className="cellar-filterbar__chip-label">{cat.label}</span>
              {count !== undefined && (
                <span className="cellar-filterbar__chip-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
