import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { WineBottle } from '../../types/wine';
import type { DrinkingStatus } from '../design-system/atoms/Badge';
import { Modal, Button, Divider, StockCounter, ContentBlock, Typography, Tag, MaturityTimeline } from '../design-system';
import { Heart, Edit3, Trash2, Utensils, Calendar, Sparkles, Calculator, Search, X } from 'lucide-react';
import { calculateWineOptimalDrinkingWindow, analyzeWineAutomatic } from '../../utils/onlineWineSearch';
import { formatVintage } from '../../utils/formatters';
import './WineDetailModal.css';

export interface WineDetailModalProps {
  wine: WineBottle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (wine: WineBottle) => void;
  onDelete: (id: string) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateWine?: (id: string, data: Partial<WineBottle>) => Promise<void>;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({
  wine,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStockChange,
  onToggleFavorite,
  onUpdateWine,
}) => {
  const [isCalculatingWindow, setIsCalculatingWindow] = useState(false);
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalysisSuccess, setWebsiteAnalysisSuccess] = useState<string | null>(null);
  const [showMomentoTop, setShowMomentoTop] = useState(false);
  const [showSensory, setShowSensory] = useState(false);
  const [currentYear] = useState(() => new Date().getFullYear());

  const [prevWineId, setPrevWineId] = useState(wine?.id);
  if (wine && wine.id !== prevWineId) {
    setPrevWineId(wine.id);
    setWebsiteAnalysisSuccess(null);
    setShowMomentoTop(false);
    setShowSensory(false);
  }

  if (!wine) return null;

  const handleAnalyzeAutomatic = async () => {
    if (!wine || !onUpdateWine) return;

    setIsAnalyzingWebsite(true);
    setWebsiteAnalysisSuccess(null);
    try {
      const result = await analyzeWineAutomatic(wine);
      // Vincolo tassativo: annata (vintage) e prezzo (price) NON cambiano mai
      await onUpdateWine(wine.id, {
        tastingNotes: result.tastingNotes,
        appellation: result.appellation || wine.appellation,
        subCategory: result.subCategory || wine.subCategory,
        grapes: result.grapes || wine.grapes,
        alcohol: result.alcohol || wine.alcohol,
        imageUrl: result.imageUrl || wine.imageUrl,
        notes: result.notes || wine.notes,
        aiCalculated: true,
        aiCalculatedDetails: result.aiCalculatedDetails,
      });
      setWebsiteAnalysisSuccess(`✨ Analisi completata con successo tramite ricerca online multipla.`);
    } catch (err) {
      console.error('Errore durante l’analisi automatica:', err);
    } finally {
      setIsAnalyzingWebsite(false);
    }
  };

  const handleCalculateOptimalDrinkingWindow = async () => {
    if (!wine || !onUpdateWine) return;
    setIsCalculatingWindow(true);
    try {
      const result = await calculateWineOptimalDrinkingWindow(wine);
      const mappedStatus = (result.drinkingStatus === 'declining' ? 'past' : result.drinkingStatus) as DrinkingStatus;
      await onUpdateWine(wine.id, {
        drinkingWindow: result.drinkingWindow,
        drinkingStatus: mappedStatus,
        aiCalculated: true,
        aiCalculatedDetails: result.rationale,
      });
    } catch (err) {
      console.error('Errore durante il calcolo dell’apice di beva:', err);
    } finally {
      setIsCalculatingWindow(false);
    }
  };



  const windowStart = wine.drinkingWindow?.start || wine.vintage;
  const windowEnd = wine.drinkingWindow?.end || wine.vintage + 10;
  const peakYear = wine.drinkingWindow?.peakYear || Math.round((windowStart + windowEnd) / 2);

  const hasSensoryData = Boolean(wine.tastingNotes?.palate || wine.tastingNotes?.pairing);

  const handleSensoryClick = async () => {
    if (showSensory && hasSensoryData) {
      setShowSensory(false);
      return;
    }
    setShowSensory(true);
    if (!hasSensoryData) {
      await handleAnalyzeAutomatic();
    }
  };

  // Testo del Momento TOP costruito in base alla finestra di beva e all'anno corrente
  const yearsToEnd = windowEnd - currentYear;
  let momentoTopText: string;
  if (currentYear < windowStart) {
    momentoTopText = `Il momento top è il ${peakYear}. Il vino è ancora giovane: la finestra di beva si apre nel ${windowStart} e termina nel ${windowEnd}. Conviene aspettare.`;
  } else if (currentYear < peakYear - 1) {
    momentoTopText = `Il momento top è il ${peakYear}. Il vino è già pronto da bere e continua a migliorare: la finestra va dal ${windowStart} al ${windowEnd}.`;
  } else if (currentYear <= peakYear + 1) {
    momentoTopText = `Il momento top è il ${peakYear}: il vino è al suo apice adesso. Finestra di beva dal ${windowStart} al ${windowEnd}.`;
  } else if (currentYear <= windowEnd) {
    momentoTopText = `Il momento top è stato il ${peakYear}. Il vino è ancora in ottima forma, ma da bere ${yearsToEnd > 0 ? `entro ${yearsToEnd} ${yearsToEnd === 1 ? 'anno' : 'anni'}` : 'quest\'anno'} (termine ottimale ${windowEnd}).`;
  } else {
    momentoTopText = `Il momento top era il ${peakYear} e la finestra si è chiusa nel ${windowEnd}: da bere al più presto.`;
  }

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
              variant="secondary"
              size="md"
              icon={<Trash2 size={15} />}
              onClick={() => {
                if (window.confirm(`Sei sicuro di voler eliminare definitivamente "${wine.name}" dal registro?`)) {
                  onDelete(wine.id);
                  onClose();
                }
              }}
              title="Elimina"
              aria-label="Elimina"
            />

            <Button
              variant="secondary"
              size="md"
              icon={<Edit3 size={15} />}
              onClick={() => {
                onEdit(wine);
                onClose();
              }}
              title="Modifica"
              aria-label="Modifica"
            />

            <button
              type="button"
              className={`cellar-wine-card__fav-btn ${wine.favorite ? 'cellar-wine-card__fav-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(wine.id);
              }}
              style={{ width: '40px', height: '40px' }}
              title={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              aria-label={wine.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              <Heart size={18} fill={wine.favorite ? 'currentColor' : 'none'} />
            </button>

            <Button
              variant="primary"
              size="md"
              disabled={wine.stock <= 0}
              onClick={() => {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#722F37', '#C5A059', '#EAE6E1', '#2D6A35'],
                });
                onStockChange(wine.id, -1);
                setTimeout(() => {
                  onClose();
                }, 300);
              }}
              className="cellar-detail-modal__stappa-btn"
            >
              Stappa
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={<X size={16} />}
              onClick={onClose}
              className="cellar-detail-modal__footer-close-btn"
              title="Chiudi scheda"
              aria-label="Chiudi scheda"
            />
          </div>
        </div>
      }
    >
      <div className="cellar-detail-content">
        {/* Intestazione Principale coordinata con le Card */}
        <div className="cellar-detail-content__header">
          <div className="cellar-detail-content__title-block" style={{ flex: 1 }}>
            {/* Titolo Etichetta: Produttore -> Titolo DIN Bold -> Denominazione in colore */}
            <div className={`cellar-wine-card cellar-wine-card--cat-${wine.category}`} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, opacity: 1, transform: 'none', animation: 'none' }}>
              <div className="cellar-wine-card__producer-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <Typography variant="body-sm" color="secondary" className="cellar-wine-card__producer">
                  {wine.producer}
                </Typography>
              </div>

              <Typography variant="serif-title" size="md" className="cellar-wine-card__name" style={{ fontSize: '1.85rem', margin: '4px 0 6px 0' }}>
                {wine.name}
              </Typography>

              <Typography variant="body-sm" className="cellar-wine-card__appellation" style={{ fontSize: '1.05rem' }}>
                {wine.appellation}
              </Typography>
            </div>
          </div>

          {/* Cerca Info in alto a destra */}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${wine.name} ${wine.producer}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', flexShrink: 0, alignSelf: 'flex-start', marginRight: '2.75rem' }}
          >
            <Button
              variant="outline"
              size="sm"
              icon={<Search size={14} />}
              style={{
                borderColor: '#722F37',
                color: '#722F37',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
              }}
            >
              Cerca info 🔍
            </Button>
          </a>
        </div>

        {/* Informazioni in tabella: 4 colonne allineate */}
        <div className="cellar-detail-specs" role="table" aria-label="Informazioni sul vino">
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Regione</span>
            <span className="cellar-detail-specs__value">{wine.region}</span>
          </div>
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Zona</span>
            <span className="cellar-detail-specs__value">{wine.appellation}</span>
          </div>
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Annata</span>
            <span className="cellar-detail-specs__value">{formatVintage(wine.vintage)}</span>
          </div>
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Valore stimato</span>
            <span className="cellar-detail-specs__value">{formattedPrice}</span>
          </div>
          {wine.subCategory && (
            <div className="cellar-detail-specs__cell" role="cell">
              <span className="cellar-detail-specs__label">Tipologia</span>
              <span className="cellar-detail-specs__value">{wine.subCategory}</span>
            </div>
          )}
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Vitigni</span>
            <span className="cellar-detail-specs__value">{wine.grapes?.join(', ') || 'Autoctono'}</span>
          </div>
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Gradazione / Formato</span>
            <span className="cellar-detail-specs__value">{wine.alcohol}% Vol · {wine.bottleSize}</span>
          </div>
          <div className="cellar-detail-specs__cell" role="cell">
            <span className="cellar-detail-specs__label">Acquisto / Ubicazione</span>
            <span className="cellar-detail-specs__value" style={{ textTransform: 'capitalize' }}>
              {wine.purchaseChannel === 'GDO' ? 'GDO' : (wine.purchaseChannel || 'Cantina')} · {wine.location}
            </span>
          </div>
        </div>

        {/* Timeline Unificata (Stato Evolutivo + Finestra di Beva) */}
        <div className="cellar-detail-content__timeline-card">
          <div className="cellar-detail-content__timeline-header">
            <div className="cellar-detail-content__timeline-title">
              <Calendar size={15} />
              <span>Finestra di Beva &amp; Stato Evolutivo</span>
              {wine.aiCalculated && (
                <span className="cellar-ai-verified-badge" title="Finestra di beva ed evoluzione verificate online con IA">
                  ✨ Calcolato con IA &amp; Fonti Online
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Calculator size={14} />}
                loading={isCalculatingWindow}
                onClick={handleCalculateOptimalDrinkingWindow}
                className="cellar-calc-btn"
              >
                {isCalculatingWindow ? 'Calcolo AI...' : 'Calcola con AI'}
              </Button>
            </div>
          </div>

          {/* Infografica 4 Stadi di Maturazione integrata */}
          <div style={{ margin: '12px 0 14px 0', padding: '12px 14px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(45,35,74,0.08)' }}>
            <MaturityTimeline status={wine.drinkingStatus} category={wine.category} size="md" showLabels={true} />
          </div>

          {wine.aiCalculatedDetails && (
            <div className="cellar-ai-rationale-box" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} className="cellar-ai-rationale-box__icon" />
              <span>{wine.aiCalculatedDetails}</span>
            </div>
          )}
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Profilo Sensoriale & Degustazione */}
        <div className="cellar-detail-content__tasting-section">
          {/* Due bottoni centrali: Momento TOP e Analisi sensoriale. Al clic compare il testo sotto */}
          <div className="cellar-detail-content__ai-cta">
            <Button
              variant="primary"
              size="lg"
              icon={<Calendar size={16} />}
              onClick={() => setShowMomentoTop((v) => !v)}
              aria-pressed={showMomentoTop}
            >
              MOMENTO TOP
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles size={16} />}
              loading={isAnalyzingWebsite}
              onClick={handleSensoryClick}
              aria-pressed={showSensory}
            >
              {isAnalyzingWebsite ? 'ANALISI IN CORSO...' : 'ANALISI SENSORIALE'}
            </Button>
          </div>

          {showMomentoTop && (
            <div className="cellar-detail-content__ai-text">
              <span className="cellar-detail-content__sublabel">Momento TOP:</span>
              <p>{momentoTopText}</p>
              {wine.aiCalculatedDetails && <p className="cellar-detail-content__ai-text-note">{wine.aiCalculatedDetails}</p>}
            </div>
          )}

          {showSensory && websiteAnalysisSuccess && (
            <p className="cellar-detail-content__ai-cta-note">{websiteAnalysisSuccess}</p>
          )}
          {showSensory && !isAnalyzingWebsite && !hasSensoryData && (
            <p className="cellar-detail-content__ai-cta-note cellar-detail-content__ai-cta-note--warn">
              Analisi non disponibile al momento. Riprova tra poco.
            </p>
          )}

          {/* Aromi */}
          {showSensory && wine.tastingNotes?.aroma?.length > 0 && (
            <div className="cellar-detail-content__aromas">
              <span className="cellar-detail-content__sublabel">
                Note Olfattive Principali:
              </span>
              <div className="cellar-detail-content__aroma-chips">
                {wine.tastingNotes.aroma.map((a, i) => (
                  <Tag key={i} variant="badge">
                    {a}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Esperienza al Palato */}
          {showSensory && wine.tastingNotes?.palate && (
            <div className="cellar-detail-content__palate">
              <span className="cellar-detail-content__sublabel">
                Esperienza al Palato:
              </span>
              <ContentBlock
                parts={[
                  { text: `“${wine.tastingNotes.palate}”`, isKeyPhrase: true }
                ]}
                size="md"
              />
            </div>
          )}

          {/* Abbinamenti Gastronomici (Box Bianco) */}
          {showSensory && wine.tastingNotes?.pairing && (
            <div className="cellar-detail-content__pairing">
              <div className="cellar-detail-content__pairing-header">
                <Utensils size={15} />
                <span className="cellar-detail-content__sublabel" style={{ marginBottom: 0 }}>
                  Abbinamenti Consigliati:
                </span>
              </div>
              <ContentBlock
                parts={[
                  { text: wine.tastingNotes.pairing, isKeyPhrase: false }
                ]}
                size="sm"
              />
            </div>
          )}

          {/* Note Personali di Cantina (Box Bianco) */}
          {wine.notes && (
            <div className="cellar-detail-content__private-notes">
              <span className="cellar-detail-content__sublabel">
                Note d’Archivio &amp; Provenienza:
              </span>
              <p className="cellar-detail-content__notes-text">
                {wine.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

