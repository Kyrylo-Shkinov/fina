# PWA Icons

Для повної роботи PWA потрібно додати іконки:

1. **icon-192x192.png** - 192x192 пікселів
2. **icon-512x512.png** - 512x512 пікселів

Після створення іконок, додайте їх до `public/manifest.json`:

```json
"icons": [
  {
    "src": "/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

Можна використати онлайн генератори іконок для PWA:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

