# Periodicals Redis Index

A small Next.js + Redis app for indexing periodicals and searching them from a React GUI. It stores each record as a Redis hash and builds an inverted index with Redis sets.

## Requirements

- Node.js 20+
- Redis running locally on `redis://127.0.0.1:6379`

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and click **Index records in Redis**.

## Data model

- `periodicals:doc:<id>` stores each periodical record as a hash.
- `periodicals:docs` stores all indexed record IDs.
- `periodicals:term:<term>` stores the document IDs that contain a term.

## API

- `POST /api/index` indexes JSON records.
- `GET /api/search?q=keyword` searches the Redis inverted index.

## Sample data

The app includes a small sample dataset modeled after a periodicals catalog so you can demo the system without extra setup.
