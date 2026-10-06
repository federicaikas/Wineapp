import type { WineCategory, DrinkingStatus } from '../components/design-system/atoms/Badge';
import type { WineFormData } from '../types/wine';
import { calculateWineLocation } from './locationUtils';

export const SAMPLE_CSV_CONTENT = `Nome;Produttore;Annata;Tipologia;Sottocategoria;Denominazione;Paese;Regione;Vitigni;Gradazione;Bottiglie;Prezzo;Ubicazione;StatoBeva;CanaleAcquisto;Note
Barolo Riserva Monfortino;Giacomo Conterno;2015;red;Rosso evoluto;Barolo Riserva DOCG;Italia;Piemonte;Nebbiolo 100%;14.5;3;1250;Rack 1 (sx);peak;cantina;Acquistato in enoteca ad Alba
Vintage Champagne Brut;Dom Pérignon;2013;sparkling;Bollicine Metodo Classico;AOC Champagne;Francia;Champagne;Chardonnay 51%, Pinot Noir 49%;12.5;4;240;Rack 3 (dx);ready;fiera;Cassa da 6 bottiglie
Bandol Rosé;Domaine Tempier;2022;rose;Rosato evoluto;AOC Bandol Rosé;Francia;Provenza;Mourvèdre 50%, Grenache 28%;13.5;6;42;Rack 3 (dx);ready;cantina;Rosato da grande gastronomia`;

export const SAMPLE_JSON_CONTENT = JSON.stringify(
  [
    {
      name: 'Barolo Riserva Monfortino',
      producer: 'Giacomo Conterno',
      vintage: 2015,
      category: 'red',
      subCategory: 'Rosso evoluto',
      appellation: 'Barolo Riserva DOCG',
      country: 'Italia',
      region: 'Piemonte',
      grapes: ['Nebbiolo 100%'],
      alcohol: 14.5,
      bottleSize: '750 ml',
      stock: 3,
      price: 1250,
      location: 'Rack 1',
      drinkingStatus: 'peak',
      drinkingWindow: { start: 2025, end: 2055, peakYear: 2035 },
      rating: 5,
      criticScore: 100,
      tastingNotes: { aroma: ['Rosa appassita', 'Tartufo'], palate: 'Struttura aristocratica', pairing: 'Brasato' },
      lotNumber: 'LOTTO GC-15',
      favorite: true,
      purchaseChannel: 'cantina',
      notes: 'Edizione storica',
    },
    {
      name: 'Vintage Champagne Brut',
      producer: 'Dom Pérignon',
      vintage: 2013,
      category: 'sparkling',
      subCategory: 'Bollicine Metodo Classico',
      appellation: 'AOC Champagne Grand Cru',
      country: 'Francia',
      region: 'Champagne',
      grapes: ['Chardonnay 51%', 'Pinot Noir 49%'],
      alcohol: 12.5,
      bottleSize: '750 ml',
      stock: 4,
      price: 240,
      location: 'Rack 3',
      drinkingStatus: 'ready',
      drinkingWindow: { start: 2023, end: 2040, peakYear: 2028 },
      rating: 5,
      criticScore: 97,
      tastingNotes: { aroma: ['Brioche', 'Fiori bianchi'], palate: 'Perlage cremoso', pairing: 'Ostriche' },
      lotNumber: 'LOTTO DP-13',
      favorite: true,
      purchaseChannel: 'fiera',
      notes: 'Conservato a 12°C',
    },
  ],
  null,
  2
);

export function downloadSampleCSV(): void {
  const blob = new Blob(['\uFEFF' + SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'modello_cantina_bottiglie.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleJSON(): void {
  const blob = new Blob([SAMPLE_JSON_CONTENT], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'modello_cantina_bottiglie.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const normalizeCategory = (catStr?: string): WineCategory => {
  if (!catStr) return 'red';
  const c = catStr.toLowerCase().trim();
  if (c.includes('ross') || c === 'red') return 'red';
  if (c.includes('bianc') || c === 'white') return 'white';
  if (c.includes('boll') || c.includes('sparkl') || c.includes('prosecco') || c.includes('champagne')) return 'sparkling';
  if (c.includes('rosa') || c === 'rose') return 'rose';
  if (c.includes('orang') || c.includes('macerat')) return 'orange';
  if (c.includes('dolc') || c.includes('passit') || c.includes('muffat') || c === 'dessert') return 'dessert';
  return 'red';
};

const normalizeStatus = (statStr?: string): DrinkingStatus => {
  if (!statStr) return 'ready';
  const s = statStr.toLowerCase().trim();
  if (s.includes('giovan') || s.includes('affin') || s === 'aging') return 'aging';
  if (s.includes('apic') || s === 'peak') return 'peak';
  if (s.includes('vecch') || s.includes('passat') || s === 'past') return 'past';
  return 'ready';
};

export async function parseBatchFile(fileContent: string, fileName: string): Promise<WineFormData[]> {
  const isJson = fileName.toLowerCase().endsWith('.json') || fileContent.trim().startsWith('[');

  if (isJson) {
    const rawList = JSON.parse(fileContent);
    if (!Array.isArray(rawList)) {
      throw new Error('Il file JSON deve contenere una lista (array) di oggetti vino.');
    }
    return rawList.map((item: any, idx: number) => {
      const vRaw = parseInt(item.vintage || item.annata);
      const vintage = (vRaw === 2026 || isNaN(vRaw)) ? 0 : vRaw;
      return {
        name: item.name || item.nome || `Vino Senza Nome #${idx + 1}`,
        producer: item.producer || item.produttore || 'Produttore Sconosciuto',
        vintage,
        category: normalizeCategory(item.category || item.tipologia),
        subCategory: item.subCategory || item.sottocategoria || '',
        appellation: item.appellation || item.denominazione || '',
        country: item.country || item.paese || 'Italia',
        region: item.region || item.regione || '',
        grapes: Array.isArray(item.grapes) ? item.grapes : item.grapes ? [item.grapes] : item.vitigni ? item.vitigni.split(',').map((g: string) => g.trim()) : [],
        alcohol: parseFloat(item.alcohol || item.gradazione) || 13.5,
        bottleSize: item.bottleSize || item.formato || '750 ml',
        stock: parseInt(item.stock || item.bottiglie || item.quantita) || 1,
        price: parseFloat(item.price || item.prezzo) || 0,
        location: item.location || item.ubicazione || calculateWineLocation({ category: normalizeCategory(item.category || item.tipologia), bottleSize: item.bottleSize || item.formato, notes: item.notes || item.note }),
        drinkingStatus: normalizeStatus(item.drinkingStatus || item.statoBeva),
        drinkingWindow: {
          start: item.drinkingWindow?.start || vintage,
          end: item.drinkingWindow?.end || vintage + 10,
          peakYear: item.drinkingWindow?.peakYear || vintage + 5,
        },
        rating: parseInt(item.rating) || 5,
        criticScore: parseInt(item.criticScore) || undefined,
        tastingNotes: {
          aroma: Array.isArray(item.tastingNotes?.aroma) ? item.tastingNotes.aroma : [],
          palate: item.tastingNotes?.palate || '',
          pairing: item.tastingNotes?.pairing || '',
        },
        lotNumber: item.lotNumber || item.lotto || '',
        favorite: Boolean(item.favorite),
        purchaseChannel: item.purchaseChannel || item.canaleAcquisto || 'cantina',
        notes: item.notes || item.note || '',
      };
    });
  }

  // Parsing CSV (supporta separatori ; e ,)
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Il file CSV deve contenere almeno una riga d’intestazione e una riga di dati.');
  }

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

  const findIdx = (possibleKeys: string[]): number => {
    return headers.findIndex((h) => possibleKeys.some((k) => h.includes(k)));
  };

  const nameIdx = findIdx(['nome', 'name', 'vino']);
  const producerIdx = findIdx(['produttore', 'producer', 'cantina']);
  const vintageIdx = findIdx(['annata', 'vintage', 'anno']);
  const categoryIdx = findIdx(['tipologia', 'category', 'tipo']);
  const subCategoryIdx = findIdx(['sottocategoria', 'subcategory']);
  const appellationIdx = findIdx(['denominazione', 'appellation', 'doc']);
  const countryIdx = findIdx(['paese', 'country', 'nazione']);
  const regionIdx = findIdx(['regione', 'region']);
  const grapesIdx = findIdx(['vitigni', 'grapes', 'uva']);
  const alcoholIdx = findIdx(['gradazione', 'alcohol', 'alcol']);
  const stockIdx = findIdx(['bottiglie', 'stock', 'quantita', 'qta']);
  const priceIdx = findIdx(['prezzo', 'price', 'valore']);
  const locationIdx = findIdx(['ubicazione', 'location', 'rack', 'posizioni']);
  const statusIdx = findIdx(['statobeva', 'status', 'beva']);
  const channelIdx = findIdx(['canale', 'acquisto', 'channel']);
  const notesIdx = findIdx(['note', 'notes']);

  const parsedWines: WineFormData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    // Splitting basico CSV
    const cols = rawLine.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === 0 || !cols.some(Boolean)) continue;

    const name = nameIdx >= 0 ? cols[nameIdx] : cols[0];
    if (!name) continue;

    const vintageNum = vintageIdx >= 0 ? parseInt(cols[vintageIdx]) : 0;
    const vintage = (vintageNum === 2026 || isNaN(vintageNum) || vintageNum < 1800 || vintageNum > 2035) ? 0 : vintageNum;
    const category = normalizeCategory(categoryIdx >= 0 ? cols[categoryIdx] : '');
    const notes = notesIdx >= 0 ? cols[notesIdx] : '';

    parsedWines.push({
      name,
      producer: (producerIdx >= 0 ? cols[producerIdx] : '') || 'Produttore Sconosciuto',
      vintage,
      category,
      subCategory: subCategoryIdx >= 0 ? cols[subCategoryIdx] : '',
      appellation: appellationIdx >= 0 ? cols[appellationIdx] : '',
      country: (countryIdx >= 0 ? cols[countryIdx] : '') || 'Italia',
      region: regionIdx >= 0 ? cols[regionIdx] : '',
      grapes: grapesIdx >= 0 && cols[grapesIdx] ? cols[grapesIdx].split(',').map((g) => g.trim()) : [],
      alcohol: alcoholIdx >= 0 ? parseFloat(cols[alcoholIdx].replace(',', '.')) || 13.5 : 13.5,
      bottleSize: '750 ml',
      stock: stockIdx >= 0 ? parseInt(cols[stockIdx]) || 1 : 1,
      price: priceIdx >= 0 ? parseFloat(cols[priceIdx].replace(',', '.')) || 0 : 0,
      location: (locationIdx >= 0 ? cols[locationIdx] : '') || calculateWineLocation({ category, notes }),
      drinkingStatus: normalizeStatus(statusIdx >= 0 ? cols[statusIdx] : ''),
      drinkingWindow: {
        start: vintage,
        end: vintage + 10,
        peakYear: vintage + 5,
      },
      rating: 5,
      criticScore: undefined,
      tastingNotes: {
        aroma: [],
        palate: '',
        pairing: '',
      },
      lotNumber: '',
      favorite: false,
      purchaseChannel: channelIdx >= 0 ? cols[channelIdx] : 'cantina',
      notes: notesIdx >= 0 ? cols[notesIdx] : '',
    });
  }

  if (parsedWines.length === 0) {
    throw new Error('Nessuna bottiglia valida rilevata nel file. Verificare che le intestazioni delle colonne siano corrette.');
  }

  return parsedWines;
}
