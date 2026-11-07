"""Mix-and-match card designs, chosen per year.

A theme is a small dict: base, accent, font, animal, animal_hat, decorations.
`normalize()` turns anything (old/partial/garbage) into a valid theme and
`tokens()` turns a theme into the concrete colours/fonts/images the e-mails
and the personal page use. Artwork lives in app/static/art (see tools/art.py).
"""
from __future__ import annotations

import random

# Page background, card paper, text, muted text, secondary colour of the airmail stripes.
BASES = {
    "classic":     {"label": "Classic (pine & cream)",  "bg": "#0f2f24", "paper": "#fbf3e2", "ink": "#3a2410", "muted": "#8a6a45", "second": "#1d5c3f"},
    "nordic":      {"label": "Nordic frost",            "bg": "#16324f", "paper": "#f4f8fb", "ink": "#1d3a52", "muted": "#5f7d95", "second": "#9cc3e0"},
    "gingerbread": {"label": "Gingerbread",             "bg": "#5a3420", "paper": "#fdf1dc", "ink": "#4a2c18", "muted": "#9a6e4c", "second": "#a0643a"},
    "midnight":    {"label": "Midnight & gold",         "bg": "#0d1b3d", "paper": "#fbf7ee", "ink": "#1e2647", "muted": "#6b7394", "second": "#1e2f66"},
    "forest":      {"label": "Snowy forest",            "bg": "#1d3b2a", "paper": "#f7f3e8", "ink": "#22362a", "muted": "#6b7d6f", "second": "#2e6b45"},
    "candy":       {"label": "Candy cane",              "bg": "#7a1f3d", "paper": "#fff7f8", "ink": "#4a1c2b", "muted": "#a06878", "second": "#f2b8c6"},
}

ACCENTS = {  # keep in sync with tools/art.py (ornament colours)
    "red": ("Christmas red", "#c8102e"), "gold": ("Gold", "#b8860b"), "emerald": ("Emerald", "#1f8a5b"),
    "ice": ("Ice blue", "#2f78bd"), "berry": ("Berry", "#a3195b"), "copper": ("Copper", "#b45f32"),
    "silver": ("Silver", "#6f7d8c"), "plum": ("Plum", "#6b3fa0"),
}

# Only fonts that ship with Windows/macOS/iOS; every stack ends in a generic
# family, so Android/Gmail falls back to its own serif/sans/mono gracefully.
FONTS = {
    "classic":    {"label": "Classic serif (Georgia)",       "body": "Georgia,'Times New Roman',Times,serif",
                   "sign": "'Brush Script MT','Segoe Script','Lucida Handwriting',cursive"},
    "elegant":    {"label": "Elegant (Palatino)",            "body": "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",
                   "sign": "'Segoe Script','Brush Script MT','Lucida Handwriting',cursive"},
    "friendly":   {"label": "Friendly rounded (Trebuchet)",  "body": "'Trebuchet MS','Lucida Grande',Tahoma,Verdana,sans-serif",
                   "sign": "'Segoe Print','Comic Sans MS','Chalkboard SE',cursive"},
    "storybook":  {"label": "Storybook (Book Antiqua)",      "body": "'Book Antiqua','Palatino Linotype',Palatino,serif",
                   "sign": "'Lucida Handwriting','Segoe Script','Brush Script MT',cursive"},
    "typewriter": {"label": "Letter typewriter (Courier)",   "body": "'Courier New',Courier,monospace",
                   "sign": "'Courier New',Courier,monospace"},
    "modern":     {"label": "Clean modern (Verdana)",        "body": "Verdana,Tahoma,'Segoe UI',Arial,sans-serif",
                   "sign": "'Segoe Script','Brush Script MT',cursive"},
}

ANIMALS = {
    "none": "No animal", "polar_bear": "Polar bear", "penguin": "Penguin", "reindeer": "Reindeer", "deer": "Deer",
    "llama": "Llama", "samoyed": "Samoyed", "nordic_cat": "Nordic kitten", "seal": "Seal", "arctic_fox": "Arctic fox",
}

# Small repeating icons for the top/bottom border, and larger feature pieces.
BAND_DECOS = {"snowflake": "Snowflakes", "star": "Stars", "ornament": "Ornaments", "holly": "Holly",
              "candy_cane": "Candy canes", "gift": "Gifts", "bell": "Bells", "tree": "Little trees"}
FEATURE_DECOS = {"sleigh": "Reindeer sleigh (banner)", "santa_full": "Santa (full figure)",
                 "santa_face": "Santa (face)"}
DECORATIONS = {**BAND_DECOS, **FEATURE_DECOS}

ALT = {  # text shown when an e-mail client blocks images
    "polar_bear": "🐻‍❄️", "penguin": "🐧", "reindeer": "🦌", "deer": "🦌", "llama": "🦙", "samoyed": "🐕",
    "nordic_cat": "🐈", "seal": "🦭", "arctic_fox": "🦊", "snowflake": "❄", "star": "★", "ornament": "🎄",
    "holly": "☘", "candy_cane": "🍬", "gift": "🎁", "bell": "🔔", "tree": "🎄", "santa_face": "🎅",
    "santa_full": "🎅", "sleigh": "🛷",
}

DEFAULT = {"base": "classic", "accent": "red", "font": "classic", "animal": "none", "animal_hat": False,
           "decorations": ["snowflake", "star"]}


def normalize(theme: dict | None) -> dict:
    t = dict(DEFAULT)
    if isinstance(theme, dict):
        for key, allowed in (("base", BASES), ("accent", ACCENTS), ("font", FONTS), ("animal", ANIMALS)):
            if theme.get(key) in allowed:
                t[key] = theme[key]
        t["animal_hat"] = bool(theme.get("animal_hat", False))
        if isinstance(theme.get("decorations"), list):
            seen = []
            for d in theme["decorations"]:
                if d in DECORATIONS and d not in seen:
                    seen.append(d)
            t["decorations"] = seen
    return t


def random_theme(rng: random.Random | None = None) -> dict:
    rng = rng or random.Random()
    band = rng.sample(sorted(BAND_DECOS), rng.randint(1, 3))
    feature = rng.sample(sorted(FEATURE_DECOS), rng.randint(0, 1))
    return normalize({
        "base": rng.choice(sorted(BASES)), "accent": rng.choice(sorted(ACCENTS)), "font": rng.choice(sorted(FONTS)),
        "animal": rng.choice(sorted(a for a in ANIMALS if a != "none")), "animal_hat": rng.random() < .5,
        "decorations": band + feature,
    })


def options() -> dict:
    """Everything the design picker needs, with labels and swatches."""
    return {
        "bases": [{"id": k, "label": v["label"], "bg": v["bg"], "paper": v["paper"], "second": v["second"]} for k, v in BASES.items()],
        "accents": [{"id": k, "label": v[0], "color": v[1]} for k, v in ACCENTS.items()],
        "fonts": [{"id": k, "label": v["label"], "body": v["body"], "sign": v["sign"]} for k, v in FONTS.items()],
        "animals": [{"id": k, "label": v} for k, v in ANIMALS.items()],
        "band_decorations": [{"id": k, "label": v} for k, v in BAND_DECOS.items()],
        "feature_decorations": [{"id": k, "label": v} for k, v in FEATURE_DECOS.items()],
        "default": DEFAULT,
    }


def art_file(name: str, accent: str = "red", hat: bool = False) -> str:
    if name == "ornament":
        return f"ornament_{accent}"
    return f"{name}_hat" if hat and name in ANIMALS else name


def tokens(theme: dict | None) -> dict:
    t = normalize(theme)
    b = BASES[t["base"]]
    accent = ACCENTS[t["accent"]][1]
    f = FONTS[t["font"]]
    band = [d for d in t["decorations"] if d in BAND_DECOS]
    return {
        "theme": t,
        "bg": b["bg"], "paper": b["paper"], "ink": b["ink"], "muted": b["muted"], "second": b["second"],
        "accent": accent, "font": f["body"], "sign_font": f["sign"],
        "animal": None if t["animal"] == "none" else art_file(t["animal"], hat=t["animal_hat"]),
        "animal_alt": ALT.get(t["animal"], ""),
        "band": [art_file(d, t["accent"]) for d in band],
        "band_alt": [ALT[d] for d in band],
        "sleigh": "sleigh" in t["decorations"],
        "santa_full": "santa_full" in t["decorations"],
        "santa_face": "santa_face" in t["decorations"],
    }
