# ARCHITECTURE.md — AFFINAPP: Documento Architetturale & Guida Tecnica

## 1. Visione & Obiettivi Architetturali
**AFFINAPP** è un'applicazione web locale ad altissima fedeltà estetica e zero-friction per collezionisti ed estimatori di vino.  
L'architettura combina la reattività di **React 18 + TypeScript + Vite** con una persistenza locale client-side basata su **IndexedDB (via Dexie.js)** e un **Design System Vanilla CSS** (viola, panna, ocra).

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

## 4. Design Tokens & Identità Visiva

Fonte di verità: `src/styles/tokens.css` (e `tokens.json`). Logo: `src/assets/affinapp-logo.svg` (viola `#2D234A`).

### Tipografia (solo sans serif)
- **Display**: `Oswald` (stile DIN) — titoli grandi, nomi vino, numeri.
- **Heading e testo**: `Montserrat` — titoli di sezione, interfaccia, metadati.
- **Eyebrow**: `Caveat` — piccole etichette scritte a mano.

### Palette
- **Panna** `--background-base: #FFFDF9`
- **Viola (brand e testo)** `--brand-primary` / `--text-primary: #2D234A`, `--text-secondary: #4F4766`, `--text-muted: #706880`
- **Ocra** `--accent-secondary: #E5A823` (testo su chiaro: `--accent-secondary-dark`)
- **Pistacchio** `--accent-tertiary: #96AB41` (testo su chiaro: `--accent-tertiary-dark`)

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
