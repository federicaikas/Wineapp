import React from 'react';
import type { WineBottle } from '../../types/wine';
import { Modal, Badge, Typography, Button, Divider, RatingStars, WineStatPill, StockCounter } from '../design-system';
import { Heart, MapPin, Edit3, Trash2, Wine, Utensils, Calendar } from 'lucide-react';
import './WineDetailModal.css';

export interface WineDetailModalProps {
  wine: WineBottle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (wine: WineBottle) => void;
  onDelete: (id: string) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({
  wine,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStockChange,
  onToggleFavorite,
}) => {
  if (!wine) return null;

  const currentYear = new Date().getFullYear();
  const windowStart = wine.drinkingWindow.start || wine.vintage;
  const windowEnd = wine.drinkingWindow.end || wine.vintage + 10;
  const peakYear = wine.drinkingWindow.peakYear || Math.round((windowStart + windowEnd) / 2);

  // Calcolo progresso temporale (0% to 100%)
  const totalSpan = Math.max(1, windowEnd - windowStart);
  const currentProgress = Math.min(100, Math.max(0, ((currentYear - windowStart) / totalSpan) * 100));
  const peakPosition = Math.min(100, Math.max(0, ((peakYear - windowStart) / totalSpan) * 100));

  const formattedPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(wine.price);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      lotStamp={`DOSSIER ENOLOGICO • ${wine.lotNumber}`}
      footer={
        <div className="cellar-detail-modal__footer-actions">
          <div className="cellar-detail-modal__footer-stock">
            <StockCounter
              count={wine.stock}
              size="md"
              onIncrement={() => onStockChange(wine.id, 1)}
              onDecrement={() => onStockChange(wine.id, -1)}
            />
          </div>

          <div className="cellar-detail-modal__footer-buttons">
            <Button
              variant="outline"
              size="md"
              icon={<Trash2 size={15} />}
              onClick={() => {
                if (window.confirm(`Sei sicuro di voler eliminare definitivamente "${wine.name}" dal registro?`)) {
                  onDelete(wine.id);
                  onClose();
                }
              }}
            >
              Elimina
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Edit3 size={15} />}
              onClick={() => {
                onEdit(wine);
                onClose();
              }}
            >
              Modifica
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<Wine size={16} />}
              disabled={wine.stock <= 0}
              onClick={() => onStockChange(wine.id, -1)}
            >
              Stappa Bottiglia
            </Button>
          </div>
        </div>
      }
    >
      <div className="cellar-detail-content">
        {/* Intestazione Principale */}
        <div className="cellar-detail-content__header">
          <div className="cellar-detail-content__title-block">
            <div className="cellar-detail-content__badges">
              <Badge variant="wine-type" category={wine.category}>
                {wine.category === 'red' && 'Vino Rosso'}
                {wine.category === 'white' && 'Vino Bianco'}
                {wine.category === 'sparkling' && 'Bollicine / Champagne'}
                {wine.category === 'rose' && 'Rosato'}
                {wine.category === 'orange' && 'Orange / Macerato'}
                {wine.category === 'dessert' && 'Passito / Dolce'}
              </Badge>

              <Badge variant="drinking-status" status={wine.drinkingStatus}>
                {wine.drinkingStatus === 'ready' && 'Pronto da bere'}
                {wine.drinkingStatus === 'aging' && 'In affinamento'}
                {wine.drinkingStatus === 'peak' && 'All’apice della maturità'}
                {wine.drinkingStatus === 'past' && 'Oltre il picco'}
              </Badge>

              <span className="cellar-detail-content__vintage">
                Millesimo {wine.vintage}
              </span>
            </div>

            <Typography variant="serif-italic" color="secondary" className="cellar-detail-content__producer">
              {wine.producer}
            </Typography>

            <h1 className="cellar-detail-content__name">
              {wine.name}
            </h1>

            <p className="cellar-detail-content__appellation">
              {wine.appellation} • {wine.region} ({wine.country})
            </p>
          </div>

          <button
            type="button"
            className={`cellar-detail-content__fav-btn ${wine.favorite ? 'cellar-detail-content__fav-btn--active' : ''}`}
            onClick={() => onToggleFavorite(wine.id)}
            aria-label={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={20} fill={wine.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Scheda Tecnica e Punteggi */}
        <div className="cellar-detail-content__tech-grid">
          <WineStatPill label="Vitigno / Uvaggio" value={wine.grapes.join(', ')} />
          <WineStatPill label="Gradazione Alcolica" value={`${wine.alcohol}% Vol`} variant="mono" />
          <WineStatPill label="Formato Bottiglia" value={wine.bottleSize} />
          <WineStatPill label="Valore Unitario" value={formattedPrice} variant="gold" />
          <WineStatPill label="Ubicazione Cantina" value={wine.location} icon={<MapPin size={13} />} />
          <WineStatPill label="Bottiglie Stappate" value={wine.uncorkedCount || 0} variant="wine" />
        </div>

        {/* Valutazione Critica & Rating */}
        <div className="cellar-detail-content__rating-box">
          <div className="cellar-detail-content__rating-left">
            <span className="cellar-detail-content__label">Valutazione Personale</span>
            <RatingStars value={wine.rating} size="lg" showScore />
          </div>
          {wine.criticScore && (
            <div className="cellar-detail-content__score-badge">
              <span className="cellar-detail-content__score-value">{wine.criticScore}</span>
              <span className="cellar-detail-content__score-max">/100 PUNTI CRITICA</span>
            </div>
          )}
        </div>

        <Divider variant="ornament" symbol="❦" spacing="md" />

        {/* Timeline Finestra di Beva */}
        <div className="cellar-detail-content__timeline-card">
          <div className="cellar-detail-content__timeline-header">
            <div className="cellar-detail-content__timeline-title">
              <Calendar size={16} />
              <span>Finestra di Beva &amp; Curva Evolutiva</span>
            </div>
            <span className="cellar-detail-content__timeline-peak-badge">
              Apice raccomandato: {peakYear}
            </span>
          </div>

          <div className="cellar-detail-content__progress-bar-wrap">
            <div className="cellar-detail-content__progress-bar">
              {/* Indicatore apice */}
              <div
                className="cellar-detail-content__peak-indicator"
                style={{ left: `${peakPosition}%` }}
                title={`Apice evolutivo previsto nel ${peakYear}`}
              >
                <div className="cellar-detail-content__peak-pin" />
                <span className="cellar-detail-content__peak-label">Apice ({peakYear})</span>
              </div>

              {/* Indicatore anno corrente */}
              <div
                className="cellar-detail-content__current-indicator"
                style={{ left: `${currentProgress}%` }}
                title={`Oggi (${currentYear})`}
              >
                <div className="cellar-detail-content__current-dot" />
              </div>
            </div>

            <div className="cellar-detail-content__progress-years">
              <span>{windowStart} (Inizio Beva)</span>
              <span className="cellar-detail-content__current-year-tag">Anno Corrente ({currentYear})</span>
              <span>{windowEnd} (Termine Ottimale)</span>
            </div>
          </div>
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Note di Degustazione Sommelier */}
        <div className="cellar-detail-content__tasting-section">
          <span className="cellar-detail-content__section-header">Profilo Sensoriale &amp; Degustazione</span>

          {/* Aromi */}
          <div className="cellar-detail-content__aromas">
            <span className="cellar-detail-content__sublabel">Note Olfattive Principali:</span>
            <div className="cellar-detail-content__aroma-chips">
              {wine.tastingNotes.aroma.map((a, i) => (
                <span key={i} className="cellar-detail-content__aroma-chip">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Palato */}
          <div className="cellar-detail-content__palate">
            <span className="cellar-detail-content__sublabel">Esperienza al Palato:</span>
            <p className="cellar-detail-content__palate-text">
              “{wine.tastingNotes.palate}”
            </p>
          </div>

          {/* Abbinamenti Gastronomici */}
          {wine.tastingNotes.pairing && (
            <div className="cellar-detail-content__pairing">
              <div className="cellar-detail-content__pairing-header">
                <Utensils size={15} />
                <span className="cellar-detail-content__sublabel">Abbinamenti Consigliati:</span>
              </div>
              <p className="cellar-detail-content__pairing-text">
                {wine.tastingNotes.pairing}
              </p>
            </div>
          )}

          {/* Note Personali di Cantina */}
          {wine.notes && (
            <div className="cellar-detail-content__private-notes">
              <span className="cellar-detail-content__sublabel">Note d’Archivio &amp; Provenienza:</span>
              <p className="cellar-detail-content__notes-text">{wine.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
