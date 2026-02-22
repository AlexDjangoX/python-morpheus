#!/usr/bin/env python3
"""
Build offline Polish verb → English translation dictionary from kaikki.org Wiktionary data.

Downloads pl-extract.jsonl.gz from kaikki.org, extracts verb entries with English
translations, and outputs a compact JSON file for use by the translator.

Run: python scripts/build_verb_dictionary.py [--replace]
Output: data/pl_verb_translations.json
"""
import argparse
import gzip
import json
import urllib.request
from pathlib import Path

KAIKKI_URL = "https://kaikki.org/dictionary/downloads/pl/pl-extract.jsonl.gz"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "pl_verb_translations.json"


def download_and_extract() -> dict[str, str]:
    """Stream the kaikki Polish extract and build verb→English dict."""
    translations: dict[str, str] = {}
    seen: set[tuple[str, str]] = set()  # (pl, en) to dedupe

    print("Downloading pl-extract.jsonl.gz...")
    req = urllib.request.Request(KAIKKI_URL, headers={"User-Agent": "Morpheus/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        with gzip.GzipFile(fileobj=resp) as gz:
            for i, line in enumerate(gz):
                if i > 0 and i % 50000 == 0:
                    print(f"  Processed {i} lines, {len(translations)} verbs...")
                line = line.decode("utf-8").strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if obj.get("pos") != "verb":
                    continue
                word = obj.get("word", "").strip()
                if not word or " " in word:  # skip phrases
                    continue
                for t in obj.get("translations", []):
                    if t.get("lang_code") == "en":
                        en = t.get("word", "").strip()
                        if not en:
                            continue
                        if (word, en) in seen:
                            continue
                        seen.add((word, en))
                        if en.lower().startswith("to "):
                            translations[word] = en
                        else:
                            translations[word] = f"to {en}"
                        break  # first English translation per sense

    return translations


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--replace", action="store_true", help="Replace dict; do not merge with existing")
    args = parser.parse_args()

    Path(OUTPUT_PATH).parent.mkdir(parents=True, exist_ok=True)
    merged = {} if args.replace else {}
    if OUTPUT_PATH.exists() and not args.replace:
        with open(OUTPUT_PATH, encoding="utf-8") as f:
            merged = json.load(f)
        print(f"Loaded {len(merged):,} entries from existing dictionary.")

    new = download_and_extract()
    merged.update(new)
    print(f"Extracted {len(new):,} verbs from kaikki. Total: {len(merged):,}")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(merged.items())), f, ensure_ascii=False, indent=2)
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
