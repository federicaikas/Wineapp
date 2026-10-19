import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { WineBottle } from '../../types/wine';
import type { DrinkingStatus } from '../design-system/atoms/Badge';
import { Modal, Button, Divider, StockCounter, ContentBlock, Typography, Tag, MaturityTimeline } from '../design-system';
import { Heart, Edit3, Trash2, Utensils, Calendar, Sparkles, Globe, Calculator, Search, X } from 'lucide-react';
import { getCountryFlag } from '../../utils/countryFlags';
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

  React.useEffect(() => {
    if (wine) {
      setWebsiteAnalysisSuccess(null);
    }
  }, [wine?.id]);

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
      hideCloseButton
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
            <div className={`cellar-wine-card cellar-wine-card--cat-${wine.category}`} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
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
            style={{ textDecoration: 'none', flexShrink: 0, alignSelf: 'flex-start' }}
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

        {/* Tabella Minimal Specifiche (Stesso design delle card della home) */}
        <table className="cellar-wine-card__spec-table" style={{ fontSize: '0.875rem', margin: '8px 0' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ padding: '6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem' }}>{getCountryFlag(wine.country)}</span>
                  <span><strong style={{ color: '#706880', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Regione</strong>{' '}<strong>{wine.region}</strong></span>
                  <span style={{ color: 'rgba(45,35,74,0.2)' }}>•</span>
                  <span><strong style={{ color: '#706880', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona</strong>{' '}<strong>{wine.appellation}</strong></span>
                </div>
              </td>
            </tr>
            <tr>
              <th style={{ width: '30%', padding: '6px 8px 6px 0' }}>Annata</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{formatVintage(wine.vintage)}</td>
            </tr>
            {wine.subCategory && (
              <tr>
                <th style={{ padding: '6px 8px 6px 0' }}>Tipologia</th>
                <td style={{ padding: '6px 0 6px 8px', fontWeight: 600, color: '#3B1B54' }}>{wine.subCategory}</td>
              </tr>
            )}
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Vitigni</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.grapes?.join(', ') || 'Autoctono'}</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Gradazione / Formato</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.alcohol}% Vol  ·  {wine.bottleSize}</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Acquisto / Ubicazione</th>
              <td style={{ padding: '6px 0 6px 8px', textTransform: 'capitalize' }}>
                {wine.purchaseChannel === 'GDO' ? 'GDO' : (wine.purchaseChannel || 'Cantina')}  ·  {wine.location}
              </td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Valore stimato</th>
              <td style={{ padding: '6px 0 6px 8px', fontWeight: 700, color: '#2D234A' }}>{formattedPrice}</td>
            </tr>
          </tbody>
        </table>

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

          <div className="cellar-detail-content__progress-bar-wrap">
            <div className="cellar-detail-content__progress-years">
              <span>{windowStart} (Inizio Beva)</span>
              <span className="cellar-detail-content__current-year-tag">Momento TOP: {peakYear}</span>
              <span>{windowEnd} (Termine Ottimale)</span>
            </div>
          </div>
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Profilo Sensoriale & Degustazione */}
        <div className="cellar-detail-content__tasting-section">
          {/* Blocco Input Analisi Automatica con IA */}
          <div style={{
            background: '#FBF9F5',
            border: '1px solid rgba(45,35,74,0.12)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} style={{ color: '#722F37' }} />
                <strong style={{ fontSize: '0.875rem', color: '#2D234A', fontFamily: 'var(--font-sans)' }}>
                  Analisi vino con IA
                </strong>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#F5E1DA', color: '#722F37', fontWeight: 600 }}>
                ✨ Ricerca ed Estrazione con IA
              </span>
            </div>

            <p style={{ fontSize: '0.775rem', color: '#6E6259', margin: '0 0 10px 0' }}>
              Cliccando "Analizza", l'IA cercherà su Google, analizzerà i primi 5 siti web e confronterà i dati per restituire un'analisi con i profumi principali, le caratteristiche sensoriali e gli abbinamenti. <em>(Annata {formatVintage(wine.vintage)} e prezzo €{wine.price} rimarranno inalterati)</em>.
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={14} />}
                loading={isAnalyzingWebsite}
                onClick={handleAnalyzeAutomatic}
                style={{ flexShrink: 0 }}
              >
                {isAnalyzingWebsite ? 'Analisi IA...' : 'ANALIZZA'}
              </Button>
            </div>

            {websiteAnalysisSuccess && (
              <div style={{
                fontSize: '0.8rem',
                color: '#2D6A35',
                background: '#EDF7EE',
                border: '1px solid #C8E6CA',
                borderRadius: '6px',
                padding: '8px 10px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
              }}>
                <Sparkles size={14} style={{ flexShrink: 0 }} />
                <span>{websiteAnalysisSuccess}</span>
              </div>
            )}
          </div>

          {/* Aromi */}
          {wine.tastingNotes?.aroma?.length > 0 && (
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
          {wine.tastingNotes?.palate && (
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
          {wine.tastingNotes?.pairing && (
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

