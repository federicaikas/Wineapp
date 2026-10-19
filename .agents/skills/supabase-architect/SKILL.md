---
name: supabase-architect
description: Architectural guidelines and best practices for Supabase back-end integration in Cellar. Covers PostgreSQL schemas, Row-Level Security (RLS) multi-tenancy, pgvector semantic search for AI Sommelier, and TypeScript type generation.
---

# Supabase Architect Skill

Questa skill guida la progettazione e implementazione del back-end **Supabase** per l'applicazione **Cellar**.

---

## 1. Principi Architetturali
- **Database Relazionale Robusto**: PostgreSQL con chiavi esterne, vincoli di integrità e indici su campi frequenti (`user_id`, `category`, `vintage`, `drinking_status`).
- **Zero-Trust Multi-Tenancy**: Ogni tabella con dati personali dell'utente **deve** avere la Row-Level Security (RLS) abilitata con politiche rigorose basate su `auth.uid() = user_id`.
- **Tipo-Sicurezza End-to-End**: Sincronizzazione automatica degli schemi del DB nei modelli TypeScript (`types/database.types.ts`).

---

## 2. Schema di Riferimento per le Tabelle Principali

### Tabella `profiles` (Estensione di `auth.users`)
- `id` (uuid, PK, references `auth.users.id` on delete cascade)
- `email` (text)
- `full_name` (text)
- `cellar_name` (text, default 'La mia Cantina')
- `created_at` (timestamptz)

### Tabella `wines`
- `id` (uuid, PK, default `gen_random_uuid()`)
- `user_id` (uuid, FK references `profiles.id`, not null)
- `name` (text, not null)
- `producer` (text, not null)
- `vintage` (int, not null)
- `country` (text, not null)
- `region` (text, not null)
- `appellation` (text)
- `sub_category` (text)
- `category` (enum wine_category: red, white, sparkling, rose, orange, dessert)
- `grapes` (text[])
- `alcohol` (numeric)
- `bottle_size` (text, default '750ml')
- `price` (numeric)
- `stock` (int, default 1)
- `favorite` (boolean, default false)
- `location` (text)
- `purchase_channel` (text)
- `drinking_status` (enum: aging, ready, peak, past)
- `drinking_window_start` (int)
- `drinking_window_end` (int)
- `drinking_window_peak` (int)
- `ai_calculated` (boolean)
- `ai_details` (text)
- `tasting_notes` (jsonb)
- `notes` (text)
- `image_url` (text)
- `embedding` (vector(768)) -- Generato per la ricerca semantica con AI Sommelier
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### Tabella `uncorked_history`
- `id` (uuid, PK)
- `wine_id` (uuid, FK references `wines.id`)
- `user_id` (uuid, FK references `profiles.id`)
- `uncorked_at` (timestamptz, default now())
- `rating` (numeric)
- `occasion` (text)
- `pairing_notes` (text)

---

## 3. Politiche RLS Obbligatorie
Ogni tabella utente deve applicare:
```sql
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti gestiscono solo i propri vini"
ON wines
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 4. Estensione pgvector per Sommelier AI
Per abilitare l'abbinamento cibo-vino intelligente:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Indice HNSW per ricerche istantanee sui vini della cantina utente
CREATE INDEX ON wines USING hnsw (embedding vector_cosine_ops);
```

---

## 5. Convenzioni Client & Migrazioni
- Mantieni tutte le migrazioni SQL in `supabase/migrations/`.
- Usa il client singleton `@supabase/supabase-js` configurato tramite variabili d'ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Genera i tipi TypeScript con il comando `npx supabase gen types typescript --project-id <id> > src/types/database.types.ts`.
