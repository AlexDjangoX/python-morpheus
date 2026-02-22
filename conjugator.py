#!/usr/bin/env python3
"""
Polish Verb Conjugator using Morfeusz2

Generates full conjugation JSON for Polish verbs by querying Morfeusz2's SGJP
dictionary. Morfeusz2 provides fin (present), praet (past 3rd person), impt
(imperative), and inf (infinitive). We derive 1st/2nd person past and conditional
forms from the 3rd-person stems, since SGJP does not include those directly.
"""

import argparse
import json
import sys
import uuid
from typing import Any

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import morfeusz2
except ImportError:
    print("Error: morfeusz2 is required. Install with: pip install morfeusz2", file=sys.stderr)
    sys.exit(1)


# SGJP tag components (colon-separated):
# - fin = finite present/future (imperfective=present, perfective=future)
# - praet = past tense (3rd person only in SGJP)
# - cond = conditional (NOT in SGJP - we derive it)
# - impt = imperative
# - inf = infinitive
# - pact/ppas = participles
# Gender: m1/m2/m3 = masculine, f = feminine, n = neuter
# Person: pri = 1st, sec = 2nd, ter = 3rd
# Number: sg = singular, pl = plural


def _get_forms_by_tag(morf: "morfeusz2.Morfeusz", lemma: str) -> dict[str, list[tuple[str, str]]]:
    """
    Query Morfeusz2 for all inflected forms of the lemma.
    Returns a dict mapping tag patterns to list of (form, full_tag).
    SGJP tags: fin:sg:pri:imperf, praet:sg:m1.m2.m3:imperf, impt:sg:sec:imperf, inf:imperf, etc.
    """
    try:
        results = morf.generate(lemma)
    except Exception as e:
        raise RuntimeError(f"Morfeusz2 error for '{lemma}': {e}") from e

    if not results:
        raise ValueError(f"Verb '{lemma}' not found in Morfeusz2 dictionary")

    by_tag: dict[str, list[tuple[str, str]]] = {}
    for item in results:
        form = item[0]
        tag = item[2]
        parts = tag.split(":")
        if "fin" in parts or "praet" in parts or "impt" in parts or "inf" in parts:
            by_tag.setdefault(tag, []).append((form, tag))
    return by_tag


def _extract_forms(forms: dict[str, list[tuple[str, str]]]) -> dict[str, str]:
    """
    Extract conjugated forms from Morfeusz2 output.
    Maps logical keys (e.g. 'fin_sg_pri') to the actual word form.
    """
    out: dict[str, str] = {}

    for tag, items in forms.items():
        parts = tag.split(":")
        if not items:
            continue
        form = items[0][0]

        if "fin" in parts:
            # fin:sg:pri, fin:sg:sec, fin:sg:ter, fin:pl:pri, fin:pl:sec, fin:pl:ter
            if "sg" in parts:
                if "pri" in parts:
                    out["fin_sg_pri"] = form
                elif "sec" in parts:
                    out["fin_sg_sec"] = form
                elif "ter" in parts:
                    out["fin_sg_ter"] = form
            elif "pl" in parts:
                if "pri" in parts:
                    out["fin_pl_pri"] = form
                elif "sec" in parts:
                    out["fin_pl_sec"] = form
                elif "ter" in parts:
                    out["fin_pl_ter"] = form

        elif "praet" in parts:
            if "sg" in parts:
                if "m1" in tag or "m2" in tag or "m3" in tag or "m1.m2.m3" in tag:
                    out["praet_sg_m"] = form
                elif "f" in parts:
                    out["praet_sg_f"] = form
                elif "n" in parts:
                    out["praet_sg_n"] = form
            elif "pl" in parts:
                if "m1" in tag or "m1" in parts:
                    out["praet_pl_m"] = form
                elif "m2" in tag or "m3" in tag or "f" in tag or "n" in tag or "m2.m3.f.n" in tag:
                    out["praet_pl_f"] = form

        elif "impt" in parts:
            if "sg" in parts and "sec" in parts:
                out["impt_sg_sec"] = form
            elif "pl" in parts and "pri" in parts:
                out["impt_pl_pri"] = form
            elif "pl" in parts and "sec" in parts:
                out["impt_pl_sec"] = form

        elif "inf" in parts:
            out["inf"] = form

    return out


def _derive_past_stems(extracted: dict[str, str]) -> dict[str, str]:
    """
    Derive past tense stems from 3rd-person forms for 1st/2nd person.
    SGJP only provides 3rd person (on, ona, ono, oni, one).
    Polish past: stem + -łem/-łeś/-ł/-liśmy/-liście/-li (masc), -łam/-łaś/-ła/-łyśmy/-łyście/-ły (fem).
    """
    stems: dict[str, str] = {}

    # Masculine singular: gładził -> stem gładzi-
    if "praet_sg_m" in extracted:
        m = extracted["praet_sg_m"]
        if m.endswith("ł"):
            stems["masc_sg"] = m[:-1]  # remove -ł
        else:
            stems["masc_sg"] = m

    # Feminine singular: gładziła -> stem gładzi-
    if "praet_sg_f" in extracted:
        f = extracted["praet_sg_f"]
        if f.endswith("ła"):
            stems["fem_sg"] = f[:-2]  # remove -ła
        else:
            stems["fem_sg"] = f

    # Masculine plural: gładzili -> stem gładzi-
    if "praet_pl_m" in extracted:
        m = extracted["praet_pl_m"]
        if m.endswith("li"):
            stems["masc_pl"] = m[:-2]  # remove -li
        else:
            stems["masc_pl"] = m

    # Feminine plural: gładziły -> stem gładzi-
    if "praet_pl_f" in extracted:
        f = extracted["praet_pl_f"]
        if f.endswith("ły"):
            stems["fem_pl"] = f[:-2]  # remove -ły
        else:
            stems["fem_pl"] = f

    return stems


def _build_past_forms(extracted: dict[str, str], stems: dict[str, str]) -> tuple[dict[str, str], dict[str, str]]:
    """Build full past_masc and past_fem blocks with all persons."""
    past_masc: dict[str, str] = {}
    past_fem: dict[str, str] = {}

    masc_sg = stems.get("masc_sg", "")
    masc_pl = stems.get("masc_pl", masc_sg)
    fem_sg = stems.get("fem_sg", "")
    fem_pl = stems.get("fem_pl", fem_sg)

    # Masculine past
    past_masc["past_ja_masc"] = f"{masc_sg}łem" if masc_sg else "-"
    past_masc["past_ty_masc"] = f"{masc_sg}łeś" if masc_sg else "-"
    past_masc["past_on_masc"] = extracted.get("praet_sg_m", "-")
    past_masc["past_my_masc"] = f"{masc_pl}liśmy" if masc_pl else "-"
    past_masc["past_wy_masc"] = f"{masc_pl}liście" if masc_pl else "-"
    past_masc["past_oni_masc"] = extracted.get("praet_pl_m", "-")

    # Feminine past
    past_fem["past_ja_fem"] = f"{fem_sg}łam" if fem_sg else "-"
    past_fem["past_ty_fem"] = f"{fem_sg}łaś" if fem_sg else "-"
    past_fem["past_ona_fem"] = extracted.get("praet_sg_f", "-")
    past_fem["past_my_fem"] = f"{fem_pl}łyśmy" if fem_pl else "-"
    past_fem["past_wy_fem"] = f"{fem_pl}łyście" if fem_pl else "-"
    past_fem["past_one_fem"] = extracted.get("praet_pl_f", "-")

    return past_masc, past_fem


def _build_conditional_forms(extracted: dict[str, str], stems: dict[str, str]) -> tuple[dict[str, str], dict[str, str]]:
    """Build conditional_masculine and conditional_feminine from past stems."""
    cond_masc: dict[str, str] = {}
    cond_fem: dict[str, str] = {}

    masc_sg = stems.get("masc_sg", "")
    masc_pl = stems.get("masc_pl", masc_sg)
    fem_sg = stems.get("fem_sg", "")
    fem_pl = stems.get("fem_pl", fem_sg)

    # Conditional masculine: stem+łbym, stem+łbyś, stem+łby, stem+libyśmy, stem+libyście, stem+liby
    cond_masc["conditional_masculine_ja"] = f"{masc_sg}łbym" if masc_sg else "-"
    cond_masc["conditional_masculine_ty"] = f"{masc_sg}łbyś" if masc_sg else "-"
    cond_masc["conditional_masculine_on"] = f"{masc_sg}łby" if masc_sg else "-"
    cond_masc["conditional_masculine_my"] = f"{masc_pl}libyśmy" if masc_pl else "-"
    cond_masc["conditional_masculine_wy"] = f"{masc_pl}libyście" if masc_pl else "-"
    cond_masc["conditional_masculine_oni"] = f"{masc_pl}liby" if masc_pl else "-"

    # Conditional feminine
    cond_fem["conditional_feminine_ja"] = f"{fem_sg}łabym" if fem_sg else "-"
    cond_fem["conditional_feminine_ty"] = f"{fem_sg}łabyś" if fem_sg else "-"
    cond_fem["conditional_feminine_ona"] = f"{fem_sg}łaby" if fem_sg else "-"
    cond_fem["conditional_feminine_my"] = f"{fem_pl}łybyśmy" if fem_pl else "-"
    cond_fem["conditional_feminine_wy"] = f"{fem_pl}łybyście" if fem_pl else "-"
    cond_fem["conditional_feminine_one"] = f"{fem_pl}łyby" if fem_pl else "-"

    return cond_masc, cond_fem


def _get_aspect_from_forms(forms: dict[str, list[tuple[str, str]]]) -> str:
    """Detect aspect (imperf/dokonany vs perf/niedokonany) from tags."""
    for tag in forms:
        if "imperf" in tag:
            return "Niedokonany"
        if "perf" in tag:
            return "Dokonany"
    return "Niedokonany"  # default


def _english_verb_stem(english: str) -> str:
    """Extract verb stem from 'to stroke' -> 'stroke'."""
    s = english.strip()
    if s.lower().startswith("to "):
        return s[3:].strip()
    return s


def _english_past(verb_stem: str) -> str:
    """Simple past form: stroke -> stroked. Handles common irregulars."""
    irregular = {
        "go": "went", "eat": "ate", "write": "wrote", "do": "did", "make": "made",
        "see": "saw", "take": "took", "come": "came", "get": "got", "give": "gave",
        "know": "knew", "think": "thought", "say": "said", "find": "found",
    }
    v = verb_stem.lower()
    if v in irregular:
        return irregular[v]
    if v.endswith("e"):
        return v + "d"
    if v.endswith("y") and v[-2] not in "aeiou":
        return v[:-1] + "ied"
    if len(v) > 1 and v[-1] == v[-2] and v[-1] in "bcdfgklmnprst":
        return v + "ed"
    return v + "ed"


def _add_english_translations(
    data: dict[str, Any],
    verb_stem: str,
    past_stem: str,
) -> None:
    """Add _trans fields to each tense block."""
    # Present
    trans = {
        "present_ja_trans": f"I {verb_stem}",
        "present_ty_trans": f"you {verb_stem}",
        "present_on_ona_ono_trans": f"he/she/it {verb_stem}s",
        "present_my_trans": f"we {verb_stem}",
        "present_wy_trans": f"you all {verb_stem}",
        "present_oni_one_trans": f"they {verb_stem}",
    }
    data["present"].update(trans)

    # Past masc/fem
    for block in ("past_masc", "past_fem"):
        data[block].update({
            f"past_ja_{'masc' if 'masc' in block else 'fem'}_trans": f"I {past_stem}",
            f"past_ty_{'masc' if 'masc' in block else 'fem'}_trans": f"you {past_stem}",
            f"past_{'on' if 'masc' in block else 'ona'}_{'masc' if 'masc' in block else 'fem'}_trans": f"{'he' if 'masc' in block else 'she'} {past_stem}",
            f"past_my_{'masc' if 'masc' in block else 'fem'}_trans": f"we {past_stem}",
            f"past_wy_{'masc' if 'masc' in block else 'fem'}_trans": f"you all {past_stem}",
            f"past_{'oni' if 'masc' in block else 'one'}_{'masc' if 'masc' in block else 'fem'}_trans": f"they {past_stem}",
        })

    # Future masc/fem
    for block in ("future_masc", "future_fem"):
        data[block].update({
            f"future_{'masc' if 'masc' in block else 'fem'}_ja_trans": f"I will {verb_stem}",
            f"future_{'masc' if 'masc' in block else 'fem'}_ty_trans": f"you will {verb_stem}",
            f"future_{'masc' if 'masc' in block else 'fem'}_{'on' if 'masc' in block else 'ona'}_trans": f"{'he' if 'masc' in block else 'she'} will {verb_stem}",
            f"future_{'masc' if 'masc' in block else 'fem'}_my_trans": f"we will {verb_stem}",
            f"future_{'masc' if 'masc' in block else 'fem'}_wy_trans": f"you all will {verb_stem}",
            f"future_{'masc' if 'masc' in block else 'fem'}_{'oni' if 'masc' in block else 'one'}_trans": f"they will {verb_stem}",
        })

    # Imp future
    data["imp_future"].update({
        "imp_future_ja_trans": f"I will {verb_stem}",
        "imp_future_ty_trans": f"you will {verb_stem}",
        "imp_future_on_ona_ono_trans": f"he/she/it will {verb_stem}",
        "imp_future_my_trans": f"we will {verb_stem}",
        "imp_future_wy_trans": f"you all will {verb_stem}",
        "imp_future_oni_one_trans": f"they will {verb_stem}",
    })

    # Imperative
    data["imperative"].update({
        "imperative_ja_trans": "",
        "imperative_ty_trans": f"you {verb_stem}!",
        "imperative_on_ona_oni_trans": "let him/her/it " + verb_stem,
        "imperative_my_trans": f"let's {verb_stem}",
        "imperative_wy_trans": f"you all {verb_stem}",
        "imperative_oni_trans": "let them " + verb_stem,
    })

    # Conditional
    data["conditional_masculine"].update({
        "conditional_masculine_ja_trans": f"I would {verb_stem}",
        "conditional_masculine_ty_trans": f"you would {verb_stem}",
        "conditional_masculine_on_trans": f"he would {verb_stem}",
        "conditional_masculine_my_trans": f"we would {verb_stem}",
        "conditional_masculine_wy_trans": f"you all would {verb_stem}",
        "conditional_masculine_oni_trans": f"they would {verb_stem}",
    })
    data["conditional_feminine"].update({
        "conditional_feminine_ja_trans": f"I would {verb_stem}",
        "conditional_feminine_ty_trans": f"you would {verb_stem}",
        "conditional_feminine_ona_trans": f"she would {verb_stem}",
        "conditional_feminine_my_trans": f"we would {verb_stem}",
        "conditional_feminine_wy_trans": f"you all would {verb_stem}",
        "conditional_feminine_one_trans": f"they would {verb_stem}",
    })


NO_TRANSLATION_MSG = "No translation available"


def _add_no_translation_message(data: dict[str, Any]) -> None:
    """Set all English translation fields to 'No translation available'."""
    data["english_word"] = NO_TRANSLATION_MSG
    # Add all _trans keys (same as _add_english_translations) with the message
    trans_keys = [
        "present_ja_trans", "present_ty_trans", "present_on_ona_ono_trans",
        "present_my_trans", "present_wy_trans", "present_oni_one_trans",
    ]
    data["present"].update({k: NO_TRANSLATION_MSG for k in trans_keys})
    for block in ("past_masc", "past_fem"):
        suffix = "masc" if "masc" in block else "fem"
        keys = [f"past_ja_{suffix}_trans", f"past_ty_{suffix}_trans",
                f"past_{'on' if suffix == 'masc' else 'ona'}_{suffix}_trans",
                f"past_my_{suffix}_trans", f"past_wy_{suffix}_trans",
                f"past_{'oni' if suffix == 'masc' else 'one'}_{suffix}_trans"]
        data[block].update({k: NO_TRANSLATION_MSG for k in keys})
    for block in ("future_masc", "future_fem"):
        prefix = "future_masc" if "masc" in block else "future_fem"
        keys = [f"{prefix}_ja_trans", f"{prefix}_ty_trans", f"{prefix}_{'on' if 'masc' in block else 'ona'}_trans",
                f"{prefix}_my_trans", f"{prefix}_wy_trans", f"{prefix}_{'oni' if 'masc' in block else 'one'}_trans"]
        data[block].update({k: NO_TRANSLATION_MSG for k in keys})
    data["imp_future"].update({
        k: NO_TRANSLATION_MSG for k in [
            "imp_future_ja_trans", "imp_future_ty_trans", "imp_future_on_ona_ono_trans",
            "imp_future_my_trans", "imp_future_wy_trans", "imp_future_oni_one_trans",
        ]
    })
    data["imperative"].update({
        k: NO_TRANSLATION_MSG for k in [
            "imperative_ja_trans", "imperative_ty_trans", "imperative_on_ona_oni_trans",
            "imperative_my_trans", "imperative_wy_trans", "imperative_oni_trans",
        ]
    })
    data["conditional_masculine"].update({
        k: NO_TRANSLATION_MSG for k in [
            "conditional_masculine_ja_trans", "conditional_masculine_ty_trans",
            "conditional_masculine_on_trans", "conditional_masculine_my_trans",
            "conditional_masculine_wy_trans", "conditional_masculine_oni_trans",
        ]
    })
    data["conditional_feminine"].update({
        k: NO_TRANSLATION_MSG for k in [
            "conditional_feminine_ja_trans", "conditional_feminine_ty_trans",
            "conditional_feminine_ona_trans", "conditional_feminine_my_trans",
            "conditional_feminine_wy_trans", "conditional_feminine_one_trans",
        ]
    })


def generate_conjugation(verb: str, english: str | None, aspect: str | None = None) -> dict[str, Any]:
    """
    Core entry point: generate full conjugation JSON for a Polish verb.

    Args:
        verb: Polish infinitive (e.g. "gładzić")
        english: English translation (e.g. "to stroke"), or None when translation unavailable
        aspect: Optional override "niedokonany" or "dokonany". Auto-detected from Morfeusz2 if not provided.

    Returns:
        Conjugation dict matching the required JSON structure.
    """
    morf = morfeusz2.Morfeusz(dict_name="sgjp")
    forms = _get_forms_by_tag(morf, verb)
    extracted = _extract_forms(forms)

    if not extracted:
        raise ValueError(f"Verb '{verb}' produced no usable forms from Morfeusz2")

    # Aspect
    detected = _get_aspect_from_forms(forms)
    if aspect:
        aspect_map = {"niedokonany": "Niedokonany", "dokonany": "Dokonany"}
        gram_aspect = aspect_map.get(aspect.lower(), detected)
    else:
        gram_aspect = detected

    stems = _derive_past_stems(extracted)
    past_masc, past_fem = _build_past_forms(extracted, stems)
    cond_masc, cond_fem = _build_conditional_forms(extracted, stems)

    infinitive = extracted.get("inf", verb)

    # Present: fin forms (imperfective = present; perfective = future)
    present = {
        "present_ja": extracted.get("fin_sg_pri", "-"),
        "present_ty": extracted.get("fin_sg_sec", "-"),
        "present_on_ona_ono": extracted.get("fin_sg_ter", "-"),
        "present_my": extracted.get("fin_pl_pri", "-"),
        "present_wy": extracted.get("fin_pl_sec", "-"),
        "present_oni_one": extracted.get("fin_pl_ter", "-"),
    }

    # Future: będę/będziesz/... + masculine/feminine participle
    byc_forms = ["będę", "będziesz", "będzie", "będziemy", "będziecie", "będą"]
    part_masc = [extracted.get("praet_sg_m", "-"), extracted.get("praet_sg_m", "-"), extracted.get("praet_sg_m", "-"),
                 extracted.get("praet_pl_m", "-"), extracted.get("praet_pl_m", "-"), extracted.get("praet_pl_m", "-")]
    part_fem = [extracted.get("praet_sg_f", "-"), extracted.get("praet_sg_f", "-"), extracted.get("praet_sg_f", "-"),
                extracted.get("praet_pl_f", "-"), extracted.get("praet_pl_f", "-"), extracted.get("praet_pl_f", "-")]

    future_masc = {
        "future_masc_ja": f"{byc_forms[0]} {part_masc[0]}" if part_masc[0] != "-" else "-",
        "future_masc_ty": f"{byc_forms[1]} {part_masc[1]}" if part_masc[1] != "-" else "-",
        "future_masc_on": f"{byc_forms[2]} {part_masc[2]}" if part_masc[2] != "-" else "-",
        "future_masc_my": f"{byc_forms[3]} {part_masc[3]}" if part_masc[3] != "-" else "-",
        "future_masc_wy": f"{byc_forms[4]} {part_masc[4]}" if part_masc[4] != "-" else "-",
        "future_masc_oni": f"{byc_forms[5]} {part_masc[5]}" if part_masc[5] != "-" else "-",
    }

    future_fem = {
        "future_fem_ja": f"{byc_forms[0]} {part_fem[0]}" if part_fem[0] != "-" else "-",
        "future_fem_ty": f"{byc_forms[1]} {part_fem[1]}" if part_fem[1] != "-" else "-",
        "future_fem_ona": f"{byc_forms[2]} {part_fem[2]}" if part_fem[2] != "-" else "-",
        "future_fem_my": f"{byc_forms[3]} {part_fem[3]}" if part_fem[3] != "-" else "-",
        "future_fem_wy": f"{byc_forms[4]} {part_fem[4]}" if part_fem[4] != "-" else "-",
        "future_fem_one": f"{byc_forms[5]} {part_fem[5]}" if part_fem[5] != "-" else "-",
    }

    # Impersonal future: będę + infinitive
    imp_future = {
        "imp_future_ja": f"{byc_forms[0]} {infinitive}",
        "imp_future_ty": f"{byc_forms[1]} {infinitive}",
        "imp_future_on_ona_ono": f"{byc_forms[2]} {infinitive}",
        "imp_future_my": f"{byc_forms[3]} {infinitive}",
        "imp_future_wy": f"{byc_forms[4]} {infinitive}",
        "imp_future_oni_one": f"{byc_forms[5]} {infinitive}",
    }

    # Imperative: ja = "-", ty = impt_sg_sec, 3rd = niech + 3rd person present, my = impt_pl_pri, wy = impt_pl_sec, oni = niech + 3rd pl
    fin_ter = extracted.get("fin_sg_ter", "")
    fin_pl_ter = extracted.get("fin_pl_ter", "")
    imperative = {
        "imperative_ja": "-",
        "imperative_ty": extracted.get("impt_sg_sec", "-"),
        "imperative_on_ona_oni": f"niech {fin_ter}" if fin_ter else "-",
        "imperative_my": extracted.get("impt_pl_pri", "-"),
        "imperative_wy": extracted.get("impt_pl_sec", "-"),
        "imperative_oni": f"niech {fin_pl_ter}" if fin_pl_ter else "-",
    }

    data: dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "notes": "",
        "polish_word": verb,
        "english_word": english if english is not None else NO_TRANSLATION_MSG,
        "gram_case_aspect": gram_aspect,
        "image_url": "",
        "word_image": {"image_url": ""},
        "present": present,
        "past_masc": past_masc,
        "past_fem": past_fem,
        "future_masc": future_masc,
        "future_fem": future_fem,
        "imp_future": imp_future,
        "imperative": imperative,
        "conditional_masculine": cond_masc,
        "conditional_feminine": cond_fem,
    }

    # Reject Polish as "english" - would produce "I głosić" etc. Fetch real translation.
    polish_chars = "ąćęłńóśźż"
    if english is not None and any(c in english.lower() for c in polish_chars):
        try:
            from api.translator import translate_pl_to_en
            english = translate_pl_to_en(verb)
        except Exception:
            english = None
    if english is not None:
        data["english_word"] = english
        verb_stem = _english_verb_stem(english)
        past_stem = _english_past(verb_stem)
        _add_english_translations(data, verb_stem, past_stem)
    else:
        data["english_word"] = NO_TRANSLATION_MSG
        _add_no_translation_message(data)

    return data


def main() -> None:
    parser = argparse.ArgumentParser(description="Polish verb conjugator using Morfeusz2")
    parser.add_argument("--verb", "-v", required=True, help="Polish verb infinitive (e.g. gładzić)")
    parser.add_argument("--english", "-e", default="", help="English translation (e.g. 'to stroke')")
    parser.add_argument("--aspect", "-a", choices=["niedokonany", "dokonany"], help="Override aspect (default: auto-detect)")
    parser.add_argument("--compact", "-c", action="store_true", help="Output compact JSON")
    args = parser.parse_args()

    english = args.english or f"to {args.verb}"
    if not english.lower().startswith("to "):
        english = f"to {english}"

    try:
        data = generate_conjugation(args.verb, english, args.aspect)
        indent = None if args.compact else 2
        print(json.dumps(data, ensure_ascii=False, indent=indent))
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
