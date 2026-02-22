# Polish Verb Conjugator

Educational Polish language learning platform with a Python backend (Morfeusz2) and Next.js frontend.

## Structure

- **`conjugator.py`** – Core conjugation logic using Morfeusz2
- **`api/`** – FastAPI REST backend
- **`frontend/`** – Next.js React app
- **`data/pl_verb_translations.json`** – Polish verb → English dictionary (3k+ verbs)

## English translations (scalable)

Two-tier lookup for all Polish verbs:

1. **Local dictionary** – `data/pl_verb_translations.json` (3k+ verbs from Wiktionary). O(1) lookup, fully offline.
2. **MyMemory API fallback** – For verbs not in the dictionary (rare words, neologisms).

To refresh or expand the dictionary from Wiktionary:

```bash
python scripts/build_verb_dictionary.py        # merge with existing
python scripts/build_verb_dictionary.py --replace   # fresh extract
```

Downloads ~121MB from kaikki.org, extracts all Polish verbs with English translations. Run periodically to stay current.

## Setup

### Backend

```bash
cd morpheus
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:3000 and calls the API at http://localhost:8000.

### Environment (optional)

Create `frontend/.env.local` to override the API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API

**GET** `/api/conjugate?verb={infinitive}&english={optional}&aspect={optional}`

Returns the full conjugation JSON object.

Example: `GET /api/conjugate?verb=gładzić&english=to%20stroke`
# python-morpheus
