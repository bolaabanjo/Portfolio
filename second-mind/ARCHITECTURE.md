# Second Mind — Architecture

A personal AI-powered study and research system. Built for one user, runs on a local laptop, costs nothing.

---

## Overview

```
┌──────────────────────────────────────────────────────┐
│                    Your Mac / Phone                   │
│              http://banjo:3000 (browser)              │
└──────────────────────┬───────────────────────────────┘
                       │ local WiFi
┌──────────────────────▼───────────────────────────────┐
│              "Banjo" — HP EliteBook 1030 G1           │
│              Docker Desktop (Windows 11 Pro)          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Next.js App (Port 3000)             │ │
│  │         Frontend + API Routes + Workers          │ │
│  │                                                   │ │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │ │
│  │  │ Ingestion │ │  Study    │ │   Research    │  │ │
│  │  │ Pipeline  │ │  Engine   │ │   & Writing   │  │ │
│  │  └─────┬─────┘ └─────┬─────┘ └──────┬────────┘  │ │
│  │        │             │               │            │ │
│  │  ┌─────▼─────────────▼───────────────▼────────┐  │ │
│  │  │            Model Router                     │  │ │
│  │  │      (routes all AI through Cencori)        │  │ │
│  │  └─────────────────┬──────────────────────────┘  │ │
│  └────────────────────│──────────────────────────────┘ │
│                       │                                 │
│  ┌────────────────────▼──────────────────────────────┐ │
│  │              Postgres + pgvector                   │ │
│  │     structured data, metadata, vector search      │ │
│  │                  (Port 5432)                       │ │
│  └───────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │ internet (only when available)
┌──────────────────────▼───────────────────────────────┐
│                    Cencori API                        │
│            Gemini 2.5 Pro (free tier)                │
│         → Claude (when budget allows)                │
└──────────────────────────────────────────────────────┘
```

---

## Design Principles

1. **Offline-first** — everything works without internet except AI calls
2. **Zero cost** — no cloud servers, no paid services, runs on idle hardware
3. **Single user** — no auth, no multi-tenancy, no overhead
4. **One container** — Next.js handles frontend, API, and background work
5. **Model-agnostic** — swap AI providers with a config change via Cencori
6. **Local network only** — accessed from devices on the same WiFi

---

## Hardware

| Spec | Value |
|------|-------|
| Machine | HP EliteBook 1030 G1 ("Banjo") |
| CPU | Intel Core m7-6Y75 (2 cores, 1.2GHz) |
| RAM | 16GB |
| Storage | 238GB (90GB free) |
| GPU | Intel HD 515 (128MB — not used) |
| OS | Windows 11 Pro + Docker Desktop |
| Network | Local WiFi (internet optional) |

**What the hardware handles:** database, file parsing, serving the app, text processing.
**What it does NOT handle:** model inference, embedding generation — all offloaded to Cencori.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| App framework | Next.js 15 (App Router) | Full-stack in one, SSR + API routes |
| Language | TypeScript | End-to-end type safety |
| Database | Postgres + pgvector | One DB for everything — structured data + vector search |
| Job queue | BullMQ + Redis (later) | For async ingestion; start with synchronous processing |
| Editor | Tiptap | Rich text, markdown support, extensible |
| AI routing | Cencori API | Model-agnostic, routes to Gemini/Claude |
| PDF parsing | pdf-parse | Lightweight, runs on CPU |
| Containerization | Docker Compose | One command to start everything |
| Domain (later) | study.bolabanjo.xyz | Subdomain of portfolio, Cloudflare tunnel |

---

## Database Schema (Postgres + pgvector)

One database. No graph DB for now — use relational joins and arrays. Add Neo4j only if needed later.

```sql
-- Sources: everything you ingest
CREATE TABLE sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  type          TEXT NOT NULL,  -- 'pdf', 'url', 'note', 'youtube'
  file_path     TEXT,           -- local file path if applicable
  url           TEXT,           -- original URL if applicable
  summary       TEXT,           -- AI-generated summary
  raw_text      TEXT,           -- full extracted text
  ingested_at   TIMESTAMPTZ DEFAULT now()
);

-- Chunks: semantic pieces of a source
CREATE TABLE chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID REFERENCES sources(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  position      INT,            -- order within source
  embedding     vector(768),    -- pgvector embedding
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Concepts: extracted knowledge nodes
CREATE TABLE concepts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  description   TEXT,
  domain        TEXT,           -- 'physics', 'cs', 'engineering', etc.
  understanding INT DEFAULT 1,  -- 1-5 depth score
  last_tested   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Concept relationships
CREATE TABLE concept_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id       UUID REFERENCES concepts(id) ON DELETE CASCADE,
  to_id         UUID REFERENCES concepts(id) ON DELETE CASCADE,
  relation      TEXT NOT NULL,  -- 'depends_on', 'related_to', 'contradicts'
  UNIQUE(from_id, to_id, relation)
);

-- Concept ↔ Chunk mapping
CREATE TABLE concept_chunks (
  concept_id    UUID REFERENCES concepts(id) ON DELETE CASCADE,
  chunk_id      UUID REFERENCES chunks(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, chunk_id)
);

-- Research threads
CREATE TABLE threads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  question      TEXT,           -- the driving research question
  status        TEXT DEFAULT 'active',  -- 'active', 'paused', 'completed'
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Thread ↔ Source mapping
CREATE TABLE thread_sources (
  thread_id     UUID REFERENCES threads(id) ON DELETE CASCADE,
  source_id     UUID REFERENCES sources(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, source_id)
);

-- Study sessions
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode          TEXT NOT NULL,  -- 'socratic', 'feynman', 'review'
  concept_id    UUID REFERENCES concepts(id),
  thread_id     UUID REFERENCES threads(id),
  messages      JSONB,          -- full conversation history
  score         INT,            -- understanding score after session
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Notes / writing drafts
CREATE TABLE notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID REFERENCES threads(id),
  title         TEXT,
  content       TEXT,           -- markdown/rich text
  type          TEXT DEFAULT 'note',  -- 'note', 'draft', 'thesis'
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Vector search index
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Project Structure

```
second-mind/
├── docker-compose.yml          -- Postgres + app
├── Dockerfile                  -- Next.js app container
├── .env.local                  -- Cencori API key, DB connection
│
├── src/
│   ├── app/                    -- Next.js App Router
│   │   ├── page.tsx            -- Dashboard: recent activity, quick actions
│   │   ├── library/
│   │   │   └── page.tsx        -- All ingested sources, search
│   │   ├── study/
│   │   │   ├── page.tsx        -- Pick a mode + concept
│   │   │   └── [id]/
│   │   │       └── page.tsx    -- Active study session (chat)
│   │   ├── research/
│   │   │   ├── page.tsx        -- All threads
│   │   │   └── [id]/
│   │   │       └── page.tsx    -- Thread workspace
│   │   ├── write/
│   │   │   ├── page.tsx        -- All drafts
│   │   │   └── [id]/
│   │   │       └── page.tsx    -- Writing editor
│   │   ├── graph/
│   │   │   └── page.tsx        -- Knowledge graph visualization
│   │   └── api/
│   │       ├── ingest/
│   │       │   └── route.ts    -- File upload + processing
│   │       ├── chat/
│   │       │   └── route.ts    -- Streaming AI chat
│   │       ├── search/
│   │       │   └── route.ts    -- Semantic search
│   │       ├── concepts/
│   │       │   └── route.ts    -- CRUD concepts
│   │       └── threads/
│   │           └── route.ts    -- CRUD threads
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── router.ts       -- Routes all calls through Cencori
│   │   │   ├── prompts.ts      -- System prompts for each mode
│   │   │   └── types.ts        -- Shared AI types
│   │   ├── ingestion/
│   │   │   ├── index.ts        -- Orchestrator: parse → chunk → embed → store
│   │   │   ├── parsers/
│   │   │   │   ├── pdf.ts      -- PDF text extraction
│   │   │   │   ├── url.ts      -- Web page extraction
│   │   │   │   ├── markdown.ts -- Raw markdown/notes
│   │   │   │   └── youtube.ts  -- Transcript extraction
│   │   │   ├── chunker.ts      -- Semantic chunking
│   │   │   └── concepts.ts     -- Extract concepts via AI
│   │   ├── study/
│   │   │   ├── socratic.ts     -- Socratic dialogue logic
│   │   │   ├── feynman.ts      -- Explain-and-critique logic
│   │   │   └── scheduler.ts    -- What to review next (spaced repetition)
│   │   ├── research/
│   │   │   ├── threads.ts      -- Thread management
│   │   │   ├── literature.ts   -- Cross-source analysis
│   │   │   └── gaps.ts         -- Identify what's missing
│   │   ├── writing/
│   │   │   ├── critique.ts     -- Check writing against sources
│   │   │   └── citations.ts    -- Auto-cite from ingested material
│   │   └── db/
│   │       ├── client.ts       -- Postgres connection (pg or drizzle)
│   │       ├── queries.ts      -- Common queries
│   │       └── vector.ts       -- pgvector search helpers
│   │
│   └── components/
│       ├── chat/               -- Chat interface (streaming)
│       ├── editor/             -- Tiptap writing editor
│       ├── upload/             -- Drag-and-drop file upload
│       ├── graph/              -- Knowledge graph viz (d3 or cytoscape)
│       └── ui/                 -- Shared UI components
│
├── uploads/                    -- Ingested files stored locally
└── scripts/
    └── seed.ts                 -- Optional: seed DB with initial data
```

---

## Model Router

All AI calls go through one function. Cencori handles which model is used.

```ts
// lib/ai/router.ts

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatOptions {
  stream?: boolean
  temperature?: number
  maxTokens?: number
}

interface EmbeddingResult {
  embedding: number[]
}

const CENCORI_BASE = process.env.CENCORI_API_URL

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string | ReadableStream> {
  const res = await fetch(`${CENCORI_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.CENCORI_API_KEY}`,
    },
    body: JSON.stringify({ messages, ...options }),
  })

  if (options.stream) return res.body as ReadableStream
  const data = await res.json()
  return data.content
}

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${CENCORI_BASE}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.CENCORI_API_KEY}`,
    },
    body: JSON.stringify({ text }),
  })

  const data = await res.json()
  return data.embedding
}
```

---

## Ingestion Flow

```
User drops a file or pastes a URL
        │
        ▼
   [Parse to text]
   pdf.ts / url.ts / markdown.ts / youtube.ts
        │
        ▼
   [Smart chunking]
   Split by semantic boundaries (paragraphs, sections, proofs)
   Each chunk: 200-500 words
        │
        ▼
   [Generate embeddings]          ← requires internet (Cencori)
   Each chunk → vector via Cencori embed API
        │
        ▼
   [Extract concepts]             ← requires internet (Cencori)
   AI identifies key concepts + relationships
        │
        ▼
   [Store everything]
   source → sources table
   chunks + embeddings → chunks table
   concepts → concepts table
   links → concept_links table
        │
        ▼
   Done. Searchable + connected to knowledge graph.
```

**Offline behavior:** Parsing and chunking work without internet. Embeddings and concept extraction are queued and processed when internet returns.

---

## Study Modes

### Socratic Dialogue

System prompt:
```
You are a rigorous but patient tutor. Your job is to test deep
understanding through questioning — never give answers directly.

Strategy:
1. Start with a foundational question about the concept
2. Based on the response, probe deeper or redirect
3. Use edge cases, counterexamples, and "what if" scenarios
4. If the student is stuck, guide with smaller questions
5. After 5-8 exchanges, assess understanding (1-5)

You have access to the student's source material. Reference
specific passages when relevant.
```

### Feynman Mode

```
The student will explain a concept in their own words.
Your job is to evaluate their explanation against the source
material and identify:

1. What they got right (briefly)
2. What's oversimplified (with the missing nuance)
3. What's outright wrong (with corrections from sources)
4. What's missing (key aspects they didn't mention)

Be specific. Cite the source material. Don't be generic.
```

### Understanding Levels

```
1 — Recognition:  "I've seen this term before"
2 — Definition:   "I can define it accurately"
3 — Application:  "I can use it to solve standard problems"
4 — Transfer:     "I can apply it in novel contexts"
5 — Teaching:     "I can explain it clearly and handle edge cases"
```

---

## Offline vs Online Features

| Feature | Offline | Online (needs Cencori) |
|---------|---------|----------------------|
| Browse sources | Yes | — |
| Read notes | Yes | — |
| Search (keyword) | Yes | — |
| Search (semantic) | Cached results only | Full vector search |
| Write/edit drafts | Yes | — |
| View knowledge graph | Yes | — |
| Ingest: parse + chunk | Yes | — |
| Ingest: embed + concepts | Queued | Yes |
| Socratic dialogue | — | Yes |
| Feynman mode | — | Yes |
| Writing critique | — | Yes |
| Literature analysis | — | Yes |

---

## Docker Setup

```yaml
# docker-compose.yml

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: secondmind
      POSTGRES_PASSWORD: secondmind
      POSTGRES_DB: secondmind
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://secondmind:secondmind@db:5432/secondmind
      CENCORI_API_URL: ${CENCORI_API_URL}
      CENCORI_API_KEY: ${CENCORI_API_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped

volumes:
  pgdata:
```

**Start:** `docker compose up -d`
**Access:** `http://banjo:3000` from any device on your WiFi

---

## Domain Setup (Later)

When ready for `study.bolabanjo.xyz`:

1. Add DNS record: `study.bolabanjo.xyz` → Cloudflare Tunnel
2. Install `cloudflared` on Banjo
3. Create tunnel: `cloudflared tunnel create second-mind`
4. Route: `study.bolabanjo.xyz` → `localhost:3000`

Free. No static IP needed. Works behind any router.

---

## Build Phases

### Phase 1 — Foundation
- [ ] Scaffold Next.js project
- [ ] Docker Compose with Postgres + pgvector
- [ ] Database schema + migrations
- [ ] Model router (Cencori integration)
- [ ] Basic dashboard UI

### Phase 2 — Ingestion
- [ ] PDF parser
- [ ] URL parser
- [ ] Markdown/note input
- [ ] Semantic chunking
- [ ] Embedding generation via Cencori
- [ ] Concept extraction via Cencori
- [ ] Offline queue for AI-dependent steps
- [ ] Source library page (browse, search)

### Phase 3 — Study
- [ ] Chat interface with streaming
- [ ] Socratic dialogue mode
- [ ] Feynman mode
- [ ] Understanding tracker (scoring per concept)
- [ ] Spaced repetition scheduler ("what to review today")

### Phase 4 — Research & Writing
- [ ] Research threads
- [ ] Cross-source analysis ("these papers agree/disagree on X")
- [ ] Gap identification
- [ ] Writing editor (Tiptap)
- [ ] AI critique against your sources
- [ ] Auto-citation

### Phase 5 — Graph & Polish
- [ ] Knowledge graph visualization
- [ ] Concept dependency mapping
- [ ] study.bolabanjo.xyz domain setup
- [ ] Mobile-friendly UI
- [ ] YouTube transcript ingestion
