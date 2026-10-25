import React, { useState, useEffect, useRef } from 'react';
import type { WineBottle } from '../../types/wine';
import { Typography, Button } from '../design-system';
import { Heart, MapPin, Eye } from 'lucide-react';
import { getFlagKey } from '../../utils/countryFlags';
import { FlagCircle } from '../design-system/atoms/FlagCircle';
import { formatVintage } from '../../utils/formatters';
import './WineCard.css';

export interface WineCardProps {
  wine: WineBottle;
  onSelect: (wine: WineBottle) => void;
  onEdit?: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
}

// Stato di maturazione mostrato come voce dell'elenco (Apice rientra in "Pronto")
const STATUS_LABEL: Record<WineBottle['drinkingStatus'], string> = {
  aging: 'Giovane',
  ready: 'Pronto',
  peak: 'Pronto',
  past: 'Vecchio',
};

const getRackLocation = (loc: string): string => {
  if (loc === 'Rack 1' || loc === 'Rack 2' || loc === 'Rack 3') return loc;
  if (loc.includes('Rack B') || loc.includes('2')) return 'Rack 2';
  if (loc.includes('Rack C') || loc.includes('Rack D') || loc.includes('Rack E') || loc.includes('3')) return 'Rack 3';
  return 'Rack 1';
};

export const WineCard: React.FC<WineCardProps> = ({
  wine,
  onSelect,
  onToggleFavorite,
}) => {
  const isOutOfStock = wine.stock <= 0;
  const [isRevealed, setIsRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  const cardRef = useRef<HTMLElement | null>(null);
  const [heartPop, setHeartPop] = useState(false);

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
  const flagKey = getFlagKey(wine.country, wine.region, wine.appellation);
  // Titoli lunghi: riduce leggermente il corpo per evitare righe spezzate e spaziature sproporzionate
  const nameLength = wine.name.trim().length;
  const nameSizeClass =
    nameLength > 44 ? 'cellar-wine-card__name--xs' : nameLength > 32 ? 'cellar-wine-card__name--sm' : nameLength > 22 ? 'cellar-wine-card__name--md' : '';

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
        </div>

        <Typography variant="serif-title" size="md" className={`cellar-wine-card__name ${nameSizeClass}`}>
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
            <th>Stato</th>
            <td>
              <span className="cellar-wine-card__status">{STATUS_LABEL[wine.drinkingStatus] ?? 'Pronto'}</span>
            </td>
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

      {/* Footer: paese, scheda, preferiti, numero bottiglie */}
      <div className="cellar-wine-card__footer" onClick={(e) => e.stopPropagation()}>
        <div className="cellar-wine-card__footer-actions">
          <span
            className="cellar-wine-card__round cellar-wine-card__flag-btn"
            title={wine.country || 'Paese'}
            role="img"
            aria-label={wine.country || 'Paese'}
          >
            <FlagCircle flag={flagKey} size={18} />
          </span>

          <Button
            variant="outline"
            size="sm"
            icon={<Eye size={15} />}
            title="Scheda"
            aria-label="Scheda"
            className="cellar-wine-card__round"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(wine);
            }}
          />

          <button
            type="button"
            className={`cellar-wine-card__round cellar-wine-card__fav-btn ${wine.favorite ? 'cellar-wine-card__fav-btn--active' : ''} ${heartPop ? 'cellar-wine-card__fav-btn--pop' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!wine.favorite) {
                setHeartPop(true);
                window.setTimeout(() => setHeartPop(false), 750);
              }
              onToggleFavorite(wine.id);
            }}
            aria-label={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            title={wine.favorite ? 'Incluso tra i preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={15} fill={wine.favorite ? 'currentColor' : 'none'} />
          </button>

          <span
            className="cellar-wine-card__round cellar-wine-card__qty"
            title={`${wine.stock} ${wine.stock === 1 ? 'bottiglia' : 'bottiglie'}`}
            aria-label={`${wine.stock} ${wine.stock === 1 ? 'bottiglia' : 'bottiglie'}`}
          >
            <span className="cellar-wine-card__qty-num">X{wine.stock}</span>
          </span>
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



