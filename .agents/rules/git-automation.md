# Git & GitHub Automated Governance Rule

## Trigger di Attivazione
Al termine di **ogni modifica al codice** (nuova feature, fix, ottimizzazione grafica o refactoring):

1. **Sub-Agent Git / QA Dedicato**:
   - Assegna l'esecuzione della fase di chiusura e sincronizzazione a un sub-task gestito con profilo economico (`gemini-2.5-flash`).
2. **Standard di Controllo Obbligatori**:
   - Esegui `npx oxlint` e `npm run build` (`tsc -b && vite build`) verificando zero errori e zero warning.
   - Pulisci l'area di lavoro (nessun residuo orfano o file indesiderato).
   - Genera un commit semantico (`feat:`, `fix:`, `chore:`, `style:`).
   - Effettua sempre il `git push origin main` automatico.
3. **Efficienza Token**:
   - Mantieni il ciclo di verifica ultra-veloce, comunicando all'utente l'esito finale con il riferimento al commit inviato su GitHub.
