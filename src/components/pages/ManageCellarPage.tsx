import React, { useRef } from 'react';
import { Button, Typography, Divider } from '../design-system';
import { Plus, Download, Upload, ArrowLeft, Settings } from 'lucide-react';
import type { WineBottle } from '../../types/wine';
import { exportWinesToExcel } from '../../utils/excelExport';
import './ManageCellarPage.css';

interface ManageCellarPageProps {
  wines: WineBottle[];
  onBack: () => void;
  onOpenAdd: () => void;
  onImportWines: (wines: any[]) => Promise<void>;
}

export const ManageCellarPage: React.FC<ManageCellarPageProps> = ({
  wines,
  onBack,
  onOpenAdd,
  onImportWines
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    try {
      await exportWinesToExcel(wines, 'Cantina_Federica_Export.xlsx');
    } catch (err) {
      console.error('Errore durante il download dei dati:', err);
      alert('Si è verificato un errore durante la generazione del file Excel.');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!Array.isArray(parsed)) {
          throw new Error("Il file non contiene un array valido di vini.");
        }
        
        if (confirm(`Sei sicuro di voler importare ${parsed.length} vini? Questo sovrascriverà i dati esistenti se ci sono conflitti di ID.`)) {
          await onImportWines(parsed);
          alert('Importazione completata con successo!');
        }
      } catch (err) {
        console.error('Errore durante l\'importazione:', err);
        alert('File non valido. Assicurati che sia un JSON correttamente formattato.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="manage-cellar-page fade-in">
      <div className="manage-cellar-page__header">
        <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={onBack}>
          Torna alla cantina
        </Button>
      </div>

      <div className="manage-cellar-page__content">
        <div className="manage-cellar-page__title-box">
          <Settings size={32} className="manage-cellar-page__title-icon" />
          <Typography variant="headline" color="primary">
            Gestione Cantina
          </Typography>
          <Typography variant="body" color="secondary" className="manage-cellar-page__subtitle">
            Aggiungi nuove bottiglie o esporta e importa i dati completi della tua collezione per backup o analisi avanzate.
          </Typography>
        </div>
        
        <Divider variant="ornament" symbol="❦" spacing="lg" />

        <div className="manage-cellar-page__actions">
          <div className="manage-cellar-page__action-card">
            <Typography variant="title-sans" color="primary">Nuovo Ingresso</Typography>
            <Typography variant="body" color="secondary" className="manage-cellar-page__action-desc">
              Inserisci manualmente o tramite AI una nuova bottiglia.
            </Typography>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={18} />}
              onClick={onOpenAdd}
              fullWidth
            >
              Nuova bottiglia
            </Button>
          </div>

          <div className="manage-cellar-page__action-card">
            <Typography variant="title-sans" color="primary">Esporta Dati</Typography>
            <Typography variant="body" color="secondary" className="manage-cellar-page__action-desc">
              Scarica tutta la tua cantina in un comodo file Excel.
            </Typography>
            <Button
              variant="outline"
              size="lg"
              icon={<Download size={18} />}
              onClick={handleDownload}
              fullWidth
            >
              Scarica dati cantina
            </Button>
          </div>

          <div className="manage-cellar-page__action-card">
            <Typography variant="title-sans" color="primary">Importa Backup</Typography>
            <Typography variant="body" color="secondary" className="manage-cellar-page__action-desc">
              Ripristina un file JSON precedentemente scaricato.
            </Typography>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="lg"
              icon={<Upload size={18} />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              Carica dati cantina
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
