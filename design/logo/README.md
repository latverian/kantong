# Logo Kantong

**Logo terpilih:** konsep D "Si Kantong". File asli: `Cute Pocket Hugging Flower Coins.png` (1254×1254). `app-icon.png` adalah versi 1024×1024 yang dipakai skrip ikon.

Taruh file logo di folder ini, lalu jalankan `npm run icons` dan `npm run build`. Ikon app di `public/icons/` (Home Screen iPhone, favicon, layar onboarding) akan dibuat ulang dari logo ini.

## File yang dibutuhkan

| File | Wajib? | Ketentuan |
|---|---|---|
| `app-icon.png` | **Wajib** | 1024×1024 px, persegi, **latar penuh sampai tepi** (tidak transparan), **tanpa sudut membulat**. iPhone akan membulatkan sudutnya sendiri, dan area transparan akan berubah jadi hitam |
| `app-icon-maskable.png` | Opsional | Sama seperti di atas, tapi simbolnya lebih kecil (± 50% kanvas). Hanya dipakai Android. Kalau tidak ada, `app-icon.png` yang dipakai |
| `wordmark.png` / `wordmark.svg` | Opsional | Logo + tulisan "Kantong", latar transparan. Untuk dipakai di dalam app nanti |

## Arah desain

- **Makna:** "Kantong" = *pocket*, tempat menyimpan uang dari **dua mata uang**: Rupiah dan NT Dollar.
- **Warna dari [DESIGN.md](../../DESIGN.md):** ink `#111827`, biru IDR `#0369A1`, ungu NTD `#7C3AED`, krem/putih untuk aksen.
- **Ikon boleh lebih kaya dari UI.** UI app sengaja flat, tapi ikon di Home Screen boleh memakai gradien, cahaya, dan tekstur supaya terlihat premium.
- **Wajib terbaca di 40px.** Satu simbol utama, maksimal 2–3 detail pendukung.

## Prompt

Prompt dalam bahasa Inggris karena hasilnya paling konsisten. Bisa ditempel langsung di ChatGPT, Gemini, Ideogram, atau Midjourney.

### A. "Kantong Premium": kantong denim 3D + koin Rp & NT$ ⭐ rekomendasi

Terlihat seperti ikon aplikasi bank premium. Kantong kain dengan jahitan, dua koin masuk ke dalamnya, dan kilau kecil sebagai simbol bunga yang tumbuh.

```
Premium iOS app icon, 1024x1024, full-bleed square, no rounded corners. Subject: a plump, softly rounded fabric pocket seen straight on, made of deep navy denim (#111827 to #1E293B) with a visible cream contrast stitch running along its curved top edge and a small folded flap. Two coins are slipping into the pocket opening, slightly overlapping and tilted: the front coin is glossy cobalt blue (#0369A1) with a minimal embossed "Rp", the back coin is glossy violet (#7C3AED) with a minimal embossed "NT$". A tiny four-point sparkle of light above the coins hints at growing interest. Background: smooth radial gradient from deep indigo (#1E1B4B) in the center to near-black (#0B0F17) at the edges. Soft studio lighting from the top-left, gentle realistic shadows under the coins, subtle fabric texture, crisp clean edges. Style: polished 3D render like premium fintech app icons, calm and trustworthy, not cartoonish. Composition: subject centered, filling about 65% of the canvas with an even margin, clearly recognizable at 40 pixels. No other text, no watermark, no border, no device mockup.
```

### B. "Batik × Bunga Plum": Indonesia bertemu Taiwan

Lebih personal. Di depan kantong ada motif batik kawung. Koin biru bermotif kawung (Indonesia), koin ungu bermotif bunga plum (bunga nasional Taiwan).

```
Modern flat-vector app icon with subtle depth, 1024x1024, full-bleed square, no rounded corners. Subject: a white pocket silhouette with a softly curved top, its front panel filled with a subtle tone-on-tone Javanese kawung batik pattern (light grey on white). Peeking out of the pocket are two coins: a cobalt blue coin (#0369A1) decorated with a tiny stylized kawung motif, and a violet coin (#7C3AED) decorated with a tiny five-petal plum blossom, symbolising Indonesia and Taiwan. Background: deep navy (#111827) with a very faint diagonal light gradient. Clean geometric shapes, smooth curves, a soft long shadow under the pocket for depth. Elegant, warm and personal, premium fintech feel. Subject centered at about 60% of the canvas, readable at small sizes. No text, no letters, no watermark, no mockup.
```

### C. "Monogram K": huruf K + panah naik

Paling modern dan tegas. Huruf K yang batangnya berbentuk sisi kantong, ujungnya panah naik (pertumbuhan), dan sebuah koin di lekukannya. Warnanya gradien biru ke ungu.

```
Sleek fintech app icon, 1024x1024, full-bleed square, no rounded corners. Subject: a bold custom monogram letter "K" made of thick rounded strokes. The vertical stroke is shaped like the side of a pocket, the upper diagonal ends in a small upward arrow showing growth, and a round coin sits in the crook of the K. The letter has a smooth gradient from cobalt blue (#0369A1) at the bottom-left to violet (#7C3AED) at the top-right, with a soft inner highlight and a slight glassy sheen. Background: deep navy (#111827) with subtle grain and a faint glow behind the letter. Minimal, confident and modern, like a premium banking app. Centered at about 60% of the canvas, perfectly balanced negative space, recognizable at 40 pixels. No other text, no watermark, no mockup.
```

### D. "Si Kantong": maskot lucu

Paling ramah. Karakter kantong kain dengan mata dan senyum kecil, memeluk dua koin seperti harta karun. Gayanya mainan clay 3D.

```
Charming but polished app icon mascot, 1024x1024, full-bleed square, no rounded corners. Subject: a friendly rounded pocket character made of soft navy fabric (#1E293B) with cream stitching, two small happy eyes and a tiny smile on its front, hugging two coins like treasure — one cobalt blue (#0369A1), one violet (#7C3AED). A few small sparkles around the coins. Background: smooth vertical gradient from soft lavender (#EDE9FE) at the top to light sky blue (#E0F2FE) at the bottom. 3D clay / soft vinyl toy style, gentle studio lighting, soft shadows, high detail, cute and trustworthy, not childish. Character centered at about 65% of the canvas, clear silhouette at small sizes. No text, no watermark, no mockup.
```

### E. Wordmark (opsional, untuk dipakai di dalam app)

Buat setelah ikon dipilih. Lampirkan gambar ikonnya ke generator sebagai referensi.

```
A horizontal logo lockup for "Kantong", using the attached app icon as the symbol on the left, followed by the word "Kantong" in a friendly geometric sans-serif similar to Plus Jakarta Sans, bold, tight but comfortable letter spacing, in near-black navy (#111827). The dot or counter of one letter may echo the blue (#0369A1) or violet (#7C3AED) coin. Transparent background, crisp vector look, no shadows, generous padding. 2000x600 pixels.
```

## Tips

- **Midjourney:** tambahkan di akhir prompt `--ar 1:1 --stylize 200 --no watermark, mockup, rounded corners`.
- **ChatGPT / Gemini:** perbaiki dengan perintah pendek, misalnya *"make the coins bigger"*, *"remove the sparkle"*, *"make the background darker"*, atau *"simplify the details for small sizes"*.
- **Uji di ukuran kecil:** kecilkan gambar sampai seukuran ikon (± 40px), lalu letakkan di atas wallpaper terang dan gelap. Pilih yang masih langsung dikenali.
- Kalau hasilnya punya sudut membulat atau bingkai HP, tambahkan: *"full-bleed square, no rounded corners, no mockup, opaque background"*.
- Simpan hasil final sebagai **`app-icon.png`** (1024×1024) di folder ini.
