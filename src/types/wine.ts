import type { WineCategory, DrinkingStatus } from '../components/design-system/atoms/Badge';
export type { WineCategory, DrinkingStatus };

export interface TastingNotes {
  aroma: string[];
  palate: string;
  pairing: string;
}

export interface DrinkingWindow {
  start: number;
  end: number;
  peakYear: number;
}

export interface WineBottle {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  category: WineCategory;
  subCategory?: string; // es. "Rosso evoluto", "Metodo Classico", "Dolce Muffato"
  appellation: string; // es. DOCG Barolo, AOC Champagne, Bolgheri Sassicaia DOC
  country: string;
  region: string;
  grapes: string[];
  alcohol: number; // es. 14.5%
  bottleSize: string; // es. "750 ml", "Magnum 1.5 L"
  stock: number; // numero di bottiglie in cantina
  price: number; // prezzo stimato o d'acquisto per bottiglia in €
  location: string; // es. "Rack A, Scaffale 3, Scomparto 12"
  drinkingStatus: DrinkingStatus;
  drinkingWindow: DrinkingWindow;
  rating: number; // 1 to 5 stars
  criticScore?: number; // 85 to 100 points
  tastingNotes: TastingNotes;
  lotNumber: string; // es. "LOT B-2018/48"
  favorite: boolean;
  purchaseChannel?: 'GDO' | 'cantina' | 'fiera' | 'altro' | string;
  notes?: string;
  websiteUrl?: string; // URL del sito web ufficiale della cantina
  uncorkedCount?: number;
  imageUrl?: string; // foto dell'etichetta scansionata o caricata
  aiCalculated?: boolean; // indicatore se la finestra di beva e le info sono state calcolate con l'IA & fonti online
  aiCalculatedDetails?: string; // spiegazione dettagliata del calcolo IA dell'apice
  createdAt: string;
  updatedAt: string;
}

export interface CellarStats {
  totalBottles: number;
  uniqueLabels: number;
  totalEstimatedValue: number;
  readyToDrinkCount: number;
  agingCount: number;
  peakCount: number;
  favoritesCount: number;
  depletedCount: number;
  categoryBreakdown: Record<WineCategory, number>;
  statusCategoryBreakdown: {
    all: Record<WineCategory, number>;
    ready: Record<WineCategory, number>;
    peak: Record<WineCategory, number>;
    aging: Record<WineCategory, number>;
  };
}

export type WineFormData = Omit<WineBottle, 'id' | 'createdAt' | 'updatedAt' | 'uncorkedCount'>;
