#!/usr/bin/env python3
"""One-off: crop the source photo (Downloads/RN PIC.jpg) into a square,
face-centered avatar for the Home screen. Not run at build time."""
from PIL import Image

SRC = r"C:\Users\Charles\Downloads\RN PIC.jpg"
OUT = "public/misty-photo.jpg"

im = Image.open(SRC)
im = Image.open(SRC).convert("RGB")
# EXIF-orient if needed
from PIL import ImageOps
im = ImageOps.exif_transpose(im)
w, h = im.size
print("source size", w, h)

# Face/cap roughly centered around x=0.51*w, y=0.37*h in the original photo.
center_x = round(w * 0.51)
center_y = round(h * 0.37)
half = round(w * 0.24)  # square half-size

left = max(0, center_x - half)
top = max(0, center_y - half)
right = min(w, center_x + half)
bottom = min(h, center_y + half)

crop = im.crop((left, top, right, bottom))
crop = crop.resize((720, 720), Image.LANCZOS)
crop.save(OUT, quality=90)
print("wrote", OUT, crop.size)
