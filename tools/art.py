"""Hand-drawn (well, hand-coded) illustrations for the themes.

Run `python tools/art.py` to (re)write app/static/art/svg/*.svg, then
`node tools/render_art.js` to rasterise them to app/static/art/png/*.png.
E-mails use the PNGs (Gmail strips inline SVG); web pages use the SVGs.

Style: flat, round, friendly; soft outlines; a white highlight in each eye.
"""
from __future__ import annotations

import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "app" / "static" / "art" / "svg"

INK = "#2b2320"
BLUSH = "#f4a7a7"


def svg(body: str, w: int = 200, h: int = 200) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'{body}</svg>')


def eye(cx: float, cy: float, r: float = 7.5, color: str = INK) -> str:
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>'
            f'<circle cx="{cx + r * .35}" cy="{cy - r * .38}" r="{r * .36}" fill="#fff"/>')


def blush(cx: float, cy: float, rx: float = 11, ry: float = 6.5) -> str:
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{BLUSH}" opacity=".55"/>'


def smile(cx: float, cy: float, w: float = 9, color: str = INK, sw: float = 3) -> str:
    return (f'<path d="M{cx - w} {cy} q{w / 2} {w * .55} {w} 0 q{w / 2} {w * .55} {w} 0" fill="none" '
            f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')


# ─── Santa hat, drawn on top of an animal head ───────────────────────────

def santa_hat(x: float, y: float, s: float = 1.0, tilt: float = -14) -> str:
    """Hat whose brim centre is at (x, y)."""
    return (
        f'<g transform="translate({x} {y}) rotate({tilt}) scale({s})">'
        '<path d="M-52 0 C-40 -50 -10 -78 22 -84 C40 -86 58 -70 66 -52 C52 -60 38 -58 30 -44 C22 -30 30 -12 46 0 Z" fill="#d7263d"/>'
        '<path d="M-30 -18 C-16 -50 6 -68 26 -72" fill="none" stroke="#ff6b7d" stroke-width="6" stroke-linecap="round" opacity=".55"/>'
        '<circle cx="66" cy="-50" r="15" fill="#fff"/><circle cx="62" cy="-55" r="5" fill="#eef3f7"/>'
        '<rect x="-60" y="-12" width="116" height="26" rx="13" fill="#fff"/>'
        '<rect x="-56" y="-6" width="108" height="6" rx="3" fill="#eef3f7"/>'
        '</g>'
    )


# ─── Animals (portrait heads, 200×200) ────────────────────────────────────
# Each returns (body_svg, hat_anchor) where hat_anchor = (x, y, scale, tilt).

def polar_bear():
    b = (
        '<circle cx="52" cy="62" r="24" fill="#f4f7fa" stroke="#d6e0e8" stroke-width="3"/>'
        '<circle cx="148" cy="62" r="24" fill="#f4f7fa" stroke="#d6e0e8" stroke-width="3"/>'
        '<circle cx="52" cy="62" r="12" fill="#e3eaf0"/><circle cx="148" cy="62" r="12" fill="#e3eaf0"/>'
        '<ellipse cx="100" cy="115" rx="72" ry="66" fill="#f8fafc" stroke="#d6e0e8" stroke-width="3"/>'
        '<ellipse cx="100" cy="140" rx="32" ry="24" fill="#fff" stroke="#e3eaf0" stroke-width="2"/>'
        '<ellipse cx="100" cy="128" rx="13" ry="9" fill="#2b2b33"/>'
        '<ellipse cx="96" cy="125" rx="4" ry="2.5" fill="#fff" opacity=".7"/>'
        + smile(100, 142, 8) + eye(73, 105) + eye(127, 105) + blush(58, 132) + blush(142, 132)
    )
    return b, (100, 56, .95, -12)


def penguin():
    b = (
        '<ellipse cx="100" cy="112" rx="74" ry="72" fill="#22313f"/>'
        '<path d="M100 92 C82 62 40 70 40 112 C40 152 70 172 100 172 C130 172 160 152 160 112 C160 70 118 62 100 92 Z" fill="#fff"/>'
        + eye(76, 112, 7) + eye(124, 112, 7) +
        '<path d="M86 128 Q100 120 114 128 Q100 148 86 128 Z" fill="#f59e2a"/>'
        '<path d="M88 128 Q100 124 112 128" fill="none" stroke="#d97a10" stroke-width="2"/>'
        + blush(60, 136, 10, 6) + blush(140, 136, 10, 6)
    )
    return b, (100, 50, .95, -12)


def _antler(sign: int) -> str:
    # sign = -1 left, +1 right; drawn around x=100
    def X(v):  # mirror
        return 100 + sign * v
    return (f'<path d="M{X(28)} 70 C{X(34)} 46 {X(40)} 30 {X(58)} 14 M{X(38)} 40 C{X(52)} 38 {X(62)} 30 {X(70)} 20 '
            f'M{X(34)} 54 C{X(20)} 44 {X(16)} 32 {X(18)} 22" fill="none" stroke="#8a5a34" stroke-width="9" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def reindeer():
    b = (
        _antler(-1) + _antler(1) +
        '<ellipse cx="44" cy="96" rx="24" ry="11" transform="rotate(-25 44 96)" fill="#9b6a43"/>'
        '<ellipse cx="156" cy="96" rx="24" ry="11" transform="rotate(25 156 96)" fill="#9b6a43"/>'
        '<ellipse cx="46" cy="96" rx="14" ry="5" transform="rotate(-25 46 96)" fill="#e6c3a0"/>'
        '<ellipse cx="154" cy="96" rx="14" ry="5" transform="rotate(25 154 96)" fill="#e6c3a0"/>'
        '<ellipse cx="100" cy="116" rx="56" ry="62" fill="#a8754b"/>'
        '<ellipse cx="100" cy="150" rx="38" ry="28" fill="#e7c7a3"/>'
        + eye(78, 108) + eye(122, 108) +
        '<circle cx="100" cy="138" r="14" fill="#e0312f"/><circle cx="95" cy="133" r="4.5" fill="#fff" opacity=".75"/>'
        + smile(100, 158, 8) + blush(66, 134, 9, 5.5) + blush(134, 134, 9, 5.5)
    )
    return b, (100, 62, .82, -12)


def deer():
    b = (
        '<ellipse cx="42" cy="78" rx="30" ry="15" transform="rotate(-30 42 78)" fill="#c88b56"/>'
        '<ellipse cx="158" cy="78" rx="30" ry="15" transform="rotate(30 158 78)" fill="#c88b56"/>'
        '<ellipse cx="44" cy="79" rx="19" ry="8" transform="rotate(-30 44 79)" fill="#f3d9bd"/>'
        '<ellipse cx="156" cy="79" rx="19" ry="8" transform="rotate(30 156 79)" fill="#f3d9bd"/>'
        '<path d="M100 50 C140 50 158 86 154 120 C150 156 128 182 100 182 C72 182 50 156 46 120 C42 86 60 50 100 50 Z" fill="#cf9460"/>'
        '<circle cx="86" cy="70" r="5" fill="#fbeedd"/><circle cx="104" cy="64" r="4" fill="#fbeedd"/><circle cx="118" cy="74" r="4.5" fill="#fbeedd"/>'
        '<ellipse cx="100" cy="156" rx="30" ry="22" fill="#f7e4cf"/>'
        '<ellipse cx="100" cy="146" rx="10" ry="7" fill="#3a2a24"/>'
        + eye(78, 110, 8.5) + eye(122, 110, 8.5) +
        '<path d="M70 98 l-6 -4 M130 98 l6 -4" stroke="#3a2a24" stroke-width="2.5" stroke-linecap="round"/>'
        + smile(100, 160, 7) + blush(64, 134, 9, 5.5) + blush(136, 134, 9, 5.5)
    )
    return b, (100, 56, .86, -12)


def llama():
    b = (
        '<ellipse cx="62" cy="44" rx="11" ry="28" transform="rotate(-12 62 44)" fill="#f1e2c6"/>'
        '<ellipse cx="138" cy="44" rx="11" ry="28" transform="rotate(12 138 44)" fill="#f1e2c6"/>'
        '<ellipse cx="62" cy="46" rx="5" ry="17" transform="rotate(-12 62 46)" fill="#e3b8a6"/>'
        '<ellipse cx="138" cy="46" rx="5" ry="17" transform="rotate(12 138 46)" fill="#e3b8a6"/>'
        '<circle cx="54" cy="70" r="7" fill="#ef5b8f"/><circle cx="146" cy="70" r="7" fill="#3bb4c9"/>'
        '<path d="M100 60 C136 60 150 92 148 124 C146 160 128 184 100 184 C72 184 54 160 52 124 C50 92 64 60 100 60 Z" fill="#f6ead3"/>'
        '<circle cx="80" cy="66" r="15" fill="#fffaf0"/><circle cx="100" cy="58" r="17" fill="#fffaf0"/>'
        '<circle cx="120" cy="66" r="15" fill="#fffaf0"/><circle cx="90" cy="74" r="12" fill="#fffaf0"/><circle cx="111" cy="74" r="12" fill="#fffaf0"/>'
        '<ellipse cx="100" cy="152" rx="30" ry="24" fill="#fffaf0"/>'
        '<path d="M92 142 q8 8 16 0 M100 148 v8" fill="none" stroke="#5a463c" stroke-width="3" stroke-linecap="round"/>'
        + smile(100, 160, 7, "#5a463c") + eye(80, 112, 7.5) + eye(120, 112, 7.5) +
        '<path d="M70 104 q4 -4 9 -3 M130 104 q-4 -4 -9 -3" stroke="#5a463c" stroke-width="2" fill="none" stroke-linecap="round"/>'
        + blush(66, 134, 9, 5.5) + blush(134, 134, 9, 5.5)
    )
    return b, (100, 50, .8, -10)


def samoyed():
    puff = "".join(f'<circle cx="{100 + 68 * c}" cy="{116 + 64 * s}" r="16" fill="#fff" stroke="#e2e8ee" stroke-width="2"/>'
                   for c, s in [(-.98, .2), (-.9, -.3), (-.6, -.75), (.6, -.75), (.9, -.3), (.98, .2),
                                (.8, .62), (.42, .9), (0, 1), (-.42, .9), (-.8, .62)])
    b = (
        '<path d="M46 76 L50 22 L90 58 Z" fill="#fff" stroke="#e2e8ee" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M154 76 L150 22 L110 58 Z" fill="#fff" stroke="#e2e8ee" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M56 64 L58 36 L80 56 Z" fill="#f6c3c8"/><path d="M144 64 L142 36 L120 56 Z" fill="#f6c3c8"/>'
        + puff +
        '<ellipse cx="100" cy="114" rx="66" ry="62" fill="#fff"/>'
        '<ellipse cx="100" cy="146" rx="30" ry="22" fill="#fbfcfd"/>'
        '<ellipse cx="100" cy="130" rx="12" ry="8.5" fill="#222"/><ellipse cx="96" cy="127" rx="4" ry="2.4" fill="#fff" opacity=".7"/>'
        '<path d="M86 144 Q100 158 114 144 Q112 168 100 168 Q88 168 86 144 Z" fill="#3a2a2a"/>'
        '<path d="M92 156 Q100 172 108 156 Q100 160 92 156 Z" fill="#f27d8c"/>'
        + eye(76, 106, 7.5) + eye(124, 106, 7.5) + blush(58, 132) + blush(142, 132)
    )
    return b, (100, 56, .9, -12)


def nordic_cat():
    b = (
        '<path d="M40 92 L46 26 L92 64 Z" fill="#8f9aa6"/><path d="M160 92 L154 26 L108 64 Z" fill="#8f9aa6"/>'
        '<path d="M52 78 L55 42 L80 64 Z" fill="#f2c3c8"/><path d="M148 78 L145 42 L120 64 Z" fill="#f2c3c8"/>'
        '<path d="M46 26 l-4 -14 M46 26 l6 -12 M154 26 l4 -14 M154 26 l-6 -12" stroke="#6f7b87" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M100 54 C146 54 168 90 166 122 C164 150 148 160 128 168 C118 178 82 178 72 168 C52 160 36 150 34 122 C32 90 54 54 100 54 Z" fill="#9aa5b1"/>'
        '<path d="M34 122 l-14 4 l14 6 l-12 8 l16 2 M166 122 l14 4 l-14 6 l12 8 l-16 2" fill="#9aa5b1"/>'
        '<path d="M88 58 q4 14 0 24 M100 56 v26 M112 58 q-4 14 0 24" stroke="#6f7b87" stroke-width="5" stroke-linecap="round" fill="none"/>'
        '<path d="M40 110 h16 M38 122 h14 M144 110 h16 M148 122 h14" stroke="#6f7b87" stroke-width="4" stroke-linecap="round"/>'
        '<ellipse cx="100" cy="146" rx="34" ry="24" fill="#f4f6f8"/>'
        '<ellipse cx="74" cy="112" rx="13" ry="14" fill="#7ac38a"/><ellipse cx="126" cy="112" rx="13" ry="14" fill="#7ac38a"/>'
        '<ellipse cx="74" cy="113" rx="5" ry="10" fill="#1f2a24"/><ellipse cx="126" cy="113" rx="5" ry="10" fill="#1f2a24"/>'
        '<circle cx="78" cy="106" r="3.5" fill="#fff"/><circle cx="130" cy="106" r="3.5" fill="#fff"/>'
        '<path d="M93 134 h14 l-7 8 Z" fill="#ef8ea0"/>'
        + smile(100, 146, 7) +
        '<path d="M70 144 h-30 M70 150 l-28 8 M130 144 h30 M130 150 l28 8" stroke="#c9d1d9" stroke-width="2" stroke-linecap="round"/>'
        + blush(62, 134, 9, 5) + blush(138, 134, 9, 5)
    )
    return b, (100, 58, .92, -12)


def seal():
    b = (
        '<ellipse cx="100" cy="112" rx="76" ry="70" fill="#c3ccd4"/>'
        '<circle cx="62" cy="70" r="5" fill="#a9b4be"/><circle cx="140" cy="64" r="4" fill="#a9b4be"/><circle cx="150" cy="84" r="6" fill="#a9b4be"/>'
        '<circle cx="54" cy="96" r="3.5" fill="#a9b4be"/>'
        '<ellipse cx="72" cy="104" rx="15" ry="16" fill="#1f262d"/><ellipse cx="128" cy="104" rx="15" ry="16" fill="#1f262d"/>'
        '<circle cx="78" cy="97" r="5.5" fill="#fff"/><circle cx="134" cy="97" r="5.5" fill="#fff"/>'
        '<circle cx="68" cy="110" r="2.5" fill="#fff" opacity=".7"/><circle cx="124" cy="110" r="2.5" fill="#fff" opacity=".7"/>'
        '<ellipse cx="86" cy="142" rx="20" ry="16" fill="#eef1f4"/><ellipse cx="114" cy="142" rx="20" ry="16" fill="#eef1f4"/>'
        '<ellipse cx="100" cy="130" rx="11" ry="7.5" fill="#3a3330"/>'
        '<circle cx="80" cy="140" r="2" fill="#8d97a0"/><circle cx="88" cy="146" r="2" fill="#8d97a0"/><circle cx="78" cy="148" r="2" fill="#8d97a0"/>'
        '<circle cx="120" cy="140" r="2" fill="#8d97a0"/><circle cx="112" cy="146" r="2" fill="#8d97a0"/><circle cx="122" cy="148" r="2" fill="#8d97a0"/>'
        '<path d="M66 144 h-28 M66 150 l-26 6 M134 144 h28 M134 150 l26 6" stroke="#9aa5ae" stroke-width="2" stroke-linecap="round"/>'
        + blush(54, 128) + blush(146, 128)
    )
    return b, (100, 52, .95, -12)


def arctic_fox():
    b = (
        '<path d="M40 100 L36 22 L92 60 Z" fill="#fbfcfd" stroke="#dbe3ea" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M160 100 L164 22 L108 60 Z" fill="#fbfcfd" stroke="#dbe3ea" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M50 84 L48 40 L80 64 Z" fill="#c9d3dc"/><path d="M150 84 L152 40 L120 64 Z" fill="#c9d3dc"/>'
        '<path d="M100 56 C146 56 168 96 170 124 L150 128 L162 140 L132 146 C122 172 110 182 100 182 C90 182 78 172 68 146 L38 140 L50 128 L30 124 C32 96 54 56 100 56 Z" '
        'fill="#fff" stroke="#dbe3ea" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M70 136 C80 150 90 160 100 162 C110 160 120 150 130 136 C118 142 108 140 100 128 C92 140 82 142 70 136 Z" fill="#f2f5f8"/>'
        '<ellipse cx="100" cy="160" rx="10" ry="7" fill="#262626"/><ellipse cx="96" cy="157" rx="3.5" ry="2" fill="#fff" opacity=".7"/>'
        '<path d="M76 106 q6 -8 14 -2" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>'
        '<path d="M124 106 q-6 -8 -14 -2" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>'
        + eye(82, 114, 7) + eye(118, 114, 7) + blush(64, 128, 9, 5) + blush(136, 128, 9, 5)
    )
    return b, (100, 56, .9, -12)


ANIMALS = {
    "polar_bear": polar_bear, "penguin": penguin, "reindeer": reindeer, "deer": deer, "llama": llama,
    "samoyed": samoyed, "nordic_cat": nordic_cat, "seal": seal, "arctic_fox": arctic_fox,
}


# ─── Decorations (100×100 unless noted) ───────────────────────────────────

def snowflake():
    arm = ('<path d="M50 50 V10 M50 22 l-9 -9 M50 22 l9 -9 M50 34 l-7 -6 M50 34 l7 -6" '
           'stroke="#7fb6e0" stroke-width="5" stroke-linecap="round" fill="none"/>')
    return svg("".join(f'<g transform="rotate({a} 50 50)">{arm}</g>' for a in range(0, 360, 60))
               + '<circle cx="50" cy="50" r="6" fill="#7fb6e0"/>', 100, 100)


ACCENTS = {  # shared with app/themes.py
    "red": "#c8102e", "gold": "#c99a2e", "emerald": "#1f8a5b", "ice": "#3a86c8",
    "berry": "#a3195b", "copper": "#c06a3b", "silver": "#8a97a6", "plum": "#6b3fa0",
}


def ornament(color: str) -> str:
    return svg(
        '<path d="M50 6 q8 0 8 8" fill="none" stroke="#b08d3c" stroke-width="3"/>'
        '<rect x="40" y="14" width="20" height="12" rx="3" fill="#d8b45a"/><rect x="40" y="22" width="20" height="3" fill="#b08d3c"/>'
        f'<circle cx="50" cy="60" r="34" fill="{color}"/>'
        '<path d="M18 54 Q50 66 82 54" fill="none" stroke="#fff" stroke-width="5" opacity=".75"/>'
        '<path d="M20 70 Q50 82 80 70" fill="none" stroke="#f3d27a" stroke-width="4" opacity=".9"/>'
        '<circle cx="34" cy="44" r="7" fill="#fff" opacity=".55"/>', 100, 100)


def star():
    import math
    pts = []
    for i in range(10):
        r = 44 if i % 2 == 0 else 19
        a = math.pi / 2 + i * math.pi / 5
        pts.append(f"{50 + r * math.cos(a):.1f},{54 - r * math.sin(a):.1f}")
    return svg(f'<polygon points="{" ".join(pts)}" fill="#f5c542" stroke="#d9a520" stroke-width="3" stroke-linejoin="round"/>'
               '<circle cx="40" cy="40" r="5" fill="#fff" opacity=".7"/>', 100, 100)


def holly():
    leaf = ('<path d="M50 52 C40 40 22 44 12 34 C18 46 12 50 18 56 C10 60 16 66 12 72 C26 66 40 66 50 52 Z" '
            'fill="#2e8b57" stroke="#1f6b41" stroke-width="2" stroke-linejoin="round"/>')
    return svg(leaf + f'<g transform="translate(100 0) scale(-1 1)">{leaf}</g>'
               '<circle cx="42" cy="56" r="9" fill="#d7263d"/><circle cx="58" cy="56" r="9" fill="#d7263d"/><circle cx="50" cy="44" r="9" fill="#e23a4f"/>'
               '<circle cx="47" cy="41" r="3" fill="#fff" opacity=".7"/>', 100, 100)


def candy_cane():
    hook = "M40 94 V38 C40 14 74 14 74 38 V46"
    return svg(
        f'<path d="{hook}" fill="none" stroke="#e7d7d9" stroke-width="17" stroke-linecap="round"/>'
        f'<path d="{hook}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>'
        f'<path d="{hook}" fill="none" stroke="#d7263d" stroke-width="14" stroke-dasharray="7 7"/>'
        '<path d="M35 90 V40 C35 26 44 20 52 19" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>',
        100, 100)


def gift():
    return svg(
        '<rect x="16" y="40" width="68" height="50" rx="5" fill="#2f9e6b"/>'
        '<rect x="12" y="32" width="76" height="16" rx="4" fill="#38b47b"/>'
        '<rect x="44" y="32" width="12" height="58" fill="#d7263d"/>'
        '<path d="M50 32 C38 12 18 18 28 30 C34 36 46 34 50 32 C54 34 66 36 72 30 C82 18 62 12 50 32 Z" fill="#e23a4f"/>'
        '<circle cx="50" cy="32" r="6" fill="#b81d33"/>', 100, 100)


def bell():
    return svg(
        '<path d="M50 14 C30 14 26 34 26 50 C26 62 20 68 14 74 H86 C80 68 74 62 74 50 C74 34 70 14 50 14 Z" fill="#e0b13a" stroke="#c2932a" stroke-width="2"/>'
        '<circle cx="50" cy="80" r="8" fill="#c2932a"/>'
        '<path d="M36 30 q-4 10 -4 22" stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round" fill="none"/>'
        '<path d="M50 14 C40 4 28 8 32 14 Z M50 14 C60 4 72 8 68 14 Z" fill="#d7263d"/>', 100, 100)


def tree():
    return svg(
        '<rect x="44" y="80" width="12" height="14" fill="#8a5a34"/>'
        '<path d="M50 8 L84 82 H16 Z" fill="#2e8b57"/>'
        '<path d="M50 8 L74 58 H26 Z" fill="#37a065"/>'
        '<path d="M28 66 Q50 56 72 64" stroke="#f3d27a" stroke-width="3" fill="none"/>'
        '<circle cx="40" cy="48" r="4" fill="#d7263d"/><circle cx="60" cy="56" r="4" fill="#3a86c8"/><circle cx="34" cy="74" r="4" fill="#f5c542"/>'
        '<circle cx="66" cy="76" r="4" fill="#d7263d"/><circle cx="52" cy="34" r="3.5" fill="#f5c542"/>'
        '<path d="M50 0 l3 7 h7 l-6 4 l2 7 l-6 -4 l-6 4 l2 -7 l-6 -4 h7 Z" fill="#f5c542"/>', 100, 100)


def santa_face():
    return svg(
        '<path d="M22 70 C22 40 50 30 70 30 C92 30 100 50 100 60 L78 70 Z" fill="#d7263d" transform="translate(-12 -8)"/>'
        '<circle cx="90" cy="48" r="10" fill="#fff"/>'
        '<rect x="12" y="54" width="76" height="16" rx="8" fill="#fff"/>'
        '<ellipse cx="50" cy="80" rx="26" ry="20" fill="#f6c9a8"/>'
        '<path d="M22 82 C22 112 78 112 78 82 C70 96 30 96 22 82 Z" fill="#fff"/>'
        '<path d="M30 92 C30 118 70 118 70 92" fill="#fff"/>'
        + eye(40, 76, 4) + eye(60, 76, 4) +
        '<circle cx="50" cy="86" r="6" fill="#ef8f7f"/>'
        '<path d="M36 94 q14 8 28 0 q-6 6 -14 6 q-8 0 -14 -6 Z" fill="#fff" stroke="#e6edf2" stroke-width="2"/>'
        '<circle cx="34" cy="86" r="4.5" fill="#f4a7a7" opacity=".7"/><circle cx="66" cy="86" r="4.5" fill="#f4a7a7" opacity=".7"/>',
        100, 120)


def santa_full():
    return svg(
        # legs & boots
        '<rect x="44" y="160" width="14" height="22" fill="#b81d33"/><rect x="62" y="160" width="14" height="22" fill="#b81d33"/>'
        '<path d="M38 182 h22 v10 h-26 q0 -10 4 -10 Z M60 182 h22 q4 0 4 10 h-26 Z" fill="#2b2320"/>'
        # body
        '<path d="M60 74 C26 74 22 120 26 150 C28 164 92 164 94 150 C98 120 94 74 60 74 Z" fill="#d7263d"/>'
        '<rect x="54" y="78" width="12" height="82" fill="#fff"/>'
        '<rect x="24" y="128" width="72" height="12" fill="#2b2320"/><rect x="52" y="125" width="16" height="18" rx="3" fill="#f5c542"/><rect x="56" y="129" width="8" height="10" fill="#2b2320"/>'
        '<path d="M26 150 C28 164 92 164 94 150 L94 156 C92 168 28 168 26 156 Z" fill="#fff"/>'
        # arms + mittens
        '<path d="M30 92 C14 102 12 120 18 128" stroke="#d7263d" stroke-width="16" stroke-linecap="round" fill="none"/>'
        '<path d="M90 92 C106 96 112 82 110 68" stroke="#d7263d" stroke-width="16" stroke-linecap="round" fill="none"/>'
        '<circle cx="18" cy="130" r="9" fill="#2e8b57"/><circle cx="110" cy="64" r="9" fill="#2e8b57"/>'
        # head
        '<ellipse cx="60" cy="56" rx="22" ry="20" fill="#f6c9a8"/>'
        '<path d="M34 58 C34 96 86 96 86 58 C78 72 42 72 34 58 Z" fill="#fff"/>'
        + eye(51, 52, 3.5) + eye(69, 52, 3.5) +
        '<circle cx="60" cy="60" r="5" fill="#ef8f7f"/>'
        '<path d="M48 68 q12 7 24 0 q-5 5 -12 5 q-7 0 -12 -5 Z" fill="#fff" stroke="#e6edf2" stroke-width="2"/>'
        # hat
        '<path d="M36 42 C40 14 66 6 86 16 C96 22 100 34 98 40 L80 40 Z" fill="#d7263d"/>'
        '<circle cx="98" cy="40" r="8" fill="#fff"/><rect x="34" y="36" width="54" height="12" rx="6" fill="#fff"/>',
        120, 200)


def sleigh():
    deer_sil = ('<g fill="#8a5a34">'
                '<ellipse cx="0" cy="0" rx="26" ry="11"/>'
                '<path d="M18 -6 L30 -26 L38 -24 L28 -4 Z"/><ellipse cx="36" cy="-28" rx="9" ry="7"/>'
                '<path d="M34 -34 l-4 -14 M34 -40 l-8 -4 M38 -34 l4 -14 M40 -42 l6 -4" stroke="#6d4526" stroke-width="3" stroke-linecap="round"/>'
                '<path d="M-20 6 l-10 16 M-12 8 l-2 18 M12 8 l8 16 M20 6 l14 12" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/>'
                '<path d="M-26 -4 l-8 -6" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/></g>')
    return svg(
        '<path d="M60 92 Q200 40 380 60" fill="none" stroke="#f5c542" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>'
        f'<g transform="translate(268 70)">{deer_sil}</g>'
        f'<g transform="translate(340 58)">{deer_sil}<circle cx="44" cy="-26" r="4" fill="#e0312f"/></g>'
        '<path d="M150 78 Q210 74 240 70 M150 84 Q220 80 312 62" stroke="#6d4526" stroke-width="2" fill="none"/>'
        # sleigh
        '<path d="M70 96 H170 Q188 96 196 82 L206 56 H182 L172 76 H96 Q86 76 82 64 L76 50 H62 Z" fill="#c8102e"/>'
        '<path d="M58 106 H186 Q206 106 214 90" fill="none" stroke="#c99a2e" stroke-width="6" stroke-linecap="round"/>'
        '<path d="M86 98 v8 M168 98 v8" stroke="#c99a2e" stroke-width="5"/>'
        # gifts
        '<rect x="96" y="52" width="26" height="24" fill="#2f9e6b"/><rect x="106" y="52" width="6" height="24" fill="#f5c542"/>'
        '<rect x="124" y="44" width="22" height="32" fill="#3a86c8"/><rect x="133" y="44" width="5" height="32" fill="#fff"/>'
        '<rect x="148" y="58" width="20" height="18" fill="#f5c542"/><rect x="156" y="58" width="5" height="18" fill="#d7263d"/>'
        # santa in sleigh
        '<circle cx="182" cy="48" r="10" fill="#f6c9a8"/><path d="M172 52 q10 16 20 0" fill="#fff"/>'
        '<path d="M172 44 Q178 26 196 32 L192 42 Z" fill="#d7263d"/><circle cx="197" cy="31" r="4" fill="#fff"/>',
        420, 120)


DECORATIONS = {
    "snowflake": snowflake, "star": star, "holly": holly, "candy_cane": candy_cane, "gift": gift,
    "bell": bell, "tree": tree, "santa_face": santa_face, "santa_full": santa_full, "sleigh": sleigh,
}


def build() -> list[str]:
    OUT.mkdir(parents=True, exist_ok=True)
    written = []
    for name, fn in ANIMALS.items():
        body, (hx, hy, hs, ht) = fn()
        (OUT / f"{name}.svg").write_text(svg(body))
        # shrink a little and push down so the hat's pompom has headroom
        (OUT / f"{name}_hat.svg").write_text(
            svg(f'<g transform="translate(17 30) scale(.83)">{body}{santa_hat(hx, hy, hs, ht)}</g>'))
        written += [name, f"{name}_hat"]
    for name, fn in DECORATIONS.items():
        (OUT / f"{name}.svg").write_text(fn())
        written.append(name)
    for accent, color in ACCENTS.items():
        (OUT / f"ornament_{accent}.svg").write_text(ornament(color))
        written.append(f"ornament_{accent}")
    return written


if __name__ == "__main__":
    names = build()
    print(f"wrote {len(names)} SVGs to {OUT}", file=sys.stderr)
