#!/usr/bin/env python3
"""
Generate home-screen / install icons from the photo (same source and center
point as scripts/crop_avatar.py, so framing matches the Home screen avatar).
Replaces the earlier RN-mark icon set for manifest icons + apple-touch-icon.
The browser-tab favicon (favicon.svg / favicon-48.png) is left as the RN
mark — a detailed photo isn't legible at 16-48px.
"""
from PIL import Image, ImageDraw, ImageOps

SRC = r"C:\Users\Charles\Downloads\RN PIC.jpg"
CENTER_X, CENTER_Y = 0.51, 0.37  # same as crop_avatar.py

im = Image.open(SRC).convert("RGB")
im = ImageOps.exif_transpose(im)
w, h = im.size


def square_crop(half_frac, size):
    cx, cy = round(w * CENTER_X), round(h * CENTER_Y)
    half = round(w * half_frac)
    left, top = max(0, cx - half), max(0, cy - half)
    right, bottom = min(w, cx + half), min(h, cy + half)
    crop = im.crop((left, top, right, bottom))
    return crop.resize((size, size), Image.LANCZOS)


def rounded(img, radius_ratio):
    size = img.width
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def save(img, name):
    path = f"public/{name}"
    img.save(path)
    print("wrote", path, img.size)


# Standard "any"-purpose icons: same tight framing as the Home screen avatar,
# rounded corners for a polished app-icon look.
save(rounded(square_crop(0.24, 192), 0.22), "icons/icon-192.png")
save(rounded(square_crop(0.24, 512), 0.22), "icons/icon-512.png")

# Maskable icon: OS may crop up to ~20% off any edge, so use a wider crop
# (more headroom) and full bleed, no rounding (the OS masks it).
save(square_crop(0.32, 512), "icons/icon-maskable-512.png")

# Apple touch icon: iOS rounds corners itself; opaque, same wider framing.
save(square_crop(0.32, 180), "apple-touch-icon.png")

print("done")
