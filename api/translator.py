"""
Polish → English verb translation.

Two-tier lookup for scalability to all Polish verbs:
1. Local dictionary (data/pl_verb_translations.json) - 3k+ verbs from Wiktionary, O(1), offline
2. MyMemory API fallback - for verbs not in dictionary, covers rare/neologisms

Run scripts/build_verb_dictionary.py to refresh/expand the local dictionary from kaikki.org.
"""
import json
import urllib.parse
import urllib.request
from pathlib import Path

def _find_dict_path() -> Path:
    """Resolve dictionary path - works when run from project root or morpheus subdir."""
    base = Path(__file__).resolve().parent.parent
    candidates = [
        base / "data" / "pl_verb_translations.json",
        Path.cwd() / "data" / "pl_verb_translations.json",
        Path.cwd() / "morpheus" / "data" / "pl_verb_translations.json",
    ]
    for p in candidates:
        if p.exists():
            return p
    return candidates[0]


MYMEMORY_URL = "https://api.mymemory.translated.net/get"

_dict_cache: dict[str, str] | None = None
_dict_path: Path | None = None


def _load_dict() -> dict[str, str]:
    """Load the local verb dictionary (cached)."""
    global _dict_cache, _dict_path
    if _dict_cache is None:
        _dict_path = _find_dict_path()
        if _dict_path.exists():
            with open(_dict_path, encoding="utf-8") as f:
                _dict_cache = json.load(f)
        else:
            _dict_cache = {}
    return _dict_cache


def _translate_via_api(text: str) -> str | None:
    """Fallback: MyMemory API when verb not in local dictionary."""
    try:
        params = urllib.parse.urlencode({"q": text, "langpair": "pl|en"})
        req = urllib.request.Request(
            f"{MYMEMORY_URL}?{params}",
            headers={"User-Agent": "Morpheus-Conjugator/1.0"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        if result.get("responseStatus") != 200:
            return None
        translated = result.get("responseData", {}).get("translatedText", "").strip()
        if not translated or translated == text:
            return None
        return f"to {translated}" if not translated.lower().startswith("to ") else translated
    except Exception:
        return None


def translate_pl_to_en(polish_text: str, use_api_fallback: bool = True) -> str | None:
    """
    Translate Polish verb to English.

    Lookup order: local dictionary (offline) → MyMemory API (if use_api_fallback).
    Returns "to X" form, or None if not found.
    """
    text = polish_text.strip()
    if not text:
        return None
    d = _load_dict()
    result = d.get(text)
    if result:
        return result if result.lower().startswith("to ") else f"to {result}"
    if use_api_fallback:
        return _translate_via_api(text)
    return None
