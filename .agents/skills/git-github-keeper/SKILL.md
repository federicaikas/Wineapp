---
name: git-github-keeper
description: Automated Git & GitHub governance subagent workflow. Runs quality checks (lint & build), enforces repository cleanliness, writes Conventional Commits, and pushes automatically to GitHub using an economical model (Gemini 2.5 Flash).
---

# Git & GitHub Keeper Sub-Agent

Questo skill definisce le procedure standard ed automatizzate per il **Sub-Agent Git / QA** del progetto **Cellar**.

## Modello Raccomandato
- **Modello Economico Assegnato**: `gemini-2.5-flash` (o `gemini-1.5-flash`).
- **Motivazione**: Esecuzione ultra-rapida (sub-second), consumo token irrisorio e costo minimo per task deterministici di QA, linting, git commit e sincronizzazione remota.

---

## Workflow di Conclusione Modifica (Git Keeper Checklist)

Ogni volta che viene completata una modifica o funzionalità sul progetto, il Sub-Agent esegue in sequenza:

### 1. Controllo Qualità e Type Safety
Prima di procedere al commit, verifica obbligatoriamente che il codice sia privo di errori e regressioni:
```bash
# 1. Linting ultra-rapido (0 errori, 0 warning)
npx oxlint

# 2. Type check TypeScript e validazione bundle di produzione
npm run build
```
Se si riscontrano errori, correggili prima di creare il commit.

### 2. Ispezione e Pulizia dell'Albero di Lavoro (Cleanliness)
Verifica i file modificati o non tracciati:
```bash
git status
```
- Assicurati che file temporanei, file di sistema (`.DS_Store`) o dump di debug non vengano aggiunti.
- Verifica che `.gitignore` copra eventuali file generati o cache locali.

### 3. Staging e Conventional Commit
Aggiungi solo i file pertinenti e componi un messaggio secondo le convenzioni di progetto:
- `feat(ui): ...` per nuove feature visive / responsive
- `feat(logic): ...` per modifiche a dati, Dexie o store
- `fix(modal): ...` per correzioni di bug o layout
- `style(editorial): ...` per ritocchi di stile o palette
- `chore(cleanup): ...` per pulizia codice e refactoring

```bash
git add .
git commit -m "<tipo>(<scope>): <descrizione chiara e concisa>"
```

### 4. Sincronizzazione con GitHub
Esegui il push verso il repository remoto per triggerare la pipeline di deploy su Vercel:
```bash
git push origin main
```
Verifica che l'output sia `Everything up-to-date` o mostri il range di commit inviati.

### 5. Report Sintetico all'Utente
Notifica l'utente con un messaggio di massimo 2-3 righe indicando:
- Esito dei check (`oxlint` e `build` passati con successo)
- Hash e messaggio del commit
- Conferma di avvenuto push su GitHub
