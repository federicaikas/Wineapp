# AGENTS.md — Protocollo Multi-Agent & Governance di Progetto

## 1. Visione & Obiettivo
Costruire **"Cellar"**, una web application locale e zero-friction per la gestione, catalogazione ed esperienza visiva della propria cantina di vini.
L'esperienza utente è ispirata alla raffinata estetica editoriale di **O,nice! Studio** (tipografia serif d'alta sartoria, sans geometrico bilanciato, palette materica su supporti cartacei caldi, micro-dettagli tattili di etichette vinicole, punzonature e timbri laccati).

---

## 2. Squadra di Agenti & Ruoli

### 🎖️ Lead Orchestrator (Ruolo Principale)
- **Mandato**: Decisione autonoma e completa su stack tecnologico, librerie, architettura e prioritizzazione dei task.
- **Responsabilità**: Coordinamento dei sub-agenti, rispetto dei vincoli di design token, integrazione seamless tra logica e UI, rilascio delle versioni semantiche.

### 🧠 Sub-Agent Logic (Data & State Architecture)
- **Specializzazione**: Schema dati TypeScript, persistenza locale zero-latency (IndexedDB via Dexie / local storage), query, filtri multi-parametro, sorting, validazione dati e migrazioni.
- **Deliverables**: Modelli (`WineBottle`, `WineType`, `TastingNotes`, `CellarStats`), store reattivo (`wineStore`), utility di calcolo metriche (valore cantina, finestre di beva, percentuali prontezza).

### 🎨 Sub-Agent UI (Atomic Design & Editorial Aesthetics)
- **Specializzazione**: Design tokens CSS, atomi e molecole sartoriali, composizione organisms complessi (`WineCard`, `CellarGrid`, `QuickAddDrawer`, `FilterToolbar`, `WineDetailModal`).


### 🛠️ Sub-Agent Git / QA (Quality, Hygiene & GitHub Automation)
- **Modello Assegnato**: Economico & Ultra-veloce (`gemini-2.5-flash` / `gemini-1.5-flash`).
- **Skill di Riferimento**: [git-github-keeper](file:///.agents/skills/git-github-keeper/SKILL.md).
- **Trigger**: Automatico al termine di ogni modifica o implementazione del progetto.
- **Responsabilità**:
  - Controllo qualità preventivo: `npx oxlint` (0 errori, 0 warning) e `npm run build` (`tsc -b && vite build`).
  - Igiene del repository: pulizia file temporanei, verifica stato git.
  - Conventional Commits: redazione automatica del commit semantico (`feat:`, `fix:`, `chore:`, `style:`).
  - Sincronizzazione automatica: `git push origin main` con monitoraggio del deploy su Vercel.

---

## 3. Workflow Operativo

```mermaid
graph TD
    A[Richiesta Utente / Modifica] --> B[Lead Orchestrator / Sub-Agent UI / Logic]
    B --> C[Implementazione Modifiche Codice]
    C --> D[Sub-Agent Git/QA: gemini-2.5-flash]
    D --> E[Check Qualità: oxlint + vite build]
    E --> F[Git Commit Semantico + Push origin main]
    F --> G[Notifica di Completamento all'Utente]
```

### ⚡ Human-in-the-Loop Auto-Approval & Token Efficiency
- Tutte le conferme operative e decisioni tecniche sono pre-approvate ed eseguite automaticamente.
- **Consumo Token Minimale**: Task di git, linting e push delegati a modelli flash economici per azzerare lo spreco di token.

---

## 4. Convenzioni di Commit Semantico

- `feat(design-system): ...`
- `feat(store): ...`
- `feat(ui): ...`
- `docs: ...`
- `release: v0.1.0`

