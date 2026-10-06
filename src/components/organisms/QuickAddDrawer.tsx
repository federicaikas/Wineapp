import React, { useState, useEffect } from 'react';
import type { WineBottle, WineFormData } from '../../types/wine';
import type { WineCategory, DrinkingStatus } from '../design-system/atoms/Badge';
import { Drawer, Input, Select, TextArea, Button, Divider, RatingStars } from '../design-system';
import { Save, Download, Upload, Sparkles, Camera } from 'lucide-react';
import { downloadSampleCSV, downloadSampleJSON, parseBatchFile } from '../../utils/batchImport';
import { scanWineLabelImage } from '../../utils/labelScanner';
import { calculateWineLocation } from '../../utils/locationUtils';
import './QuickAddDrawer.css';

export interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WineFormData) => Promise<WineBottle | void>;
  onSaveBatch?: (dataArray: WineFormData[]) => Promise<number | void>;
  editingWine?: WineBottle | null;
}

const DEFAULT_FORM: WineFormData = {
  name: '',
  producer: '',
  vintage: new Date().getFullYear() - 3,
  category: 'red',
  appellation: '',
  country: 'Italia',
  region: '',
  grapes: [''],
  alcohol: 13.5,
  bottleSize: '750 ml',
  stock: 1,
  price: 35,
  location: 'Rack 1 (sx)',
  drinkingStatus: 'aging',
  drinkingWindow: {
    start: new Date().getFullYear(),
    end: new Date().getFullYear() + 8,
    peakYear: new Date().getFullYear() + 4,
  },
  rating: 4,
  criticScore: 92,
  tastingNotes: {
    aroma: ['Frutti rossi', 'Spezie fini'],
    palate: 'Struttura equilibrata e finale persistente.',
    pairing: 'Primi piatti al ragù, carni arrosto.',
  },
  lotNumber: `LOT ${Math.floor(Math.random() * 900 + 100)}/${new Date().getFullYear().toString().slice(2)}`,
  favorite: false,
  purchaseChannel: 'cantina',
  notes: '',
};


interface AromaFamily {
  family: string;
  items: string[];
}

const AROMA_FAMILIES: AromaFamily[] = [
  {
    family: 'Fruttato',
    items: ['Frutti rossi', 'Frutti neri', 'Agrumi', 'Frutta esotica', 'Frutta secca'],
  },
  {
    family: 'Floreale',
    items: ['Fiori bianchi', 'Rosa & Viola', 'Fiori secchi', 'Camomilla', 'Zagara'],
  },
  {
    family: 'Speziato & Tostato',
    items: ['Pepe nero', 'Vaniglia & Cacao', 'Tabacco & Cuoio', 'Caffè tostato', 'Cannella'],
  },
  {
    family: 'Erbaceo & Vegetale',
    items: ['Erbe aromatiche', 'Peperone verde', 'Sottobosco', 'Fungo & Tartufo', 'Felce & Muschio'],
  },
  {
    family: 'Balsamico & Minerale',
    items: ['Mentolo & Eucalipto', 'Resina di pino', 'Pietra focaia', 'Grafite', 'Note salmastre'],
  },
];

const SUBCATEGORIES_MAP: Record<WineCategory, { label: string; value: string }[]> = {
  red: [
    { label: 'Rosso giovane', value: 'Rosso giovane' },
    { label: 'Rosso evoluto', value: 'Rosso evoluto' },
  ],
  white: [
    { label: 'Bianco giovane', value: 'Bianco giovane' },
    { label: 'Bianco evoluto', value: 'Bianco evoluto' },
  ],
  rose: [
    { label: 'Rosato giovane', value: 'Rosato giovane' },
    { label: 'Rosato evoluto', value: 'Rosato evoluto' },
  ],
  orange: [
    { label: 'Orange macerazione breve', value: 'Orange macerazione breve' },
    { label: 'Orange macerazione lunga', value: 'Orange macerazione lunga' },
  ],
  sparkling: [
    { label: 'Bollicine Metodo Classico', value: 'Bollicine Metodo Classico' },
    { label: 'Bollicine Charmat', value: 'Bollicine Charmat' },
    { label: 'Bollicine Ancestrale', value: 'Bollicine Ancestrale' },
    { label: 'Bollicine Frizzante', value: 'Bollicine Frizzante' },
  ],
  dessert: [
    { label: 'Dolce Passito', value: 'Dolce Passito' },
    { label: 'Dolce Muffato', value: 'Dolce Muffato' },
    { label: 'Dolce Vendemmia Tardiva', value: 'Dolce Vendemmia Tardiva' },
    { label: 'Dolce Icewine', value: 'Dolce Icewine' },
  ],
};

export const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveBatch,
  editingWine,
}) => {
  const [formData, setFormData] = useState<WineFormData>(DEFAULT_FORM);
  const [grapesInput, setGrapesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch import state
  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');
  const [batchPreview, setBatchPreview] = useState<WineFormData[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Label photo AI scan state
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDetectedFields, setScanDetectedFields] = useState<string[]>([]);

  useEffect(() => {
    if (editingWine) {
      setFormData({
        name: editingWine.name,
        producer: editingWine.producer,
        vintage: editingWine.vintage,
        category: editingWine.category,
        subCategory: editingWine.subCategory || SUBCATEGORIES_MAP[editingWine.category]?.[0]?.value,
        appellation: editingWine.appellation,
        country: editingWine.country,
        region: editingWine.region,
        grapes: editingWine.grapes,
        alcohol: editingWine.alcohol,
        bottleSize: editingWine.bottleSize,
        stock: editingWine.stock,
        price: editingWine.price,
        location: editingWine.location,
        drinkingStatus: editingWine.drinkingStatus,
        drinkingWindow: editingWine.drinkingWindow,
        rating: editingWine.rating,
        criticScore: editingWine.criticScore,
        tastingNotes: editingWine.tastingNotes,
        lotNumber: editingWine.lotNumber,
        favorite: editingWine.favorite,
        notes: editingWine.notes,
        websiteUrl: editingWine.websiteUrl || '',
        imageUrl: editingWine.imageUrl,
      });
      setGrapesInput(editingWine.grapes.join(', '));
      setAddMode('single');
    } else {
      setFormData(DEFAULT_FORM);
      setGrapesInput('Nebbiolo 100%');
    }
    setErrors({});
    setScanDetectedFields([]);
    if (!isOpen) {
      setAddMode('single');
      setBatchPreview([]);
      setBatchError(null);
      setBatchFileName(null);
    }
  }, [editingWine, isOpen]);

  const handleLabelImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await scanWineLabelImage(file);
      setFormData((prev) => ({
        ...prev,
        name: result.formData.name || prev.name,
        producer: result.formData.producer || prev.producer,
        vintage: result.formData.vintage || prev.vintage,
        category: result.formData.category || prev.category,
        subCategory: result.formData.subCategory || prev.subCategory,
        appellation: result.formData.appellation || prev.appellation,
        country: result.formData.country || prev.country,
        region: result.formData.region || prev.region,
        grapes: result.formData.grapes || prev.grapes,
        alcohol: result.formData.alcohol || prev.alcohol,
        tastingNotes: result.formData.tastingNotes || prev.tastingNotes,
        imageUrl: result.imageUrl,
      }));

      if (result.formData.grapes && result.formData.grapes.length > 0) {
        setGrapesInput(result.formData.grapes.join(', '));
      }

      setScanDetectedFields(result.detectedFields);
    } catch (err) {
      console.error("Errore durante l'analisi dell'etichetta:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchError(null);
    setBatchFileName(file.name);
    setIsBatchLoading(true);

    try {
      const text = await file.text();
      const parsed = await parseBatchFile(text, file.name);
      setBatchPreview(parsed);
    } catch (err: any) {
      setBatchError(err.message || 'Errore durante l’analisi del file.');
      setBatchPreview([]);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleConfirmBatch = async () => {
    if (batchPreview.length === 0 || !onSaveBatch) return;
    setIsBatchLoading(true);
    try {
      await onSaveBatch(batchPreview);
      onClose();
    } catch (err: any) {
      setBatchError(err.message || 'Errore durante il salvataggio in batch.');
    } finally {
      setIsBatchLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Il nome del vino o cru è obbligatorio';
    if (!formData.producer.trim()) newErrors.producer = 'Il produttore o tenuta è obbligatorio';
    if (!formData.vintage || formData.vintage < 1900 || formData.vintage > 2035) {
      newErrors.vintage = 'Inserisci un’annata valida';
    }
    if (formData.stock < 0) newErrors.stock = 'La quantità non può essere negativa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedGrapes = grapesInput
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        grapes: parsedGrapes.length > 0 ? parsedGrapes : ['Non specificato'],
      });
      onClose();
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const VINTAGE_OPTIONS = [
    { value: '0', label: 'Annata Sconosciuta (S.A. / N.V.)' },
    ...Array.from({ length: 77 }, (_, i) => {
      const y = currentYear - i;
      return { value: y.toString(), label: y.toString() };
    }),
  ];

  const toggleAroma = (aroma: string) => {
    const currentAromas = formData.tastingNotes.aroma || [];
    const isSelected = currentAromas.includes(aroma);
    const updated = isSelected
      ? currentAromas.filter((a) => a !== aroma)
      : [...currentAromas, aroma];

    setFormData({
      ...formData,
      tastingNotes: {
        ...formData.tastingNotes,
        aroma: updated,
      },
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={editingWine ? 'Modifica Scheda Vino' : 'Nuova Acquisizione'}
      subtitle={editingWine ? 'Aggiorna i parametri nel registro cantina' : 'Registra un nuovo lotto nella tua collezione enologica'}
      width="md"
      footer={
        addMode === 'batch' && !editingWine ? null : (
          <div className="cellar-add-drawer__footer-actions">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Annulla
            </Button>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              {editingWine ? 'Salva Modifiche' : 'Archivia Bottiglia'}
            </Button>
          </div>
        )
      }
    >
      {!editingWine && (
        <div className="cellar-add-mode-toggle">
          <button
            type="button"
            className={`cellar-add-mode-btn ${addMode === 'single' ? 'cellar-add-mode-btn--active' : ''}`}
            onClick={() => setAddMode('single')}
          >
            Inserimento Singolo
          </button>
          <button
            type="button"
            className={`cellar-add-mode-btn ${addMode === 'batch' ? 'cellar-add-mode-btn--active' : ''}`}
            onClick={() => setAddMode('batch')}
          >
            Caricamento Batch (CSV / JSON)
          </button>
        </div>
      )}

      {addMode === 'batch' && !editingWine ? (
        <div className="cellar-batch-container">
          <div className="cellar-batch-card">
            <div className="cellar-batch-card__title">1. Scarica il Modello d'Esempio</div>
            <p className="cellar-batch-card__desc">
              Scarica il file di esempio già formattato. Puoi aprirlo e compilarlo con Excel, Numbers o Google Sheets prima di caricarlo.
            </p>
            <div className="cellar-batch-card__buttons">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={downloadSampleCSV}>
                Scarica Modello CSV (Excel)
              </Button>
              <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={downloadSampleJSON}>
                Scarica Modello JSON
              </Button>
            </div>
          </div>

          <div className="cellar-batch-card">
            <div className="cellar-batch-card__title">2. Carica il File Compilato</div>
            <p className="cellar-batch-card__desc">
              Seleziona il tuo file <strong>.csv</strong> o <strong>.json</strong> per importare tutte le bottiglie in un solo click.
            </p>

            <label className="cellar-batch-upload-dropzone">
              <Upload size={24} className="cellar-batch-upload-icon" />
              <span className="cellar-batch-upload-text">
                {batchFileName ? `File pronto: ${batchFileName}` : 'Clicca qui o trascina il tuo file CSV/JSON'}
              </span>
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                onChange={handleFileUpload}
                className="cellar-batch-file-input"
              />
            </label>

            {batchError && <div className="cellar-batch-error">{batchError}</div>}
          </div>

          {batchPreview.length > 0 && (
            <div className="cellar-batch-preview">
              <div className="cellar-batch-preview__header">
                <span>Anteprima Bottiglie Rilevate</span>
                <span className="cellar-batch-preview__count">{batchPreview.length} vini pronti</span>
              </div>

              <div className="cellar-batch-preview__table-wrap">
                <table className="cellar-batch-preview__table">
                  <thead>
                    <tr>
                      <th>Vino</th>
                      <th>Produttore</th>
                      <th>Annata</th>
                      <th>Tipologia</th>
                      <th>Quantità</th>
                      <th>Prezzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchPreview.slice(0, 10).map((wine, i) => (
                      <tr key={i}>
                        <td><strong>{wine.name}</strong></td>
                        <td>{wine.producer}</td>
                        <td>{wine.vintage}</td>
                        <td><span className={`cellar-badge cellar-badge--sm cellar-badge--type-${wine.category}`}>{wine.category}</span></td>
                        <td>{wine.stock} btg</td>
                        <td>€ {wine.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchPreview.length > 10 && (
                  <div className="cellar-batch-preview__more">
                    + altri {batchPreview.length - 10} vini rilevati nel file...
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<Save size={16} />}
                disabled={isBatchLoading}
                onClick={handleConfirmBatch}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {isBatchLoading ? 'Importazione in corso...' : `Importa ${batchPreview.length} Bottiglie in Cantina`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <form className="cellar-add-form" onSubmit={handleSubmit}>
          {/* AI Label Scanner Box */}
          <div className="cellar-scan-box">
            <div className="cellar-scan-box__header">
              <Sparkles size={18} className="cellar-scan-box__icon" />
              <div>
                <h4 className="cellar-scan-box__title">Riconoscimento Automatico Etichetta (IA)</h4>
                <p className="cellar-scan-box__subtitle">Scatta o carica una foto dell'etichetta: l'app identificherà automaticamente vino, produttore, annata e parametri.</p>
              </div>
            </div>

            <button
              type="button"
              className="cellar-scan-upload-btn"
              onClick={() => photoInputRef.current?.click()}
              disabled={isScanning}
            >
              <Camera size={16} />
              <span>{isScanning ? 'Analisi etichetta in corso...' : formData.imageUrl ? 'Cambia Foto Etichetta' : 'Carica Foto Etichetta'}</span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLabelImageScan}
              onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
              disabled={isScanning}
              style={{ display: 'none' }}
            />

            {formData.imageUrl && (
              <div className="cellar-scan-preview">
                <img src={formData.imageUrl} alt="Etichetta caricata" className="cellar-scan-preview__img" />
                <div className="cellar-scan-preview__info">
                  <span className="cellar-scan-preview__badge">✓ Etichetta acquisita</span>
                  {scanDetectedFields.length > 0 && (
                    <p className="cellar-scan-preview__detected">
                      Campi riconosciuti: {scanDetectedFields.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Divider variant="hairline" spacing="sm" />

          {/* Blocco 1: Nome, Produttore, Annata, Tipologia, Denominazione, Paese */}
        <div className="cellar-add-form__row">
          <Input
            label="Nome del vino"
            placeholder="es. Barolo Bussia, Cervaro della Sala..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
        </div>

        <div className="cellar-add-form__grid-2">
          <Input
            label="Produttore"
            placeholder="es. Giacomo Conterno"
            value={formData.producer}
            onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
            error={errors.producer}
            required
          />

          <Select
            label="Annata"
            value={formData.vintage.toString()}
            onChange={(e) => setFormData({ ...formData, vintage: parseInt(e.target.value) || currentYear })}
            options={VINTAGE_OPTIONS}
          />
        </div>

        <div className="cellar-add-form__grid-2">
          <Select
            label="Tipologia (Famiglia)"
            value={formData.category}
            onChange={(e) => {
              const newCat = e.target.value as WineCategory;
              const validSubs = SUBCATEGORIES_MAP[newCat] || [];
              const defaultSub = validSubs[0]?.value || '';
              const calculatedLoc = calculateWineLocation({
                category: newCat,
                bottleSize: formData.bottleSize,
                notes: formData.notes,
              });
              setFormData({
                ...formData,
                category: newCat,
                subCategory: defaultSub,
                location: calculatedLoc,
              });
            }}
            options={[
              { value: 'red', label: 'Rosso' },
              { value: 'white', label: 'Bianco' },
              { value: 'sparkling', label: 'Bollicine' },
              { value: 'orange', label: 'Orange' },
              { value: 'rose', label: 'Rosato' },
              { value: 'dessert', label: 'Dolce' },
            ]}
          />

          <Select
            label="Specificazione / Stile"
            value={formData.subCategory || (SUBCATEGORIES_MAP[formData.category]?.[0]?.value || '')}
            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            options={SUBCATEGORIES_MAP[formData.category] || []}
          />
        </div>

        <div className="cellar-add-form__grid-2">
          <Input
            label="Denominazione"
            placeholder="es. Barolo DOCG, Brunello di Montalcino DOCG, Chianti Classico"
            value={formData.appellation}
            onChange={(e) => setFormData({ ...formData, appellation: e.target.value })}
          />

          <Input
            label="Paese"
            placeholder="es. Italia"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>

        <div className="cellar-add-form__grid-2">
          <Input
            label="Vitigni"
            placeholder="es. Nebbiolo 100%"
            value={grapesInput}
            onChange={(e) => setGrapesInput(e.target.value)}
          />

          <Input
            label="Sito Web Cantina (opzionale)"
            placeholder="es. https://conterno.it"
            value={formData.websiteUrl || ''}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          />
        </div>

        <Divider variant="hairline" spacing="sm" />

        {/* Blocco 2: Bottiglie, Prezzo, Gradazione */}
        <div className="cellar-add-form__grid-3">
          <Input
            label="Bottiglie"
            type="number"
            min={0}
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            error={errors.stock}
          />

          <Input
            label="Prezzo (€)"
            type="number"
            min={0}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Gradazione (% Vol)"
            type="number"
            step="0.5"
            value={formData.alcohol}
            onChange={(e) => setFormData({ ...formData, alcohol: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="cellar-add-form__grid-2">
          <Select
            label="Ubicazione"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            options={[
              { value: 'Rack 1 (sx)', label: 'Rack 1 (sx) - Rossi' },
              { value: 'Rack 2 (centro)', label: 'Rack 2 (centro) - Bianchi' },
              { value: 'Rack 3 (dx)', label: 'Rack 3 (dx) - Bolle, Rosati, Dolci & Macerati' },
              { value: 'Rack 4 (mobile)', label: 'Rack 4 (mobile) - Grande Formato' },
            ]}
          />

          <Select
            label="Acquisto"
            value={formData.purchaseChannel || 'cantina'}
            onChange={(e) => setFormData({ ...formData, purchaseChannel: e.target.value })}
            options={[
              { value: 'cantina', label: 'Cantina' },
              { value: 'GDO', label: 'GDO' },
              { value: 'fiera', label: 'Fiera' },
              { value: 'altro', label: 'Altro' },
            ]}
          />
        </div>

        <Divider variant="hairline" spacing="sm" />

        {/* Blocco 3: Stato evolutivo, Anno di apice previsto */}
        <div className="cellar-add-form__grid-2">
          <Select
            label="Stato evolutivo"
            value={formData.drinkingStatus}
            onChange={(e) => setFormData({ ...formData, drinkingStatus: e.target.value as DrinkingStatus })}
            options={[
              { value: 'aging', label: 'Giovane' },
              { value: 'ready', label: 'Pronto' },
              { value: 'peak', label: 'Apice' },
              { value: 'past', label: 'Vecchio' },
            ]}
          />

          <Input
            label="Anno di apice previsto"
            type="number"
            placeholder="es. 2030"
            value={formData.drinkingWindow.peakYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                drinkingWindow: {
                  ...formData.drinkingWindow,
                  peakYear: parseInt(e.target.value) || (formData.vintage + 5),
                },
              })
            }
          />
        </div>

        <Divider variant="hairline" spacing="sm" />

        {/* Blocco 4: Punteggio & Note Olfattive */}
        <div className="cellar-add-form__row">
          <div className="cellar-add-form__rating-box">
            <label className="cellar-add-form__aroma-label">Valutazione Personale</label>
            <RatingStars
              value={formData.rating}
              interactive={true}
              onChange={(val) => setFormData({ ...formData, rating: val })}
              size="md"
              showScore={true}
            />
          </div>
        </div>

        <div className="cellar-add-form__aroma-section">
          <label className="cellar-add-form__aroma-label">Note Olfattive (Famiglie Olfattive)</label>
          {AROMA_FAMILIES.map((fam) => (
            <div key={fam.family} className="cellar-add-form__aroma-family">
              <span className="cellar-add-form__aroma-family-title">{fam.family}</span>
              <div className="cellar-add-form__aroma-grid">
                {fam.items.map((aroma) => {
                  const isSelected = (formData.tastingNotes.aroma || []).includes(aroma);
                  return (
                    <button
                      key={aroma}
                      type="button"
                      className={`cellar-add-form__aroma-chip ${isSelected ? 'cellar-add-form__aroma-chip--selected' : ''}`}
                      onClick={() => toggleAroma(aroma)}
                    >
                      {isSelected ? '✓ ' : ''}{aroma}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Divider variant="hairline" spacing="sm" />

        <div className="cellar-add-form__row">
          <TextArea
            label="Note Personali"
            placeholder="es. Acquistato in enoteca, consigli per la conservazione, storia del lotto..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
      </form>
      )}
    </Drawer>
  );
};
