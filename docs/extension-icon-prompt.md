# Extension icon — GPT / DALL·E prompt

Use this if you want to regenerate the toolbar icon.

## Prompt (copy-paste)

```
Minimal flat app icon for a Chrome extension, 128x128 pixels, square with rounded corners safe zone. Design: a simple calendar page (white or light grey) with a small football/soccer ball in the bottom-right corner, or a calendar with one highlighted match day dot in Flashscore red (#FF0046). Style: clean vector, no text, no gradients, high contrast on dark grey (#1a1a1a) or white background. Must read clearly at 16px. Similar clarity to Google Calendar or sports app icons. No 3D, no shadows, no photorealism.
```

## Variants

**Light toolbar (optional):**

```
Same as above but icon on transparent PNG, dark grey line art (#555e61) calendar outline, single red accent dot (#FF0046).
```

**After export**

Resize to 16, 32, 48, 96, and 128 px PNG and place in `public/icon/`.

```bash
# macOS example (source.png = 1024x1024 export)
for size in 16 32 48 96 128; do
  sips -z $size $size source.png --out "public/icon/${size}.png"
done
bun run build
```

The repo includes icons generated from this brief in `public/icon/`.
