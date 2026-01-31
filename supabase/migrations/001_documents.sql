-- Tabulka dokumentů (metadata). Soubory jsou v Storage, embeddingy v Qdrant.
-- RLS zajišťuje, že uživatel vidí pouze své záznamy.

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pro rychlé výpisy podle uživatele (tisíce dokumentů).
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents (user_id, created_at DESC);

-- RLS: striktní izolace podle user_id (Clerk userId).
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read own documents"
  ON documents FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can only insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can only update own documents"
  ON documents FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can only delete own documents"
  ON documents FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

-- Poznámka: Při použití service_role_key RLS neplatí – v API vždy filtrujte podle user_id z Clerk.
