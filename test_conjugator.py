"""
Unit tests for conjugator.py - validation against expected forms.
"""
import pytest
from conjugator import generate_conjugation


def test_gladzic():
    """gładzić: present ja=gładzę, past masc ja=gładziłem, conditional fem ona=gładziłaby"""
    d = generate_conjugation("gładzić", "to stroke")
    assert d["present"]["present_ja"] == "gładzę"
    assert d["past_masc"]["past_ja_masc"] == "gładziłem"
    assert d["conditional_feminine"]["conditional_feminine_ona"] == "gładziłaby"


def test_robic():
    """robić: present ja=robię, past masc oni=robili, conditional masc my=robilibyśmy"""
    d = generate_conjugation("robić", "to do")
    assert d["present"]["present_ja"] == "robię"
    assert d["past_masc"]["past_oni_masc"] == "robili"
    assert d["conditional_masculine"]["conditional_masculine_my"] == "robilibyśmy"


def test_isc():
    """iść: present ja=idę, past masc ja=szedłem, future masc ja=będę szedł"""
    d = generate_conjugation("iść", "to go")
    assert d["present"]["present_ja"] == "idę"
    assert d["past_masc"]["past_ja_masc"] == "szedłem"
    assert d["future_masc"]["future_masc_ja"] == "będę szedł"


def test_jesc():
    """jeść: present ty=jesz, past fem ona=jadła, conditional fem my=jadłybyśmy"""
    d = generate_conjugation("jeść", "to eat")
    assert d["present"]["present_ty"] == "jesz"
    assert d["past_fem"]["past_ona_fem"] == "jadła"
    assert d["conditional_feminine"]["conditional_feminine_my"] == "jadłybyśmy"


def test_pisac():
    """pisać: present on/ona/ono=pisze, past masc wy=pisaliście, conditional masc on=pisałby"""
    d = generate_conjugation("pisać", "to write")
    assert d["present"]["present_on_ona_ono"] == "pisze"
    assert d["past_masc"]["past_wy_masc"] == "pisaliście"
    assert d["conditional_masculine"]["conditional_masculine_on"] == "pisałby"


def test_structure():
    """Verify output has all required keys."""
    d = generate_conjugation("gładzić", "to stroke")
    required = [
        "id", "notes", "polish_word", "english_word", "gram_case_aspect",
        "image_url", "word_image",
        "present", "past_masc", "past_fem",
        "future_masc", "future_fem", "imp_future",
        "imperative", "conditional_masculine", "conditional_feminine",
    ]
    for key in required:
        assert key in d, f"Missing key: {key}"
    assert d["word_image"] == {"image_url": ""}
    assert d["gram_case_aspect"] in ("Niedokonany", "Dokonany")


def test_verb_not_found():
    """Verb not in dictionary raises ValueError."""
    with pytest.raises(ValueError, match="xyznonexistentverb"):
        generate_conjugation("xyznonexistentverb", "to xyz")
