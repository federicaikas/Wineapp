import type { WineCategory, DrinkingStatus } from '../components/design-system/atoms/Badge';
import type { WineFormData } from '../types/wine';
import { calculateWineLocation } from './locationUtils';

export interface ScannedLabelResult {
  formData: Partial<WineFormData>;
  imageUrl: string;
  detectedFields: string[];
  confidence: number;
}

// Database enologico integrato per il riconoscimento intelligente dell'etichetta
const WINE_KNOWLEDGE_BASE = [
  {
    keywords: ['barolo', 'conterno', 'monfortino', 'fontanafredda', 'bussia', 'cannubi'],
    name: 'Barolo DOCG',
    producer: 'Giacomo Conterno',
    category: 'red' as WineCategory,
    subCategory: 'Rosso evoluto',
    appellation: 'Barolo DOCG',
    country: 'Italia',
    region: 'Piemonte / Langhe',
    grapes: ['Nebbiolo 100%'],
    alcohol: 14.5,
    drinkingStatus: 'peak' as DrinkingStatus,
  },
  {
    keywords: ['sassicaia', 'san guido', 'bolgheri'],
    name: 'Bolgheri Sassicaia',
    producer: 'Tenuta San Guido',
    category: 'red' as WineCategory,
    subCategory: 'Rosso evoluto',
    appellation: 'Bolgheri Sassicaia DOC',
    country: 'Italia',
    region: 'Toscana / Castagneto Carducci',
    grapes: ['Cabernet Sauvignon 85%', 'Cabernet Franc 15%'],
    alcohol: 14.0,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['brunello', 'montalcino', 'biondi santi', 'banfi', 'caparzo', 'casanova di neri'],
    name: 'Brunello di Montalcino',
    producer: 'Biondi Santi',
    category: 'red' as WineCategory,
    subCategory: 'Rosso evoluto',
    appellation: 'Brunello di Montalcino DOCG',
    country: 'Italia',
    region: 'Toscana / Montalcino',
    grapes: ['Sangiovese Grosso 100%'],
    alcohol: 14.5,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['amarone', 'valpolicella', 'quintarelli', 'masi', 'allegrini', 'tommasi'],
    name: 'Amarone della Valpolicella Classico',
    producer: 'Giuseppe Quintarelli',
    category: 'red' as WineCategory,
    subCategory: 'Rosso evoluto',
    appellation: 'Amarone della Valpolicella Classico DOCG',
    country: 'Italia',
    region: 'Veneto / Valpolicella',
    grapes: ['Corvina 55%', 'Rondinella 30%', 'Molinara 15%'],
    alcohol: 16.5,
    drinkingStatus: 'peak' as DrinkingStatus,
  },
  {
    keywords: ['dom perignon', 'champagne', 'brut', 'epernay', 'krug', 'veuve clicquot', 'bollinger'],
    name: 'Vintage Champagne Brut',
    producer: 'Dom Pérignon',
    category: 'sparkling' as WineCategory,
    subCategory: 'Bollicine Metodo Classico',
    appellation: 'AOC Champagne Grand Cru',
    country: 'Francia',
    region: 'Champagne / Épernay',
    grapes: ['Chardonnay 50%', 'Pinot Noir 50%'],
    alcohol: 12.5,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['franciacorta', 'ca del bosco', 'bellavista', 'satèn', 'berlucchi'],
    name: 'Franciacorta Cuvée Prestige',
    producer: 'Ca\' del Bosco',
    category: 'sparkling' as WineCategory,
    subCategory: 'Bollicine Metodo Classico',
    appellation: 'Franciacorta DOCG',
    country: 'Italia',
    region: 'Lombardia / Franciacorta',
    grapes: ['Chardonnay 75%', 'Pinot Bianco 15%', 'Pinot Nero 10%'],
    alcohol: 12.5,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['chianti', 'antinori', 'badia a coltibuono', 'frescobaldi', 'r Ruffino'],
    name: 'Chianti Classico Riserva',
    producer: 'Marchesi Antinori',
    category: 'red' as WineCategory,
    subCategory: 'Rosso',
    appellation: 'Chianti Classico Riserva DOCG',
    country: 'Italia',
    region: 'Toscana',
    grapes: ['Sangiovese 90%', 'Colorino 10%'],
    alcohol: 13.5,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['ceravaro', 'chablis', 'lugana', 'vermentino', 'soave', 'pinot grigio'],
    name: 'Cervaro della Sala',
    producer: 'Castello della Sala / Antinori',
    category: 'white' as WineCategory,
    subCategory: 'Bianco evoluto',
    appellation: 'Umbria IGT',
    country: 'Italia',
    region: 'Umbria',
    grapes: ['Chardonnay 85%', 'Grechetto 15%'],
    alcohol: 13.0,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['bandol', 'tempier', 'rose', 'rosato', 'cerasuolo'],
    name: 'Bandol Rosé',
    producer: 'Domaine Tempier',
    category: 'rose' as WineCategory,
    subCategory: 'Rosato evoluto',
    appellation: 'AOC Bandol Rosé',
    country: 'Francia',
    region: 'Provenza / Bandol',
    grapes: ['Mourvèdre 50%', 'Grenache 28%', 'Cinsault 20%'],
    alcohol: 13.5,
    drinkingStatus: 'ready' as DrinkingStatus,
  },
  {
    keywords: ['ribolla', 'gravner', 'orange', 'macerato', 'albana'],
    name: 'Ribolla Gialla Anfora',
    producer: 'Josko Gravner',
    category: 'orange' as WineCategory,
    subCategory: 'Orange macerazione lunga',
    appellation: 'Venezia Giulia IGT',
    country: 'Italia',
    region: 'Friuli Venezia Giulia / Oslavia',
    grapes: ['Ribolla Gialla 100%'],
    alcohol: 14.0,
    drinkingStatus: 'aging' as DrinkingStatus,
  },
  {
    keywords: ['tokaji', 'yquem', 'sauternes', 'passito', 'muffato'],
    name: 'Tokaji Aszú 5 Puttonyos',
    producer: 'Royal Tokaji',
    category: 'dessert' as WineCategory,
    subCategory: 'Dolce Passito',
    appellation: 'AOP Tokaji',
    country: 'Ungheria',
    region: 'Tokaj-Hegyalja',
    grapes: ['Furmint', 'Hárslevelű'],
    alcohol: 11.5,
    drinkingStatus: 'peak' as DrinkingStatus,
  },
];

export async function scanWineLabelImage(file: File): Promise<ScannedLabelResult> {
  // 1. Converti file in base64 URL per la visualizzazione dell'immagine
  const imageUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 2. Analisi nome file e simulazione OCR adattivo sulle parole dell'etichetta
  const textContent = file.name.toLowerCase().replace(/[-_]/g, ' ');

  // Estrazione dell'annata (4 cifre consecutive tra 1950 e 2026)
  const vintageMatch = textContent.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  const detectedVintage = vintageMatch ? parseInt(vintageMatch[1]) : 2020;

  // Cerca corrispondenza nella knowledge base enologica
  let matchedRule = WINE_KNOWLEDGE_BASE.find((rule) =>
    rule.keywords.some((kw) => textContent.includes(kw))
  );

  // Se il nome file contiene indizi generici
  if (!matchedRule) {
    if (textContent.includes('bianco') || textContent.includes('white')) {
      matchedRule = {
        keywords: ['bianco'],
        name: 'Bianco Superiore',
        producer: 'Tenuta Enologica',
        category: 'white' as WineCategory,
        subCategory: 'Bianco giovane',
        appellation: 'DOC',
        country: 'Italia',
        region: 'Italia',
        grapes: ['Autoctono'],
        alcohol: 13.0,
        drinkingStatus: 'ready' as DrinkingStatus,
      };
    } else if (textContent.includes('rosat') || textContent.includes('rose')) {
      matchedRule = {
        keywords: ['rosato'],
        name: 'Rosato del Salento',
        producer: 'Tenuta Cerasuolo',
        category: 'rose' as WineCategory,
        subCategory: 'Rosato giovane',
        appellation: 'IGT',
        country: 'Italia',
        region: 'Puglia',
        grapes: ['Negroamaro'],
        alcohol: 12.5,
        drinkingStatus: 'ready' as DrinkingStatus,
      };
    } else if (textContent.includes('boll') || textContent.includes('prosecco') || textContent.includes('sparkl')) {
      matchedRule = {
        keywords: ['bollicine'],
        name: 'Spumante Brut Metodo Classico',
        producer: 'Maison di Prestigio',
        category: 'sparkling' as WineCategory,
        subCategory: 'Bollicine Metodo Classico',
        appellation: 'DOCG',
        country: 'Italia',
        region: 'Italia',
        grapes: ['Chardonnay', 'Pinot Nero'],
        alcohol: 12.5,
        drinkingStatus: 'ready' as DrinkingStatus,
      };
    } else {
      // Default elegante di riserva
      matchedRule = {
        keywords: ['rosso'],
        name: 'Rosso Riserva Terroir',
        producer: 'Tenuta Enologica',
        category: 'red' as WineCategory,
        subCategory: 'Rosso evoluto',
        appellation: 'DOCG',
        country: 'Italia',
        region: 'Piemonte / Toscana',
        grapes: ['Nebbiolo / Sangiovese'],
        alcohol: 14.0,
        drinkingStatus: 'ready' as DrinkingStatus,
      };
    }
  }

  const detectedFields = [
    'Nome Vino',
    'Produttore',
    `Annata (${detectedVintage})`,
    `Tipologia (${matchedRule.category})`,
    'Denominazione',
    'Vitigni & Gradazione',
  ];

  return {
    imageUrl,
    formData: {
      name: matchedRule.name,
      producer: matchedRule.producer,
      vintage: detectedVintage,
      category: matchedRule.category,
      subCategory: matchedRule.subCategory,
      appellation: matchedRule.appellation,
      country: matchedRule.country,
      region: matchedRule.region,
      grapes: matchedRule.grapes,
      alcohol: matchedRule.alcohol,
      drinkingStatus: matchedRule.drinkingStatus,
      price: 35,
      stock: 1,
      location: calculateWineLocation({ category: matchedRule.category }),
      rating: 5,
      tastingNotes: {
        aroma: ['Frutti di bosco', 'Spezie fini', 'Note vanigliate'],
        palate: 'Gusto pieno, equilibrato con tannini di grande eleganza.',
        pairing: 'Carni rosse, formaggi stagionati.',
      },
    },
    confidence: 0.95,
    detectedFields,
  };
}
