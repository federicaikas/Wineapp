# Changelog — CELLAR

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.
Il formato segue le specifiche di [Keep a Changelog](https://keepachangelog.com/it/1.0.0/) e [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-10-06

### Added & Optimized
- **Estrazione Informazioni con IA da URL Sito Web**:
  - Aggiunto campo URL input e pulsante `ANALIZZA` nella scheda vino (`WineDetailModal`).
  - Visita e analizza il sito web estraendo note olfattive, palato, abbinamenti, denominazione, vitigni, grado alcolico e immagine della bottiglia.
  - Mantenimento **tassativo ed inalterato** di annata (`vintage`) e prezzo (`price`).
  - Badge feedback visuale `✨ Ricerca ed Estrazione con IA`.
- **Integrazione Scatta Foto Nativa (Camera)**:
  - Sostituita la ricerca online immagini con la funzionalità `Scatta foto` direttamente integrata con la fotocamera del dispositivo mobile/desktop (`input capture="environment"`).
- **Legenda Colori e Tipologie Vini**:
  - Inserita barra di legenda interattiva sotto i filtri di ricerca con tutti i badge cromatici (Rossi, Bianchi, Bollicine, Rosati, Orange, Dolci) e le relative collocazioni nelle rack di cantina.
- **Ordinamento e Slider Prezzo**:
  - Aggiunto slider range per filtrare le bottiglie in base al prezzo massimo.
  - Aggiornato l'ordinamento con le opzioni *Prezzo: Dal più caro* e *Prezzo: Dal meno caro* (rimossa voce punteggio).
- **Tasto "Cosa beviamo? 🍷" & "Cerca info 🔍"**:
  - Pulsante casuale in alto a destra per scegliere e aprire la scheda di una bottiglia pronta in cantina.
  - Pulsante rapido `Cerca info` sotto il nome del vino per avviare ricerche Google mirate.
- **Ottimizzazione Generale & Refactoring**:
  - Verificato typecheck TypeScript (`tsc --noEmit`) con 0 errori.
  - Verificata compilazione di produzione (`npm run build`) con successo.

---

## [0.2.0] - 2026-10-05

### Added & Integrated
- **Integrazione Completa dell'Atomic Design System nell'App Main**:
  - `CellarHeader`: Integrati `TagEyebrow` ("Archivio Privato N° 0482") e `MainTitleLockup` ("CELLAR • CAVE PRIVÉE") con pulsanti atomici primari e secondari.
  - `CellarGrid`: Inserita la Hero Banner `HeroSection` in apertura di catalogo e convertite le 4 metriche di cruscotto in `FeatureCard` atomiche con bordo accento `#7A9A3B`, titoli DIN Bold e dettagli Montserrat.
  - `WineDetailModal`: Riprogettato il dossier enologico con `TagEyebrow` (produttore), `MainTitleLockup` (titolo vino e denominazione), `ContentBlock` per le note degustative e pulsanti d'azione atomici (Stappa, Modifica, Elimina).
  - `QuickAddDrawer`: Integrati gli elementi atomici nei form di acquisizione ed edit.
- **Antigravity Atomic Design System Library**:
  - Configurazione dei **Tokens & Primitive (Atoms)**:
    - Palette Colori: `background-base` (`#FFFDF9`), `text-primary` / `brand-primary` (`#2D234A`), `accent-secondary` (`#E5A823`), `accent-tertiary` (`#7A9A3B`), `text-muted` (`#706880`).
    - Tipografia: Display DIN Bold (`"DIN Bold", "DIN Alternate", "Oswald"` all-caps, line-height 0.95, letter-spacing -0.02em), Body Text Montserrat (400 Regular & 700 Bold), Eyebrow Script Caveat (italic 600, rotazione -3deg).
    - Esportazione dei token in JSON (`src/styles/tokens.json`) e CSS variables (`src/styles/tokens.css`).
  - Showcase interattivo navigabile con il pulsante **"🎨 Design System UI"**.

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
