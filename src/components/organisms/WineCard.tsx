import React, { useState, useEffect, useRef } from 'react';
import type { WineBottle } from '../../types/wine';
import { Typography, Divider, Button, StockCounter, MaturityTimeline } from '../design-system';
import { Heart, MapPin, Eye } from 'lucide-react';
import { getCountryFlag } from '../../utils/countryFlags';
import { formatVintage } from '../../utils/formatters';
import './WineCard.css';

export interface WineCardProps {
  wine: WineBottle;
  onSelect: (wine: WineBottle) => void;
  onEdit?: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
}

const getRackLocation = (loc: string): string => {
  if (loc === 'Rack 1' || loc === 'Rack 2' || loc === 'Rack 3') return loc;
  if (loc.includes('Rack B') || loc.includes('2')) return 'Rack 2';
  if (loc.includes('Rack C') || loc.includes('Rack D') || loc.includes('Rack E') || loc.includes('3')) return 'Rack 3';
  return 'Rack 1';
};

export const WineCard: React.FC<WineCardProps> = ({
  wine,
  onSelect,
  onStockChange,
  onToggleFavorite,
}) => {
  const isOutOfStock = wine.stock <= 0;
  const [isRevealed, setIsRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Formattazione prezzo
  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(wine.price);

  const rackLocation = getRackLocation(wine.location);

  return (
    <article
      ref={cardRef}
      className={`cellar-wine-card cellar-wine-card--cat-${wine.category} ${
        isRevealed ? 'cellar-wine-card--revealed' : ''
      } ${
        isOutOfStock ? 'cellar-wine-card--depleted' : ''
      }`}
      onClick={() => onSelect(wine)}
    >
      {/* Blocco Titolo Etichetta */}
      <div className="cellar-wine-card__body">
        <div className="cellar-wine-card__producer-row">
          <Typography variant="body-sm" color="secondary" className="cellar-wine-card__producer">
            {wine.producer}
          </Typography>
          {getCountryFlag(wine.country) ? (
            <span className="cellar-wine-card__flag-badge" title={wine.country || 'Paese'}>
              {getCountryFlag(wine.country)}
            </span>
          ) : null}
        </div>

        <Typography variant="serif-title" size="md" className="cellar-wine-card__name">
          {wine.name}
        </Typography>

        <Typography variant="body-sm" color="muted" className="cellar-wine-card__appellation">
          {wine.appellation}
        </Typography>
      </div>

      {/* Tabella Minimal Specifiche */}
      <table className="cellar-wine-card__spec-table">
        <tbody>
          <tr>
            <th>Annata</th>
            <td>{formatVintage(wine.vintage)}</td>
          </tr>
          <tr>
            <th>Vitigni</th>
            <td>{wine.grapes?.join(', ') || 'Autoctono'}</td>
          </tr>
        </tbody>
      </table>

      {/* Ubicazione Cantina & Prezzo */}
      <div className="cellar-wine-card__meta-row">
        <div className="cellar-wine-card__location">
          <MapPin size={12} className="cellar-wine-card__location-icon" />
          <Typography variant="body-sm" color="muted" className="cellar-wine-card__location-text">
            {rackLocation}
          </Typography>
        </div>

        <Typography variant="serif-title" size="sm" color="primary" className="cellar-wine-card__price">
          {formattedPrice}
        </Typography>
      </div>

      {/* Infografica Stadio di Maturazione (Sotto il Prezzo) */}
      <div className="cellar-wine-card__timeline-wrapper">
        <MaturityTimeline status={wine.drinkingStatus} category={wine.category} size="sm" />
      </div>

      <Divider variant="hairline" spacing="sm" />

      {/* Footer con Gestione Bottiglie & Azioni */}
      <div className="cellar-wine-card__footer" onClick={(e) => e.stopPropagation()}>
        <StockCounter
          count={wine.stock}
          size="sm"
          onIncrement={() => onStockChange(wine.id, 1)}
          onDecrement={() => onStockChange(wine.id, -1)}
        />

        <div className="cellar-wine-card__footer-actions">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye size={14} />}
            title="Scheda"
            aria-label="Scheda"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(wine);
            }}
          />

          <button
            type="button"
            className={`cellar-wine-card__fav-btn ${wine.favorite ? 'cellar-wine-card__fav-btn--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wine.id);
            }}
            aria-label={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            title={wine.favorite ? 'Incluso tra i preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={16} fill={wine.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>


      {/* Timbro di Esaurimento se le scorte sono a 0 */}
      {isOutOfStock && (
        <div className="cellar-wine-card__depleted-seal">
          <Typography variant="stamp-mono">
            ARCHIVIATA • SCORTE ESAURITE
          </Typography>
        </div>
      )}
    </article>
  );
};



