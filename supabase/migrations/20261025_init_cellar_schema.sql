-- ==============================================================================
-- Cellar Database Schema Migration (supabase-architect)
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Custom Enumerations
DO $$ BEGIN
    CREATE TYPE wine_category AS ENUM ('red', 'white', 'sparkling', 'rose', 'orange', 'dessert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE drinking_status AS ENUM ('aging', 'ready', 'peak', 'past');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    cellar_name TEXT DEFAULT 'La mia Cantina',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile upon new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Wines Table
CREATE TABLE IF NOT EXISTS public.wines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    producer TEXT NOT NULL,
    vintage INTEGER NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    appellation TEXT,
    sub_category TEXT,
    category wine_category NOT NULL,
    grapes TEXT[] DEFAULT '{}'::text[],
    alcohol NUMERIC(4,2),
    bottle_size TEXT DEFAULT '750ml',
    price NUMERIC(10,2),
    stock INTEGER NOT NULL DEFAULT 1,
    favorite BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    purchase_channel TEXT,
    drinking_status drinking_status NOT NULL DEFAULT 'ready',
    drinking_window_start INTEGER,
    drinking_window_end INTEGER,
    drinking_window_peak INTEGER,
    ai_calculated BOOLEAN DEFAULT false,
    ai_details TEXT,
    tasting_notes JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    image_url TEXT,
    embedding vector(768), -- For AI Sommelier semantic RAG search
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Uncorked History Table
CREATE TABLE IF NOT EXISTS public.uncorked_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wine_id UUID REFERENCES public.wines(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    uncorked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    rating NUMERIC(3,1),
    occasion TEXT,
    pairing_notes TEXT
);

-- 6. Trigger for updated_at on wines
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_wines_updated_at ON public.wines;
CREATE TRIGGER set_wines_updated_at
    BEFORE UPDATE ON public.wines
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. High Performance Indices
CREATE INDEX IF NOT EXISTS idx_wines_user_id ON public.wines(user_id);
CREATE INDEX IF NOT EXISTS idx_wines_category ON public.wines(category);
CREATE INDEX IF NOT EXISTS idx_wines_vintage ON public.wines(vintage);
CREATE INDEX IF NOT EXISTS idx_wines_drinking_status ON public.wines(drinking_status);
CREATE INDEX IF NOT EXISTS idx_uncorked_user_id ON public.uncorked_history(user_id);

-- HNSW Vector Index for Instant Sommelier Similarity Matching
CREATE INDEX IF NOT EXISTS idx_wines_embedding_hnsw 
ON public.wines USING hnsw (embedding vector_cosine_ops);

-- 8. Row-Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uncorked_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Gli utenti possono visualizzare il proprio profilo" ON public.profiles;
CREATE POLICY "Gli utenti possono visualizzare il proprio profilo"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Gli utenti possono aggiornare il proprio profilo" ON public.profiles;
CREATE POLICY "Gli utenti possono aggiornare il proprio profilo"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Wines Policies
DROP POLICY IF EXISTS "Gli utenti gestiscono solo i propri vini" ON public.wines;
CREATE POLICY "Gli utenti gestiscono solo i propri vini"
ON public.wines FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Uncorked History Policies
DROP POLICY IF EXISTS "Gli utenti gestiscono la propria cronologia stappate" ON public.uncorked_history;
CREATE POLICY "Gli utenti gestiscono la propria cronologia stappate"
ON public.uncorked_history FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Sommelier RPC Helper (Semantic Wine Recommendation Function)
CREATE OR REPLACE FUNCTION match_wines (
    query_embedding vector(768),
    match_threshold float DEFAULT 0.6,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    producer TEXT,
    vintage INTEGER,
    category wine_category,
    region TEXT,
    stock INTEGER,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.name,
        w.producer,
        w.vintage,
        w.category,
        w.region,
        w.stock,
        1 - (w.embedding <=> query_embedding) AS similarity
    FROM public.wines w
    WHERE w.user_id = auth.uid()
      AND w.stock > 0
      AND 1 - (w.embedding <=> query_embedding) > match_threshold
    ORDER BY w.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
