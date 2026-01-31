# Architektura RAG (produkční)

## Struktura složek

```
app/
  api/
    chat/           # POST – RAG chat (embed → search → prompt → stream)
      route.ts
    documents/      # Dokumenty uživatele
      route.ts      # GET – seznam dokumentů (paginace)
      upload/
        route.ts    # POST – upload PDF/DOCX/TXT → parse → chunk → embed → Qdrant + Supabase
      [id]/
        route.ts    # GET – detail dokumentu | DELETE – smazat dokument
    init/
      route.ts      # GET – vytvoření Qdrant kolekce (volat před prvním uploadem)
lib/
  chunking.ts       # Chunking 500–1000 tokenů (gpt-tokenizer)
  embeddings.ts    # OpenAI text-embedding-3-small (batch)
  file-parser.ts   # PDF (pdf-parse), DOCX (mammoth), TXT
  rag-prompt.ts    # Systémový prompt RAG + buildContext
  vector-db.ts     # Qdrant: upsertChunks, searchChunks, deleteChunksByDocumentId
  supabase/
    server.ts      # getSupabaseAdmin() – service role (pouze server)
    types.ts       # Database typy (documents tabulka)
  clerk.ts         # auth, getCurrentUserId
supabase/
  migrations/
    001_documents.sql   # Tabulka documents + RLS
types/
  pdf-parse.d.ts
```

## API routy (app/api/*)

| Metoda | Cesta | Popis | Auth |
|--------|--------|--------|------|
| POST | `/api/chat` | RAG chat: dotaz → embedding → similarity search (user_id) → prompt → stream | Guest 1×, jinak přihlášení |
| GET | `/api/documents` | Seznam dokumentů (`?limit=50&offset=0`) | Ano |
| POST | `/api/documents/upload` | Upload souboru (multipart, PDF/DOCX/TXT) | Ano |
| GET | `/api/documents/[id]` | Detail dokumentu | Ano |
| DELETE | `/api/documents/[id]` | Smazat dokument (Storage + Qdrant + Supabase) | Ano |
| GET | `/api/init` | Vytvoření Qdrant kolekce | Ne (TODO: chránit v produkci) |

## Tabulky v databázi (Supabase Postgres)

```sql
-- documents: metadata nahraných dokumentů
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- Clerk userId (izolace)
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,     -- např. userId/documentId/filename.pdf
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_user_id ON documents (user_id);
CREATE INDEX idx_documents_user_created ON documents (user_id, created_at DESC);
-- RLS: policies pro SELECT/INSERT/UPDATE/DELETE USING (auth.jwt() ->> 'sub' = user_id)
```

Soubory: **Supabase Storage** bucket `documents` (nebo `SUPABASE_BUCKET_DOCUMENTS`), cesta `{userId}/{documentId}/{filename}`.

Embeddingy: **Qdrant** kolekce `lexchat_documents`, každý bod má payload: `user_id`, `document_id`, `chunk_index`, `text`.

## Bezpečnost (izolace podle userId)

- **Supabase**: Všechny dotazy v API filtrují `user_id = userId` z Clerk. Při použití `SUPABASE_SERVICE_ROLE_KEY` RLS neplatí – filtrování je povinné v kódu.
- **Qdrant**: `searchChunks()` vždy předává `filter: { must: [{ key: "user_id", match: { value: userId } }] }`. Žádný uživatel nevidí cizí chunky.
- **Storage**: Cesta obsahuje `userId`; mazání/čtení jen po ověření vlastnictví záznamu v `documents`.

## Doporučené npm balíčky (již v projektu)

| Balíček | Účel |
|---------|------|
| `@supabase/supabase-js` | Supabase client (Postgres + Storage) |
| `@qdrant/js-client-rest` | Qdrant vektorová DB |
| `gpt-tokenizer` | Počet tokenů (cl100k_base), chunking |
| `openai` | Embeddingy (text-embedding-3-small) + chat (gpt-4o-mini) |
| `pdf-parse` | Parsování PDF |
| `mammoth` | Parsování DOCX |
| `uuid` | Generování ID dokumentů |
| `@clerk/nextjs` | Autentizace (userId na serveru) |

## Ukázkový RAG prompt

V `lib/rag-prompt.ts`:

- **Systémový prompt**: „Jsi odborný právní asistent. Odpovídej na základě výhradně níže uvedeného kontextu z nahraných dokumentů…“
- **Kontext**: Sestaven z top‑K výsledků similarity search, deduplikace, limit ~3000 tokenů.
- **Volání**: Systémová zpráva = prompt s vloženým kontextem; zbytek zpráv = historie + poslední dotaz uživatele.

## TODO (konfigurace)

- **Qdrant**: `lib/vector-db.ts` – pro velký počet dokumentů vytvořit payload index na `user_id` (viz komentář u `ensureCollection`).
- **Supabase**: V dashboardu vytvořit bucket `documents` (nebo hodnotu z `SUPABASE_BUCKET_DOCUMENTS`) a spustit migraci `supabase/migrations/001_documents.sql`.
- **Init**: `/api/init` – v produkci omezit přístup (např. pouze pro admin nebo jednorázově po deployi).
