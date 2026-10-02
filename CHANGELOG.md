# Changelog — CELLAR

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.
Il formato segue le specifiche di [Keep a Changelog](https://keepachangelog.com/it/1.0.0/) e [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-02

### Added
- **Core Data Layer (Sub-Agent Logic)**:
  - Schema TypeScript completo per `WineBottle`, `TastingNotes`, `DrinkingWindow`, `CellarStats`.
  - Database client-side zero-latency su IndexedDB con **Dexie.js** (`cellarDb.ts`).
  - Precaricamento automatico di 10 grandi vini iconici da collezione (*Barolo Riserva Monfortino*, *Sassicaia*, *Dom Pérignon Vintage*, *Brunello Il Marroneto*, *Cervaro della Sala*, *Ribolla Gravner*, *Chablis Raveneau*, *Amarone Quintarelli*, *Etna Rosso Terre Nere*, *Château d'Yquem*).
  - Operazioni CRUD complete, gestione scorte con contatore stappature, live queries con `useCellar`.
- **Organisms & Experience (Sub-Agent UI)**:
  - `WineCard`: etichetta vinicola sartoriale con cornice interna, timbro annata, rating 100-punti, badge tipologia, stepper scorte e indicatore di esaurimento.
  - `CellarGrid`: dashboard indicatori (bottiglie totali, valore economico cantina, vini pronti, all'apice e in affinamento), switch tra vista a etichette (grid) e registro da sommelier (ledger list), barra filtri per categoria e ordinamento multi-criterio.
  - `QuickAddDrawer`: pannello laterale scorrevole con form di inserimento/modifica, sezioni identità, scorte e note sommelier.
  - `WineDetailModal`: dossier enologico completo con timeline visiva della finestra di beva, chip olfattive, recensione al palato, abbinamento gastronomico e azione di stappatura con micro-celebrazione.
  - `CellarHeader`: testata con monogramma sigillato in ceralacca, calcolo istantaneo del valore stimato e pulsante rapido aggiungi bottiglia.
- **Micro-interazioni**:
  - Effetto pirotecnico ceralacca/oro al consumo/stappatura della bottiglia.
  - Transizioni fluide e feedback aptico visivo.
- **Documentazione**:
  - Creazione di `ARCHITECTURE.md` con dettagli di architettura, design tokens e comando esatto per lanciare l'applicazione in locale (`npm run dev`).

---

## [0.1.0-alpha] - 2026-10-02

### Added
- **Scaffolding Progetto**: Setup di Vite, React 18, TypeScript e architettura Vanilla CSS modulare.
- **Design Tokens (O,nice! Studio aesthetic)**:
  - Font editoriali ad alto contrasto: *Fraunces* (display serif), *Cormorant Garamond* (corsivo sartoriale), *Plus Jakarta Sans* e *Space Mono* (timbri di lotto e dati tecnici).
  - Palette materica su fondo caldo carta cotone (`--paper-canvas: #FAF7F2`, `--paper-card: #FFFFFF`), inchiostri calcografici (`--ink-dark`, `--ink-primary`), accenti bordeaux ceralacca (`--wine-bordeaux`) e foglia d'oro d'annata (`--gold-foil`).
  - Dettagli da etichetta vinicola: hairline border, angoli smussati sartoriali, effetti letterpress e timbro a secco.
- **Set Iniziale Atomic Design System (`src/components/design-system/`)**:
  - **Atoms**: `Typography`, `Button`, `Badge`, `Input`, `Select`, `TextArea`, `RatingStars`, `Divider`.
  - **Molecules**: `StockCounter`, `WineStatPill`, `SearchFilterBar`, `EmptyState`, `Drawer`, `Modal`.
- **Governance**: Creazione del protocollo `AGENTS.md` per coordinamento multi-agente.
