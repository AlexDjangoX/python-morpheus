# Polish Verb Conjugator

Educational Polish verb conjugator with a Python backend (Morfeusz2) and Next.js frontend. Enter a Polish verb infinitive and get full conjugations with English translations.

## Quick Start

From the project root:

**1. Backend (Python API)**

```bash
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000
```

**2. Frontend (Next.js)** — in a separate terminal

```bash
cd frontend
npm install
npm run dev
```

- **Frontend:** http://localhost:3000  
- **API:** http://localhost:8000  

The frontend will use the API when it's running. If the backend is down, verbs still load from the bundled `frontend/public/verbs.json`.

## Project Structure

| Path | Description |
|------|-------------|
| `conjugator.py` | Core conjugation logic using Morfeusz2 |
| `api/` | FastAPI REST backend |
| `frontend/` | Next.js React app |
| `data/pl_verb_translations.json` | Polish → English verb dictionary (3k+ verbs) |

## English Translations

Two-tier lookup:

1. **Local dictionary** — `data/pl_verb_translations.json` (offline, 3k+ verbs)
2. **MyMemory API fallback** — For verbs not in the dictionary

To refresh the dictionary from Wiktionary:

```bash
python scripts/build_verb_dictionary.py          # merge with existing
python scripts/build_verb_dictionary.py --replace # fresh extract
```

## API

**GET** `/api/conjugate?verb={infinitive}&english={optional}&aspect={optional}`

Returns the full conjugation JSON.

Example: `GET /api/conjugate?verb=gładzić&english=to%20stroke`

## Environment (optional)

Create `frontend/.env.local` to override the API URL (e.g. for production):

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```
