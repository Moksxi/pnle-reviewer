#!/usr/bin/env python3
"""
Generate the app's PNG icon set from the brand mark used in the header
(App.jsx .brand-mark: rounded green-gradient square with "RN"). Run once;
outputs are committed as static assets, not regenerated at build time.
"""
from PIL import Image, ImageDraw, ImageFont

OUT = "public"
FONT = "C:/Windows/Fonts/segoeuib.ttf"

ACCENT_A = (52, 211, 153)   # --accent
ACCENT_B = (16, 185, 129)   # --accent-dim
INK = (5, 46, 34)           # --accent-ink


def gradient_square(size, radius_ratio):
    """Diagonal (top-left -> bottom-right) gradient, optionally rounded."""
    base = Image.new("RGB", (size, size))
    px = base.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = round(ACCENT_A[0] + (ACCENT_B[0] - ACCENT_A[0]) * t)
            g = round(ACCENT_A[1] + (ACCENT_B[1] - ACCENT_A[1]) * t)
            b = round(ACCENT_A[2] + (ACCENT_B[2] - ACCENT_A[2]) * t)
            px[x, y] = (r, g, b)

    if radius_ratio <= 0:
        return base.convert("RGBA")

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out


def draw_mark(img, text_scale):
    size = img.width
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, int(size * text_scale))
    text = "RN"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pos = ((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1])
    draw.text(pos, text, font=font, fill=INK)
    return img


def save(img, name):
    path = f"{OUT}/{name}"
    img.save(path)
    print("wrote", path)


# Standard icons: rounded square, ~22% corner radius, text fills most of it.
for size, name in [(192, "icons/icon-192.png"), (512, "icons/icon-512.png")]:
    icon = gradient_square(size, radius_ratio=0.22)
    draw_mark(icon, text_scale=0.42)
    save(icon, name)

# Maskable icon: full-bleed square (OS applies its own mask/crop), content
# kept within the ~80% safe zone by using a smaller text scale.
maskable = gradient_square(512, radius_ratio=0)
draw_mark(maskable, text_scale=0.30)
save(maskable, "icons/icon-maskable-512.png")

# Apple touch icon: opaque square (iOS rounds it itself), no alpha channel.
apple = gradient_square(180, radius_ratio=0).convert("RGB")
draw_mark(apple, text_scale=0.42)
save(apple, "apple-touch-icon.png")

# Small favicon fallback (PNG, for browsers without SVG favicon support).
favicon = gradient_square(48, radius_ratio=0.22)
draw_mark(favicon, text_scale=0.42)
save(favicon, "favicon-48.png")

print("done")
