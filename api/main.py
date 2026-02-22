"""
FastAPI backend for Polish verb conjugation.
Exposes REST endpoint that returns conjugation JSON for the Next.js frontend.
Uses MyMemory API for automatic English translation when not provided.

Run from morpheus root: uvicorn api.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from conjugator import generate_conjugation
from api.translator import translate_pl_to_en


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Polish Verb Conjugation API",
    description="REST API for conjugating Polish verbs using Morfeusz2",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/conjugate")
async def conjugate(
    verb: str = Query(..., description="Polish verb in infinitive form (e.g. gładzić)"),
    english: str | None = Query(None, description="English translation (e.g. 'to stroke')"),
    aspect: str | None = Query(None, description="Aspect override: niedokonany or dokonany"),
) -> dict:
    """
    Conjugate a Polish verb in infinitive form.
    Returns the full conjugation object matching the JSON structure.
    When english is not provided, fetches translation from MyMemory API.
    """
    verb_clean = verb.strip()
    english_input = (english or "").strip()
    english_val = None
    # Use user's English only if it's valid (not the Polish verb, not Polish text)
    if english_input and english_input.lower() != verb_clean.lower():
        polish_chars = "ąćęłńóśźż"
        if not any(c in english_input.lower() for c in polish_chars):
            english_val = english_input if english_input.lower().startswith("to ") else f"to {english_input}"
    if english_val is None:
        translated = translate_pl_to_en(verb_clean)
        english_val = translated if translated else None

    # Never pass Polish verb as English - conjugator will fix, but avoid extra lookup
    if english_val:
        en_stem = english_val.lower().replace("to ", "").strip()
        if en_stem == verb_clean.lower():
            english_val = translate_pl_to_en(verb_clean) or None

    try:
        data = generate_conjugation(verb_clean, english_val, aspect)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/verbs")
async def list_verbs() -> dict[str, str]:
    """Return Polish verb → English translation dict for dropdown."""
    import json
    from pathlib import Path
    path = Path(__file__).resolve().parent.parent / "data" / "pl_verb_translations.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}


@app.get("/health")
async def health():
    return {"status": "ok"}
