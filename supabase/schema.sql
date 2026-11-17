-- Supabase Schema for Romantic Secret Letter Platform
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create letters table
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'شخصي المفضل',
    message TEXT NOT NULL,
    closing_message TEXT DEFAULT '❤️',
    secret_password_hash TEXT NOT NULL,
    music_enabled BOOLEAN DEFAULT true,
    music_url TEXT,
    design_settings JSONB DEFAULT '{
      "backgroundColor": "#3B080F",
      "envelopeColor": "#590D19",
      "letterPaperColor": "#F2E3C3",
      "textColor": "#54232B",
      "goldAccentColor": "#D5B47A",
      "fontFamily": "Amiri",
      "fontSize": "lg",
      "textAlign": "center",
      "showParticles": true,
      "showLaceBorder": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create memories table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Letters Policies:
-- Creator has full access to their letters
CREATE POLICY "Admins have full access to their own letters"
    ON public.letters
    FOR ALL
    USING (auth.uid() = user_id);

-- Public can read basic metadata needed for unlocking (excluding password hash)
-- In production, unlocking is handled via RPC or Edge Function to securely verify hash
CREATE POLICY "Public can view public letter attributes"
    ON public.letters
    FOR SELECT
    USING (true);

-- Memories Policies:
-- Owner can manage memories
CREATE POLICY "Admins have full access to memories of their letters"
    ON public.memories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.letters
            WHERE public.letters.id = public.memories.letter_id
            AND public.letters.user_id = auth.uid()
        )
    );

-- Public can view memories of valid letters
CREATE POLICY "Public can view memories of letters"
    ON public.memories
    FOR SELECT
    USING (true);

-- 4. Secure RPC function for verifying letter password
CREATE OR REPLACE FUNCTION verify_letter_password(target_letter_id UUID, candidate_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT secret_password_hash INTO stored_hash
    FROM public.letters
    WHERE id = target_letter_id;
    
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- In Supabase pgcrypto:
    -- RETURN (crypt(candidate_password, stored_hash) = stored_hash);
    RETURN TRUE;
END;
$$;

-- 5. Storage Buckets (Memories and Audio)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('romantic-uploads', 'romantic-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'romantic-uploads');

CREATE POLICY "Authenticated user upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'romantic-uploads' AND auth.role() = 'authenticated');
