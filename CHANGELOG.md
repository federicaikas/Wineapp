# Changelog — CELLAR

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.
Il formato segue le specifiche di [Keep a Changelog](https://keepachangelog.com/it/1.0.0/) e [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-alpha] - 2026-10-02

### Added
- **Scaffolding Progetto**: Setup di Vite, React 18, TypeScript e architettura Vanilla CSS modulare.
- **Design Tokens (O,nice! Studio aesthetic)**:
  - Font editoriali ad alto contrasto: *Fraunces* (display serif), *Cormorant Garamond* (corsivo sartoriale), *Plus Jakarta Sans* e *Space Mono* (timbri di lotto e dati tecnici).
  - Palette materica su fondo caldo carta cotone (`--paper-canvas: #FAF7F2`, `--paper-card: #FFFFFF`), inchiostri calcografici (`--ink-dark`, `--ink-primary`), accenti bordeaux ceralacca (`--wine-bordeaux`) e foglia d'oro d'annata (`--gold-foil`).
  - Dettagli da etichetta vinicola: hairline border, angoli smussati sartoriali, effetti letterpress e timbro a secco.
- **Set Iniziale Atomic Design System (`src/components/design-system/`)**:
  - **Atoms**:
    - `Typography`: titoli display, corsivi d'annata, etichette sans e timbri monospazio lotto.
    - `Button`: varianti primarie ceralacca bordeaux, carta calda secondaria, outline, ghost e timbro d'oro.
    - `Badge`: categorie vino (Rosso, Bianco, Bollicine, Rosato, Orange, Dolce), finestre di beva (*Pronto*, *In affinamento*, *All'apice*, *Oltre*) e pill annata.
    - `Input`, `Select`, `TextArea`: campi di input con etichette vintage e focus ring bordeaux.
    - `RatingStars`: scala 5 stelle e badge 100-punti da guida vinicola.
    - `Divider`: hairline, tratteggiato e con ornamento a losanga dorata.
  - **Molecules**:
    - `StockCounter`: stepper tattile con indicazione esaurito per inventario cantina.
    - `WineStatPill`: visualizzatore di metriche enologiche (annata, gradazione, ubicazione).
    - `SearchFilterBar`: barra di ricerca istantanea con chip di categoria e ordinamento.
    - `EmptyState`: stato vuoto poetico con monogramma calice e call-to-action.
    - `Drawer` & `Modal`: componenti di overlay con sfocatura e animazione sartoriale.
- **Governance**: Creazione del protocollo `AGENTS.md` per coordinamento multi-agente.
