import React, { useState, useEffect } from 'react';
import type { WineBottle, WineFormData } from '../../types/wine';
import type { WineCategory, DrinkingStatus } from '../design-system/atoms/Badge';
import { Drawer, Input, Select, TextArea, Button, Divider, RatingStars } from '../design-system';
import { Save } from 'lucide-react';
import './QuickAddDrawer.css';

export interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WineFormData) => Promise<WineBottle | void>;
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
  location: 'Rack A, Scaffale 1',
  drinkingStatus: 'ready',
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
  notes: '',
};

export const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWine,
}) => {
  const [formData, setFormData] = useState<WineFormData>(DEFAULT_FORM);
  const [grapesInput, setGrapesInput] = useState('');
  const [aromaInput, setAromaInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingWine) {
      setFormData({
        name: editingWine.name,
        producer: editingWine.producer,
        vintage: editingWine.vintage,
        category: editingWine.category,
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
      });
      setGrapesInput(editingWine.grapes.join(', '));
      setAromaInput(editingWine.tastingNotes.aroma.join(', '));
    } else {
      setFormData(DEFAULT_FORM);
      setGrapesInput('Nebbiolo 100%');
      setAromaInput('Frutti di bosco, Spezie, Tabacco');
    }
    setErrors({});
  }, [editingWine, isOpen]);

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

      const parsedAroma = aromaInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        grapes: parsedGrapes.length > 0 ? parsedGrapes : ['Non specificato'],
        tastingNotes: {
          ...formData.tastingNotes,
          aroma: parsedAroma.length > 0 ? parsedAroma : ['Sensazioni vinose'],
        },
      });
      onClose();
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={editingWine ? 'Modifica Scheda Vino' : 'Nuova Acquisizione'}
      subtitle={editingWine ? 'Aggiorna i parametri nel registro cantina' : 'Registra un nuovo lotto nella tua collezione enologica'}
      lotStamp={formData.lotNumber || 'REGISTRO DI CANTINA'}
      width="md"
      footer={
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
      }
    >
      <form className="cellar-add-form" onSubmit={handleSubmit}>
        {/* Sezione Identità */}
        <div className="cellar-add-form__section">
          <span className="cellar-add-form__section-title">01. Identità &amp; Terroir</span>
          
          <div className="cellar-add-form__row">
            <Input
              label="Nome del Vino / Cru"
              placeholder="es. Barolo Bussia, Cervaro della Sala..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
          </div>

          <div className="cellar-add-form__grid-2">
            <Input
              label="Produttore / Tenuta"
              placeholder="es. Giacomo Conterno"
              value={formData.producer}
              onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
              error={errors.producer}
              required
            />

            <Input
              label="Annata (Millesimo)"
              type="number"
              placeholder="2018"
              value={formData.vintage}
              onChange={(e) => setFormData({ ...formData, vintage: parseInt(e.target.value) || 0 })}
              error={errors.vintage}
              required
            />
          </div>

          <div className="cellar-add-form__grid-2">
            <Select
              label="Tipologia di Vino"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as WineCategory })}
              options={[
                { value: 'red', label: 'Vino Rosso' },
                { value: 'white', label: 'Vino Bianco' },
                { value: 'sparkling', label: 'Spumante / Bollicine' },
                { value: 'rose', label: 'Rosato' },
                { value: 'orange', label: 'Orange / Macerato' },
                { value: 'dessert', label: 'Passito / Dolce' },
              ]}
            />

            <Input
              label="Denominazione"
              placeholder="es. DOCG, AOC, IGT"
              value={formData.appellation}
              onChange={(e) => setFormData({ ...formData, appellation: e.target.value })}
            />
          </div>

          <div className="cellar-add-form__grid-2">
            <Input
              label="Paese d'Origine"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />

            <Input
              label="Regione / Territorio"
              placeholder="es. Piemonte / Langhe"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>

          <div className="cellar-add-form__row">
            <Input
              label="Vitigni (separati da virgola)"
              placeholder="es. Nebbiolo 100% oppure Corvina 60%, Rondinella 40%"
              value={grapesInput}
              onChange={(e) => setGrapesInput(e.target.value)}
            />
          </div>
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Sezione Cantina & Conservazione */}
        <div className="cellar-add-form__section">
          <span className="cellar-add-form__section-title">02. Cantina &amp; Scorte</span>

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
              label="Prezzo Singolo (€)"
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
              label="Formato Bottiglia"
              value={formData.bottleSize}
              onChange={(e) => setFormData({ ...formData, bottleSize: e.target.value })}
              options={[
                { value: '750 ml', label: 'Standard (750 ml)' },
                { value: 'Magnum 1.5 L', label: 'Magnum (1.5 L)' },
                { value: 'Mezza 375 ml', label: 'Mezza (375 ml)' },
                { value: 'Jéroboam 3 L', label: 'Jéroboam (3 L)' },
              ]}
            />

            <Input
              label="Ubicazione in Cantina"
              placeholder="es. Rack B, Fila 3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="cellar-add-form__grid-2">
            <Select
              label="Stato Evolutivo (Beva)"
              value={formData.drinkingStatus}
              onChange={(e) => setFormData({ ...formData, drinkingStatus: e.target.value as DrinkingStatus })}
              options={[
                { value: 'ready', label: 'Pronto da bere' },
                { value: 'aging', label: 'In affinamento / Da attendere' },
                { value: 'peak', label: 'All’apice della maturità' },
                { value: 'past', label: 'Oltre il picco ottimale' },
              ]}
            />

            <Input
              label="Lotto / Timbro"
              placeholder="es. LOTTO B-12"
              value={formData.lotNumber}
              onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
            />
          </div>

          <div className="cellar-add-form__grid-2">
            <Input
              label="Inizio Finestra di Beva"
              type="number"
              value={formData.drinkingWindow.start}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drinkingWindow: {
                    ...formData.drinkingWindow,
                    start: parseInt(e.target.value) || formData.vintage,
                  },
                })
              }
            />

            <Input
              label="Anno di Apice Previsto"
              type="number"
              value={formData.drinkingWindow.peakYear}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drinkingWindow: {
                    ...formData.drinkingWindow,
                    peakYear: parseInt(e.target.value) || formData.vintage + 5,
                  },
                })
              }
            />
          </div>
        </div>

        <Divider variant="hairline" spacing="md" />

        {/* Sezione Note Sommelier */}
        <div className="cellar-add-form__section">
          <span className="cellar-add-form__section-title">03. Note Sommelier &amp; Valutazione</span>

          <div className="cellar-add-form__grid-2">
            <div className="cellar-add-form__rating-box">
              <label className="cellar-field__label">Valutazione Personale</label>
              <RatingStars
                value={formData.rating}
                interactive
                onChange={(val) => setFormData({ ...formData, rating: val })}
                size="lg"
              />
            </div>

            <Input
              label="Punteggio Critica (Guida / 100)"
              type="number"
              min={70}
              max={100}
              value={formData.criticScore || 90}
              onChange={(e) => setFormData({ ...formData, criticScore: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div className="cellar-add-form__row">
            <Input
              label="Aromi Principali (separati da virgola)"
              placeholder="es. Ciliegia matura, Cuoio, Foglia di tè, Viola"
              value={aromaInput}
              onChange={(e) => setAromaInput(e.target.value)}
            />
          </div>

          <div className="cellar-add-form__row">
            <TextArea
              label="Note Gustative al Palato"
              placeholder="Descrivi freschezza, trama tannica, corpo e persistenza..."
              value={formData.tastingNotes.palate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tastingNotes: { ...formData.tastingNotes, palate: e.target.value },
                })
              }
            />
          </div>

          <div className="cellar-add-form__row">
            <Input
              label="Abbinamenti Gastronomici Consigliati"
              placeholder="es. Carni rosse brasate, formaggi erborinati d'alpeggio"
              value={formData.tastingNotes.pairing}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tastingNotes: { ...formData.tastingNotes, pairing: e.target.value },
                })
              }
            />
          </div>

          <div className="cellar-add-form__row">
            <TextArea
              label="Note di Cantina &amp; Provenienza"
              placeholder="Note di acquisto, regali, temperatura consigliata di servizio..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
};
