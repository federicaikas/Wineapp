---
name: ai-multimodal-extractor
description: Guidelines and patterns for multimodal AI vision bottle label recognition, structured wine data extraction, and AI Sommelier conversational pairing using Gemini and Vercel AI SDK.
---

# AI Multimodal Extractor & Sommelier Skill

Questa skill definisce le linee guida per implementare il riconoscimento ottico multimodale da foto dell'etichetta e l'agente sommelier personale per **Cellar**.

---

## 1. Riconoscimento Etichette da Foto (Vision to JSON)

### Strategia di Elaborazione
1. **Pre-elaborazione Client**:
   - Ridimensiona l'immagine scattata da smartphone a una risoluzione ottimale (max 1600px lato lungo) e convertila in formato WebP prima del caricamento.
   - Riduce la latenza di rete dell'85% e azzera il consumo di banda.
2. **Chiamata Modello Multimodale**:
   - Modello raccomandato: **Gemini 2.5 Flash** (oppure Gemini 1.5 Flash).
   - Modalità: `response_schema` rigido (JSON Mode o schema Zod).
3. **Campi Estratti dall'Etichetta**:
   - `name`: Nome del vino / cru (es. "Barolo Monfortino")
   - `producer`: Produttore o cantina
   - `vintage`: Anno di vendemmia (numero intero a 4 cifre; fallback su anno corrente se non visibile)
   - `country`: Codice paese ISO 2 caratteri (IT, FR, ES, ecc.)
   - `region`: Regione di produzione (es. "Piemonte")
   - `appellation`: Denominazione di origine (DOCG, DOC, IGT, AOC, Gran Cru)
   - `category`: Categoria vinicola ('red', 'white', 'sparkling', 'rose', 'orange', 'dessert')
   - `grapes`: Array di vitigni principali (es. ["Nebbiolo"])
   - `alcohol`: Percentuale gradazione alcolica stimata o letta (es. 14.5)
   - `confidence`: Livello di affidabilità dell'estrazione (0.0 - 1.0)

### Strategia di Fallback
Se l'immagine è sfocata o l'etichetta è parziale:
- Estrai il testo leggibile grezzo.
- Esegui una rapida query di arricchimento online sui primi 3 risultati di ricerca per recuperare le informazioni mancanti.
- Contrassegna i campi incerti affinché l'utente possa convalidarli al primo tocco nel drawer.

---

## 2. Agente AI Sommelier per Abbinamenti Cibo-Vino

### Architettura RAG su Cantina Utente
1. **Generazione Embedding**:
   - Ogni bottiglia nella cantina dell'utente ha una stringa descrittiva (es. *"Barolo 2016, Nebbiolo, tannico, note di tartufo e ciliegia, ideale per brasati e carni rosse"*).
   - Questa stringa viene convertita in un vettore tramite un modello di embedding (`text-embedding-004`).
2. **Query dell'Utente**:
   - L'utente scrive o detta a voce: *"Cosa bevo stasera con spaghetti alle vongole e bottarga?"*.
   - Il vettore del piatto viene confrontato tramite cosine similarity con i soli vini dell'utente con giacenza `stock > 0`.
3. **Generazione Risposta con Streaming**:
   - Il sommelier seleziona da 1 a 3 bottiglie ideali della cantina reale dell'utente.
   - Fornisce motivazione sommelier (equilibrio tra grassezza/acidità, temperatura di servizio e se serve decantare).
