import React from 'react';
import type { WineBottle } from '../../types/wine';
import { Typography, Badge, RatingStars, Divider, Button, StockCounter, WineStatPill } from '../design-system';
import { Heart, MapPin, Eye } from 'lucide-react';
import './WineCard.css';

export interface WineCardProps {
  wine: WineBottle;
  onSelect: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
}

export const WineCard: React.FC<WineCardProps> = ({
  wine,
  onSelect,
  onStockChange,
  onToggleFavorite,
}) => {
  const isOutOfStock = wine.stock <= 0;

  // Formattazione prezzo
  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(wine.price);

  return (
    <article
      className={`cellar-wine-card ${isOutOfStock ? 'cellar-wine-card--depleted' : ''}`}
      onClick={() => onSelect(wine)}
    >
      {/* Testata dell'etichetta */}
      <div className="cellar-wine-card__header">
        <div className="cellar-wine-card__badges">
          <Badge variant="wine-type" category={wine.category} size="sm">
            {wine.category === 'red' && 'Rosso'}
            {wine.category === 'white' && 'Bianco'}
            {wine.category === 'sparkling' && 'Bollicine'}
            {wine.category === 'rose' && 'Rosato'}
            {wine.category === 'orange' && 'Orange'}
            {wine.category === 'dessert' && 'Passito'}
          </Badge>

          <Badge variant="drinking-status" status={wine.drinkingStatus} size="sm">
            {wine.drinkingStatus === 'ready' && 'Pronto'}
            {wine.drinkingStatus === 'aging' && 'Affinamento'}
            {wine.drinkingStatus === 'peak' && 'All’apice'}
            {wine.drinkingStatus === 'past' && 'Oltre il picco'}
          </Badge>
        </div>

        <div className="cellar-wine-card__top-actions">
          <button
            type="button"
            className={`cellar-wine-card__fav-btn ${wine.favorite ? 'cellar-wine-card__fav-btn--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wine.id);
            }}
            aria-label={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={16} fill={wine.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Timbro di Lotto & Annata */}
      <div className="cellar-wine-card__stamp-row">
        <Typography variant="stamp-mono" color="muted">
          {wine.lotNumber}
        </Typography>
        <span className="cellar-wine-card__vintage-pill">
          {wine.vintage}
        </span>
      </div>

      {/* Titoli e Produttore */}
      <div className="cellar-wine-card__body">
        <Typography variant="serif-italic" color="secondary" className="cellar-wine-card__producer">
          {wine.producer}
        </Typography>

        <h3 className="cellar-wine-card__name">
          {wine.name}
        </h3>

        <p className="cellar-wine-card__appellation">
          {wine.appellation} • <span className="cellar-wine-card__region">{wine.region}</span>
        </p>
      </div>

      {/* Scheda Tecnica Sintetica */}
      <div className="cellar-wine-card__stats">
        <div className="cellar-wine-card__pills">
          <WineStatPill
            label="Vitigno"
            value={wine.grapes[0] || 'Autoctono'}
            variant="default"
          />
          <WineStatPill
            label="Gradazione"
            value={`${wine.alcohol}%`}
            variant="mono"
          />
        </div>

        {/* Rating Stars & Critic Score */}
        <div className="cellar-wine-card__rating-row">
          <RatingStars
            value={wine.rating}
            size="sm"
            score100={wine.criticScore}
          />
          <span className="cellar-wine-card__price">{formattedPrice}</span>
        </div>
      </div>

      {/* Finestra di Beva & Posizione Cantina */}
      <div className="cellar-wine-card__location">
        <MapPin size={12} className="cellar-wine-card__location-icon" />
        <span className="cellar-wine-card__location-text">{wine.location}</span>
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

        <Button
          variant="outline"
          size="sm"
          icon={<Eye size={14} />}
          onClick={() => onSelect(wine)}
        >
          Scheda
        </Button>
      </div>

      {/* Timbro di Esaurimento se le scorte sono a 0 */}
      {isOutOfStock && (
        <div className="cellar-wine-card__depleted-seal">
          <span>ARCHIVIATA • SCORTE ESAURITE</span>
        </div>
      )}
    </article>
  );
};
