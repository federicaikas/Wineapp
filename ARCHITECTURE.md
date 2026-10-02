# ARCHITECTURE.md — Documento Architetturale & Guida Tecnica

## 1. Visione & Obiettivi Architetturali
**CELLAR** è un'applicazione web locale ad altissima fedeltà estetica e zero-friction per collezionisti ed estimatori di vino.  
L'architettura combina la reattività di **React 18 + TypeScript + Vite** con una persistenza locale client-side basata su **IndexedDB (via Dexie.js)** e un **Design System Vanilla CSS** ispirato all'eleganza editoriale di **O,nice! Studio**.

---

## 2. Comando Esatto per Avviare l'App in Locale

Dalla root del progetto (`/Users/federicapellegrinelli/Desktop/Vibe coding/Cellar`):

```bash
# 1. (Opzionale se già eseguito) Installa le dipendenze
npm install

# 2. Avvia il server di sviluppo locale
npm run dev
```

L'applicazione sarà immediatamente disponibile all'indirizzo:
👉 **`http://localhost:5173/`**

Per compilare la versione di produzione e verificare i tipi:
```bash
npm run build
```

---

## 3. Stack Tecnologico

| Layer | Tecnologia | Motivazione |
| :--- | :--- | :--- |
| **Bundler & Dev Server** | [Vite 6+](https://vite.dev) | Avvio istantaneo sub-second, Hot Module Replacement (HMR) fulmineo. |
| **UI Framework** | [React 18 / 19](https://react.dev) | Componenti dichiarativi, composizione atomica e reattività fluida. |
| **Type System** | TypeScript 5.x | Tipizzazione rigorosa di schemi enologici, note di degustazione e scorte. |
| **Styling & Design System** | **Vanilla CSS + CSS Custom Properties** | Massima libertà espressiva sartoriale, zero overhead Tailwind, design token O,nice! Studio. |
| **Local Database & Storage** | [Dexie.js](https://dexie.org) (IndexedDB) | Persistenza offline zero-latency, indici di ricerca veloci e live queries reattive. |
| **Iconografia** | [Lucide React](https://lucide.dev) | Glifi lineari minimali, perfettamente integrati con il sans geometrico. |
| **Micro-interazioni** | Canvas Confetti | Effetto ceralacca & polvere dorata allo stappamento di una bottiglia. |

---

## 4. Design Tokens & Identità Visiva (O,nice! Studio)

L'identità si ispira alla tattilità dei supporti cartacei d'arte e alle grandi etichette storiche:

### Tipografia Sartoriale
- **Display Serif**: `Fraunces` — Carattere d'autore ad alto contrasto con grazie morbide ed eleganti per i titoli principali e le testate.
- **Editorial Serif**: `Cormorant Garamond` — Corsivo nobile per produttori, cuvée, note di degustazione e citazioni sensoriali.
- **Modern Sans**: `Plus Jakarta Sans` — Grotesque geometrico e arioso per leggibilità impeccabile di etichette e metadati.
- **Technical Monospace**: `Space Mono` — Timbri di lotto, gradazione alcolica, annate e prezzi (`LOT N° 15-B/24`, `14.5% VOL`).

### Palette Materica su Fondo Caldo
- **Canvas Carta Cotone**: `--paper-canvas: #FAF7F2;`, `--paper-surface: #F3ECE1;`, `--paper-card: #FFFFFF;`
- **Inchiostri di Stampa**: Carbon Ink `--ink-dark: #1A1614;`, Dark Espresso `--ink-primary: #2B2521;`, Grafite `--ink-secondary: #5F564F;`
- **Ceralacca Bordeaux (Wax Seal)**: `--wine-bordeaux: #6C1A24;`, `--wine-deep: #471118;`, `--wine-soft: #F7EFEF;`
- **Foglia d'Oro d'Annata (Gold Foil)**: `--gold-foil: #B8860B;`, `--gold-accent: #C79628;`, `--gold-soft: #FAF5E6;`
- **Terroir & Vigna**: Olive Sage `--vine-olive: #435443;`, Terracotta Amphora `--terracotta: #AD5537;`

---

## 5. Struttura del Progetto (Atomic Design)

```
src/
├── components/
│   ├── design-system/          # Core Design System
│   │   ├── atoms/              # Typography, Button, Badge, Input, RatingStars, Divider
│   │   ├── molecules/          # StockCounter, WineStatPill, SearchFilterBar, EmptyState, Drawer, Modal
│   │   └── index.ts            # Barrel export unificato
│   └── organisms/              # Organismi complessi
│       ├── WineCard.tsx        # Etichetta vino sartoriale con stepper e status
│       ├── CellarGrid.tsx      # Dashboard metriche, switch griglia/registro, ricerca
│       ├── QuickAddDrawer.tsx  # Drawer laterale di acquisizione/modifica vino
│       ├── WineDetailModal.tsx # Dossier completo con timeline finestra di beva
│       ├── CellarHeader.tsx    # Masthead con monogramma ceralacca e statistiche
│       └── index.ts
├── db/
│   ├── cellarDb.ts             # Schema Dexie, indici IndexedDB, CRUD & calcolo statistiche
│   └── seedWines.ts            # 10 vini iconici mondiali precaricati (Monfortino, Sassicaia, Yquem, etc.)
├── hooks/
│   └── useCellar.ts            # Live queries Dexie, filtri multi-parametro e azioni stappatura
├── styles/
│   ├── tokens.css              # Variabili CSS globali (colori, font, ombreggiature)
│   ├── base.css                # Reset, sfondo cartaceo filigranato, scrollbar
│   └── index.css
├── types/
│   └── wine.ts                 # Interfacce TypeScript (WineBottle, TastingNotes, CellarStats)
├── App.tsx                     # Assemblaggio root dell'applicazione
└── main.tsx                    # Entry point React
```

---

## 6. Modello Dati (`WineBottle`)

Ogni scheda vino traccia:
- **Identità**: `name`, `producer`, `vintage`, `category` (red, white, sparkling, rose, orange, dessert), `appellation`, `country`, `region`, `grapes`.
- **Dati Tecnici**: `alcohol`, `bottleSize`, `stock`, `price`, `location` (ubicazione scaffale/rack).
- **Evoluzione**: `drinkingStatus` (ready, aging, peak, past), `drinkingWindow` (start, end, peakYear).
- **Valutazione**: `rating` (1-5 stelle), `criticScore` (su scala 100 punti).
- **Profilo Sensoriale**: `tastingNotes` (aromi olfattivi, palato, abbinamento gastronomico).
- **Archivio**: `lotNumber`, `favorite`, `uncorkedCount`, `notes`, `createdAt`.
