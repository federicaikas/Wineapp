import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { WineBottle } from '../../types/wine';
import type { DrinkingStatus } from '../design-system/atoms/Badge';
import { Modal, Button, Divider, StockCounter, ContentBlock, Typography, Tag, MaturityTimeline } from '../design-system';
import { Heart, Edit3, Trash2, Wine, Utensils, Calendar, Sparkles, Globe, Calculator, Camera, ImageOff, ExternalLink, Search } from 'lucide-react';
import { getCountryFlag } from '../../utils/countryFlags';
import { calculateWineOptimalDrinkingWindow, analyzeWineWebsiteUrl } from '../../utils/onlineWineSearch';
import { formatVintage } from '../../utils/formatters';
import { getWineryWebsiteUrl, getWineryDisplayDomain } from '../../utils/wineryUtils';
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
  const [imageSearchFeedback, setImageSearchFeedback] = useState<string | null>(null);

  const [websiteInput, setWebsiteInput] = useState(wine?.websiteUrl || '');
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalysisSuccess, setWebsiteAnalysisSuccess] = useState<string | null>(null);

  if (!wine) return null;

  const handleAnalyzeWebsite = async () => {
    if (!wine || !onUpdateWine) return;
    const defaultWineryUrl = getWineryWebsiteUrl(wine.producer, wine.websiteUrl);
    const urlToAnalyze = websiteInput.trim() || defaultWineryUrl;
    if (!urlToAnalyze) return;

    setIsAnalyzingWebsite(true);
    setWebsiteAnalysisSuccess(null);
    try {
      const result = await analyzeWineWebsiteUrl(urlToAnalyze, wine);
      // Vincolo tassativo: annata (vintage) e prezzo (price) NON cambiano mai
      await onUpdateWine(wine.id, {
        tastingNotes: result.tastingNotes,
        appellation: result.appellation || wine.appellation,
        subCategory: result.subCategory || wine.subCategory,
        grapes: result.grapes || wine.grapes,
        alcohol: result.alcohol || wine.alcohol,
        imageUrl: result.imageUrl || wine.imageUrl,
        notes: result.notes || wine.notes,
        websiteUrl: urlToAnalyze,
        aiCalculated: true,
        aiCalculatedDetails: result.aiCalculatedDetails,
      });
      setWebsiteAnalysisSuccess(`✨ Scheda analizzata con IA dal sito web: ${urlToAnalyze}. Annata (${formatVintage(wine.vintage)}) e prezzo (€${wine.price}) sono rimasti invariati.`);
    } catch (err) {
      console.error('Errore durante l’analisi del sito web:', err);
    } finally {
      setIsAnalyzingWebsite(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && wine && onUpdateWine) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        if (base64Image) {
          await onUpdateWine(wine.id, { imageUrl: base64Image });
          setImageSearchFeedback('✓ Foto scattata e salvata con successo!');
        }
      };
      reader.readAsDataURL(file);
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



  const currentYear = new Date().getFullYear();
  const windowStart = wine.drinkingWindow.start || wine.vintage;
  const windowEnd = wine.drinkingWindow.end || wine.vintage + 10;
  const peakYear = wine.drinkingWindow.peakYear || Math.round((windowStart + windowEnd) / 2);

  const wineryUrl = getWineryWebsiteUrl(wine.producer, wine.websiteUrl);
  const wineryDomain = getWineryDisplayDomain(wineryUrl);

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
              onClick={() => {
                // Sparo micro-animazione di coriandoli celebrativi per stappatura
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
            >
              Bottiglia Stappata
            </Button>
          </div>
        </div>
      }
    >
      <div className="cellar-detail-content">
        {/* Barra azione Scatta Foto sopra l'immagine del prodotto */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleCameraCapture}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Typography variant="body-sm" color="secondary" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            Immagine Prodotto
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            icon={<Camera size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Scatta foto
          </Button>
        </div>

        {imageSearchFeedback && (
          <div style={{ fontSize: '0.8rem', color: imageSearchFeedback.includes('✓') ? '#2D6A35' : '#6E6259', marginBottom: '8px', fontWeight: 500 }}>
            {imageSearchFeedback}
          </div>
        )}

        {/* Immagine o Box Neutro */}
        {wine.imageUrl && wine.imageUrl !== 'neutral' ? (
          <div className="cellar-detail-modal__photo-hero">
            <img
              src={wine.imageUrl}
              alt={wine.name}
              className="cellar-detail-modal__photo-hero-img"
            />
            <span className="cellar-detail-modal__photo-tag">
              ✓ Foto Prodotto
            </span>
          </div>
        ) : (
          <div
            className="cellar-detail-modal__neutral-box"
            style={{
              height: '150px',
              backgroundColor: '#EAE6E1',
              borderRadius: '12px',
              border: '1px dashed rgba(45,35,74,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#6E6259',
              padding: '16px',
              marginBottom: '8px',
            }}
          >
            <ImageOff size={26} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
              Box neutro - Nessuna foto impostata
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.75, textAlign: 'center' }}>
              Clicca "Scatta foto" in alto per fotografare la bottiglia dal vivo
            </span>
          </div>
        )}

        {/* Intestazione Principale coordinata con le Card */}
        <div className="cellar-detail-content__header">
          <div className="cellar-detail-content__title-block" style={{ flex: 1 }}>
            {/* Titolo Etichetta: Produttore -> Titolo DIN Bold -> Denominazione in colore */}
            <div className={`cellar-wine-card cellar-wine-card--cat-${wine.category}`} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
              <div className="cellar-wine-card__producer-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <Typography variant="body-sm" color="secondary" className="cellar-wine-card__producer">
                  {wine.producer}
                </Typography>
                <span className="cellar-wine-card__flag-badge" title={wine.country || 'Italia'}>
                  {getCountryFlag(wine.country)}
                </span>
                <a
                  href={wineryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: '#722F37',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    textDecoration: 'none',
                    marginLeft: '4px',
                    background: '#F9F6F0',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(114, 47, 55, 0.15)',
                  }}
                  title={`Visita il sito ufficiale di ${wine.producer}`}
                >
                  <Globe size={11} />
                  <span>Sito Cantina</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <Typography variant="serif-title" size="md" className="cellar-wine-card__name" style={{ fontSize: '1.85rem', margin: '4px 0 6px 0' }}>
                {wine.name}
              </Typography>

              {/* Tasto Cerca Info subito sotto il nome della bottiglia */}
              <div style={{ margin: '6px 0 10px 0' }}>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${wine.name} ${wine.producer}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
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

              <Typography variant="body-sm" className="cellar-wine-card__appellation" style={{ fontSize: '1.05rem' }}>
                {wine.appellation}
              </Typography>
            </div>
          </div>

          <button
            type="button"
            className={`cellar-wine-card__fav-btn ${wine.favorite ? 'cellar-wine-card__fav-btn--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(wine.id);
            }}
            style={{ width: '38px', height: '38px' }}
            title={wine.favorite ? 'Incluso tra i preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={20} fill={wine.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Tabella Minimal Specifiche (Stesso design delle card della home) */}
        <table className="cellar-wine-card__spec-table" style={{ fontSize: '0.875rem', margin: '8px 0' }}>
          <tbody>
            <tr>
              <th style={{ width: '30%', padding: '6px 8px 6px 0' }}>Annata</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{formatVintage(wine.vintage)}</td>
            </tr>
            {wine.subCategory && (
              <tr>
                <th style={{ padding: '6px 8px 6px 0' }}>Specificazione</th>
                <td style={{ padding: '6px 0 6px 8px', fontWeight: 600, color: '#3B1B54' }}>{wine.subCategory}</td>
              </tr>
            )}
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Vitigni</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.grapes.join(', ') || 'Autoctono'}</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Gradazione</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.alcohol}% Vol</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Acquisto</th>
              <td style={{ padding: '6px 0 6px 8px', textTransform: 'capitalize' }}>
                {wine.purchaseChannel === 'GDO' ? 'GDO' : (wine.purchaseChannel || 'Cantina')}
              </td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Formato</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.bottleSize}</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Ubicazione</th>
              <td style={{ padding: '6px 0 6px 8px' }}>{wine.location}</td>
            </tr>
            <tr>
              <th style={{ padding: '6px 8px 6px 0' }}>Sito Cantina</th>
              <td style={{ padding: '6px 0 6px 8px' }}>
                <a
                  href={wineryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#722F37',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                  title={`Visita il sito ufficiale di ${wine.producer}`}
                >
                  <Globe size={13} />
                  <span>{wineryDomain}</span>
                  <ExternalLink size={12} style={{ opacity: 0.7 }} />
                </a>
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
              <span className="cellar-detail-content__peak-sans">
                Momento TOP: <strong>{peakYear}</strong>
              </span>

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
              <span className="cellar-detail-content__current-year-tag">Anno Corrente ({currentYear})</span>
              <span>{windowEnd} (Termine Ottimale)</span>
            </div>
          </div>
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Profilo Sensoriale & Degustazione */}
        <div className="cellar-detail-content__tasting-section">
          {/* Blocco Input Analisi Sito Cantina con IA */}
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
                  Analisi Scheda dal Sito Web Cantina
                </strong>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#F5E1DA', color: '#722F37', fontWeight: 600 }}>
                ✨ Ricerca ed Estrazione con IA
              </span>
            </div>

            <p style={{ fontSize: '0.775rem', color: '#6E6259', margin: '0 0 10px 0' }}>
              Inserisci l'URL del sito web per estrarre con l'IA note olfattive, abbinamenti, vitigni e foto. <em>(Annata {formatVintage(wine.vintage)} e prezzo €{wine.price} rimarranno inalterati)</em>.
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="https://www.cantina-esempio.it/scheda-vino"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(45,35,74,0.18)',
                  fontSize: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={14} />}
                loading={isAnalyzingWebsite}
                onClick={handleAnalyzeWebsite}
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
          {wine.tastingNotes.aroma.length > 0 && (
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
          {wine.tastingNotes.palate && (
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
          {wine.tastingNotes.pairing && (
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

