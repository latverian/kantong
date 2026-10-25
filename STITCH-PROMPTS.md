# Prompt Stitch — Kantong

Prompt siap tempel untuk membuat desain di [Google Stitch](https://stitch.withgoogle.com).
Prompt ditulis dalam **bahasa Inggris** karena hasil Stitch paling konsisten dengan bahasa Inggris. Teks UI di dalamnya tetap **Bahasa Indonesia**.

- **Nomor layar (S1–S21)** sama dengan tabel di [PRD.md Bagian 8](PRD.md#8-navigasi--daftar-layar).
- **Semua angka** diambil dari [PRD.md Lampiran A](PRD.md#lampiran-a--data-contoh). Waktu acuan: **Sabtu, 24 Okt 2026**, kurs **1 NT$ = Rp512**. Kalau angka di PRD berubah, ubah juga di sini.
- Desain menampilkan **versi lengkap (v1.0 + v1.1)**.

## Cara pakai

1. Buka Stitch → buat project baru → pilih mode **App** (mobile).
2. Masukkan design system:
   - Kalau ada opsi **import / upload DESIGN.md** (atau design system), upload [DESIGN.md](DESIGN.md).
   - Kalau tidak ada, tempel **Prompt 0** di awal, sebelum prompt layar pertama.
3. Generate **satu layar per prompt**. Mulai dari **S2 Beranda**. Setelah gayanya cocok, lanjut ke layar lain **di project yang sama** supaya konsisten.
4. Kalau ada yang kurang pas, revisi dengan prompt pendek yang spesifik, misalnya:
   *"Make the IDR balance card taller and move the eye icon to the top-right."*
5. Kalau hasilnya keluar sebagai mockup HP atau kanvas lebar, minta revisi:
   *"Render this as a plain mobile screen exactly 390px wide: remove the phone device frame and the outer background."*
6. Untuk dark mode, setelah satu layar jadi:
   *"Create a dark mode version of this screen using the -dark color tokens from the design system."*

---

## Prompt 0 — Konteks design system (pakai jika tidak bisa import DESIGN.md)

```
Design system for "Kantong", a personal dual-currency money management app for iPhone (390x844, portrait), installed as a PWA but looking like a native iOS app. All UI text in Bahasa Indonesia.
Every screen is a plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Long screens may be taller than 844px.

Style: calm, tidy, number-first, iOS-native (large titles, grouped rounded lists, bottom sheets, bottom tab bar). Minimal decoration, generous whitespace.

Font: Plus Jakarta Sans everywhere. Amounts use tabular numerals, bold. Large title 28px bold. Main balance 34px bold. Body 15px. Inputs at least 16px.

Colors (light): background #F4F5F9, cards #FFFFFF with 1px border #E3E6EC, text #0F172A, secondary text #475569, primary buttons ink #111827 with white text.
Currency identity: IDR = blue #0369A1 (light tint #E0F2FE), NTD = violet #7C3AED (light tint #EDE9FE). Savings goal progress uses its currency color.
Semantic: income green #15803D, expense red #B91C1C, transfer/adjustment/debt payments slate #475569, daily interest emerald #047857 (tint #D1FAE5), warning amber #B45309 (tint #FEF3C7).
Progress bars: green below 80%, amber 80–99%, red 100%+, with a thin ink tick for today's ideal pace.

Shapes: cards 16px radius, balance cards and bottom sheets 24px, buttons/inputs 12px, chips, badges, steppers fully rounded. Outlined icons, 1.75px stroke, rounded (SF Symbols / Lucide style). Category icons in 40px rounded-square tiles tinted with the category color.

Number format: Rp1.250.000 and NT$1.250 (Indonesian dot separators). Expenses "−Rp45.000" in red, income "+NT$32.000" in green, transfers "NT$5.000 → Rp2.550.000" in slate. Converted totals prefixed with "≈".

Bottom tab bar with 5 slots: Beranda, Transaksi, a raised circular ink "+" button in the center (56px, soft shadow), Rekening, Laporan.
Segmented controls under large titles: Transaksi = "Riwayat · Terjadwal"; Rekening = "Rekening · Target · Utang"; Laporan = "Ringkasan · Budget".
Toasts: ink background, white text, float above the tab bar.
```

---

## S1 — Onboarding (langkah 2 dari 3)

```
Onboarding step 2 of 3 for "Kantong", a personal money app. Follow the Kantong design system.

Top: back chevron on the left, page dots on the right (step 2 of 3 active). Title "Rekening kamu" (28px bold), subtitle "Tambah, ubah, atau hapus sesuai rekening yang kamu punya. Saldo awal bisa diisi sekarang atau nanti."

Grouped list of suggested accounts (no checkboxes). Each row: bank or wallet icon tile, name, type, and a currency badge; on the right a secondary link "Isi saldo ›" followed by a small red trash icon button to delete the account. Tapping a row opens an edit sheet:
- BCA · Bank · badge IDR (blue)
- SeaBank · Bank · badge IDR · small emerald tag "Bunga harian"
- Bank Jago · Bank · badge IDR · small emerald tag "Bunga harian"
- Dompet NT$ · Tunai · badge NTD (violet)
- Bank NT$ · Bank · badge NTD (violet)
Below the list: a full-width rounded button with a dashed border, "+ Tambah rekening".

Bottom: a full-width ink primary button "Lanjut".
```

## S2 — Beranda ⭐ mulai dari sini

```
Home dashboard "Beranda" for "Kantong", a personal dual-currency (IDR + NTD) money app on iPhone. Follow the Kantong design system. Light mode. Scrollable.

Header: small text "Sabtu, 24 Okt" above large title "Beranda". On the right: an eye icon (hide balances) and a gear icon (settings).

Horizontal snap carousel of two balance cards (24px radius, page dots below):
1. IDR card, solid blue #0369A1, white text: badge "IDR", label "Total Saldo", big "Rp32.175.000", bottom row "+Rp1.513.240 bulan ini" and "3 rekening".
2. NTD card, solid violet #7C3AED, partially visible on the right: badge "NTD", "NT$24.600", "+NT$13.020 bulan ini", "2 rekening".
Under the carousel, secondary text: "≈ Total gabungan Rp44.770.200 · 1 NT$ = Rp512".

Emerald-tinted card "Bunga kemarin": sparkle/% icon, "+Rp1.880", caption "dari SeaBank & Bank Jago", chevron.

Card "Batas bulan ini" with an "Atur" link. Two rows; each has a currency badge, "spent / limit", a percentage on the right, an 8px progress bar with a thin ink tick at 77% (today's ideal pace), and a caption:
- NTD · NT$12.480 / NT$15.000 · "83%" amber · amber bar · "Sisa NT$2.520 · NT$315/hari"
- IDR · Rp1.080.000 / Rp2.000.000 · "54%" green · green bar · "Sisa Rp920.000 · Rp115.000/hari"
Footer link row: "2 kategori hampir/lewat batas ›".

Section "Jadwal mendatang" with "Lihat semua". Three compact rows: icon, name, date, amount:
- Langganan streaming · 28 Okt · 4 hari lagi · −Rp65.000
- Sewa kamar · 1 Nov · 8 hari lagi · −NT$5.000
- Gaji · 5 Nov · 12 hari lagi · +NT$32.000 (green)

Section "Target" with "Lihat semua": two small side-by-side goal cards with progress bars in currency color:
- 🛟 Dana Darurat · 73% · Rp14.600.000 / Rp20.000.000 (blue bar)
- ✈️ Tiket Pulang · 40% · NT$6.000 / NT$15.000 (violet bar)

Section "Transaksi terakhir" with "Lihat semua". Grouped list rows with category icon tile, title, subtitle, and a right-aligned amount:
- Makan & Minum · "Bento siang · Dompet NT$" · −NT$120 (red)
- Transportasi · "MRT · Dompet NT$" · −NT$35 (red)
- Bunga Tabungan · "2 rekening · Otomatis" · +Rp1.880 (emerald)
- Belanja Harian · "PX Mart · Bank NT$" · −NT$486 (red)
- Pulsa & Internet · "Paket data · BCA" · −Rp100.000 (red)

Bottom tab bar: Beranda (active), Transaksi, center raised ink "+", Rekening, Laporan.
```

## S3 — Toast peringatan batas

```
The Beranda screen of the Kantong money app on Friday 23 Okt at 18:40, right after saving the PX Mart expense; the add transaction sheet has just closed. Follow the Kantong design system. Same layout as S2 Beranda, but with the values of that moment (PRD Lampiran A11): Saturday's transactions have not happened yet and the interest of 23 Okt is not credited yet.

- Header "Jumat, 23 Okt".
- IDR card "Rp32.173.120", "+Rp1.511.360 bulan ini", "3 rekening". NTD card "NT$24.755", "+NT$13.175 bulan ini".
- "≈ Total gabungan Rp44.847.680 · 1 NT$ = Rp512". "Bunga kemarin" "+Rp1.880".
- "Batas bulan ini": NTD "NT$12.325 / NT$15.000 · 82%" amber, "Sisa NT$2.675 · NT$297/hari"; IDR "Rp1.080.000 / Rp2.000.000 · 54%" green, "Sisa Rp920.000 · Rp102.222/hari"; ink pace tick at 74%; "2 kategori hampir/lewat batas ›".
- "Jadwal mendatang": Langganan streaming · 28 Okt · 5 hari lagi · −Rp65.000; Sewa kamar · 1 Nov · 9 hari lagi · −NT$5.000; Gaji · 5 Nov · 13 hari lagi · +NT$32.000.
- "Target": Dana Darurat "Rp14.598.720 / Rp20.000.000 · 72%"; Tiket Pulang "NT$6.000 / NT$15.000 · 40%".
- "Transaksi terakhir": Belanja Harian · PX Mart · Bank NT$ · −NT$486; Pulsa & Internet · Paket data · BCA · −Rp100.000; Biaya Transfer · Bank NT$ · −NT$150; Transfer · Bank NT$ → BCA · NT$5.000 → Rp2.550.000 (slate); Bunga Tabungan · 2 rekening · Otomatis · +Rp1.880 (emerald).

A toast floats 12px above the bottom tab bar: ink background, white text, 16px radius, soft shadow. Leading amber warning icon. First line "Pengeluaran NTD bulan ini sudah 82% dari batas". Second line in 70% white "Sisa NT$2.675 · NT$297/hari". A text button "Lihat" on the right.
```

## S4 — Transaksi → Riwayat

```
Transaction history screen for the Kantong money app. Follow the Kantong design system.

Large title "Transaksi" with a search icon on the right. Segmented control "Riwayat" (selected) · "Terjadwal". Month switcher "‹ Oktober 2026 ›".

Two small summary cards side by side:
- IDR: "Masuk +Rp43.240" · "Keluar −Rp1.080.000"
- NTD: "Masuk +NT$32.000" · "Keluar −NT$12.480"

Horizontal filter chips: "Semua" (selected, ink), "IDR", "NTD", "Rekening ▾", "Kategori ▾", "Jenis ▾".

List grouped by date headers, with the net subtotal of each day on the right:
"Hari ini" (−NT$155)
- Makan & Minum · Bento siang · Dompet NT$ · 12:30 · −NT$120
- Transportasi · MRT · Dompet NT$ · 08:10 · −NT$35
"Kemarin, Jumat 23 Okt" (−NT$636 · −Rp98.120)
- Bunga Tabungan · 2 rekening · tag "Otomatis" · +Rp1.880 (emerald, expandable chevron)
- Belanja Harian · PX Mart · Bank NT$ · 18:40 · −NT$486
- Pulsa & Internet · Paket data · BCA · tag "Terjadwal" · 12:00 · −Rp100.000
- Biaya Transfer · Bank NT$ · 10:00 · −NT$150
- Transfer · Bank NT$ → BCA · kurs 510 · 10:00 · NT$5.000 → Rp2.550.000 (slate)
"Selasa, 20 Okt" (no subtotal: debt/receivable payments are not counted)
- Pembayaran piutang · dari Andi · Dompet NT$ · +NT$500 (slate)

Amounts right-aligned with tabular numerals, signs, and semantic colors. Bottom tab bar with "Transaksi" active.
```

## S5 — Transaksi → Terjadwal

```
Scheduled transactions screen for the Kantong money app. Follow the Kantong design system.

Large title "Transaksi", segmented control "Riwayat" · "Terjadwal" (selected).

Summary card with two columns:
- "Sisa Oktober": −Rp65.000
- "November": keluar −NT$5.000 · −Rp165.000, masuk +NT$32.000

Section "PENGELUARAN RUTIN", a grouped list. Each row: category icon tile, name, rule + account in secondary text, amount on the right, next date under it, a neutral badge for the posting mode, and a small calendar icon (reminder added):
- Langganan streaming · Tiap tgl 28 · BCA · −Rp65.000 · "28 Okt · 4 hari lagi" · badge "Konfirmasi dulu"
- Sewa kamar · Tiap tgl 1 · Bank NT$ · −NT$5.000 · "1 Nov · 8 hari lagi" · badge "Otomatis"
- Paket data · Tiap tgl 23 · BCA · −Rp100.000 · "23 Nov · 30 hari lagi" · badge "Konfirmasi dulu"

Section "PEMASUKAN RUTIN":
- Gaji · Tiap tgl 5 · Bank NT$ · +NT$32.000 (green) · "5 Nov · 12 hari lagi" · badge "Konfirmasi dulu"

Bottom: secondary button "+ Tambah Jadwal". Bottom tab bar with "Transaksi" active.
```

## S6 — Edit Jadwal

```
Edit scheduled transaction form "Edit Jadwal" for the Kantong money app, iOS grouped form style. Follow the Kantong design system.

Nav bar: "Batal" on the left, title "Edit Jadwal", "Simpan" (bold) on the right.

Grouped form sections:
1. Segmented control "Pengeluaran" (selected) · "Pemasukan" · "Transfer". Field "Nama": "Sewa kamar".
2. Amount field "NT$5.000". Row "Rekening" → "Bank NT$" with a violet NTD badge. Row "Kategori" → "Tempat Tinggal / Sewa" with its icon.
3. Section "Ulangi": row "Frekuensi" → "Tiap bulan", row "Tanggal" → "1", row "Mulai" → "1 Agu 2026", row "Berakhir" → "Tidak pernah".
4. Section "Cara catat": segmented control "Otomatis" (selected) · "Konfirmasi dulu", caption "Otomatis langsung dicatat di tanggalnya."
5. Section "Pengingat": toggle "Ingatkan aku" (ON), row "Kapan" → "1 hari sebelumnya, 09:00", then a secondary button with a calendar icon "Tambahkan ke Kalender iPhone".
Footer: caption "Berikutnya: 1 Nov 2026 · 8 hari lagi" and a red text button "Hapus jadwal".
```

## S7 — Tambah Transaksi (keypad + favorit)

```
Add transaction screen for the Kantong money app, presented as a full-height sheet with a grab handle and a close "×" at the top-left. Follow the Kantong design system. The user is typing a new expense that is not saved yet.

Top: segmented control "Pengeluaran" (selected) · "Pemasukan" · "Transfer".

Favorites row: a horizontally scrollable row of white pill chips with a 1px border and a star icon: "☆ Bento NT$120", "☆ MRT NT$35", "☆ Kopi NT$65", "☆ PX Mart", and a last chip "+ Kelola".

Amount display, centered and large: small prefix "NT$" and big "180" (34px bold, tabular). Under it, an account selector pill "Dompet NT$ · Tunai ▾" with a violet NTD badge.

Category picker: a 2-row horizontally scrollable grid of category tiles (icon in a tinted rounded square + label): Makan & Minum (selected, ring highlight), Belanja Harian, Transportasi, Tempat Tinggal, Tagihan, Pulsa & Internet, Kesehatan, Hiburan, Kirim ke Keluarga, Lainnya.

Compact rows: calendar icon "Hari ini, 19:05", note field "Makan malam", and a toggle row "☆ Simpan sebagai favorit" (off).

Bottom: custom numeric keypad (3 columns: 1–9, then "000", "0", backspace). Keys are white 12px-rounded tiles on the muted background, numbers 22px bold. Below the keypad, a full-width ink primary button "Simpan".
```

## S8 — Transfer beda mata uang

```
Transfer screen for the Kantong money app: the "Transfer" tab of the add transaction sheet, sending money between currencies. Follow the Kantong design system.

Top: segmented control "Pengeluaran" · "Pemasukan" · "Transfer" (selected).

Two stacked account cards connected by a circular swap-arrow button between them:
- "Dari": Bank NT$ · violet NTD badge · "Saldo NT$26.636". Inside: label "Dikirim" and a big amount "NT$5.000".
- "Ke": BCA · blue IDR badge · "Saldo Rp6.000.000". Inside: label "Diterima" and a big amount "Rp2.550.000".

Info card:
- "Kurs: 1 NT$ = Rp510" · caption "dihitung otomatis" · edit pencil icon
- Secondary line with an info icon: "Kurs pasar Rp512 · kamu dapat Rp10.000 lebih sedikit"

Field "Biaya transfer": "NT$150" · caption "dicatat sebagai pengeluaran · Biaya Transfer".
Rows: date "Jumat, 23 Okt · 10:00" and note "Kirim ke rumah".

Bottom: full-width ink primary button "Simpan Transfer".
```

## S9 — Rekening

```
Accounts screen for the Kantong money app. Follow the Kantong design system.

Large title "Rekening" with a "+" icon button on the right. Segmented control "Rekening" (selected) · "Target" · "Utang".

Summary card "Kekayaan bersih": big "≈ Rp44.538.200" and a breakdown caption "Saldo Rp44.770.200 + Piutang Rp768.000 − Utang Rp1.000.000 · 1 NT$ = Rp512". Below it, two small tiles: "Rupiah Rp32.175.000" (blue accent) and "NT Dollar NT$24.600" (violet accent).

Section header "RUPIAH · IDR" with subtotal Rp32.175.000, then a grouped list:
- BCA · Bank · Rp8.450.000
- SeaBank · secondary "Bank · IDR · Target: Dana Darurat" · Rp14.600.000 · emerald badge "4% p.a. · +Rp1.280/hari" on its own line under the secondary text
- Bank Jago · secondary "Bank · IDR" · Rp9.125.000 · emerald badge "3% p.a. · +Rp600/hari" on its own line

Section header "NT DOLLAR · NTD" with subtotal NT$24.600:
- Dompet NT$ · Tunai · NT$3.600
- Bank NT$ · Bank · NT$21.000 · secondary line "NT$6.000 dialokasikan ke target"

Each row: 40px icon tile tinted with the account color, name in 17px semibold on one line, type in secondary text, right-aligned balance in bold tabular numerals (never truncated), and a chevron.
Bottom of list: text button "Lihat rekening diarsipkan (0)". Bottom tab bar with "Rekening" active.
```

## S10 — Detail Rekening: SeaBank

```
Account detail screen for "SeaBank" in the Kantong money app. Follow the Kantong design system.

Nav bar: back chevron "Rekening", title "SeaBank", "Edit" on the right.

Hero: bank icon tile, blue IDR badge, label "Saldo", big "Rp14.600.000", caption "Terakhir dicocokkan: 3 hari lalu".
Two secondary buttons side by side: "Sesuaikan Saldo" and "Transfer".

Card "Bunga" with an emerald accent:
- Row "Suku bunga" → "4% p.a. · Harian"
- Row "Pajak bunga" → "20% (saldo > Rp7.500.000)"
- Three stat tiles: "Kemarin +Rp1.280", "Bulan ini +Rp29.440", "Estimasi/tahun ≈ Rp467.200"
- Footnote in secondary text: "Estimasi. Cocokkan berkala dengan saldo di aplikasi bank."

Small card "Target": "🛟 Dana Darurat · 73%", caption "Ikuti saldo SeaBank", a blue progress bar, "Rp14.600.000" and "Target: Rp20.000.000", and a chevron.

Section "Riwayat", a grouped list of this account's transactions:
- Bunga Tabungan · Otomatis · Kemarin · +Rp1.280
- Bunga Tabungan · Otomatis · 22 Okt · +Rp1.280
- Bunga Tabungan · Otomatis · 21 Okt · +Rp1.280
- Penyesuaian saldo · 21 Okt · +Rp420 (slate)
```

## S11 — Hitung Uang: Dompet NT$

```
Bottom sheet "Hitung Uang" over a dimmed "Dompet NT$" account detail screen in the Kantong money app. Follow the Kantong design system. Sheet with 24px top corners and a grab handle, tall (about 85% of the screen).

Title "Hitung Uang", subtitle "Dompet NT$ · hitung uang tunai di dompetmu".

Group "UANG KERTAS": one row per denomination with the label on the left, a rounded stepper (− count +) in the middle, and the row subtotal right-aligned:
- NT$1.000 · 2 · NT$2.000
- NT$500 · 2 · NT$1.000
- NT$200 · 0 · NT$0 (dimmed)
- NT$100 · 5 · NT$500
Group "KOIN":
- NT$50 · 1 · NT$50
- NT$10 · 3 · NT$30
- NT$5 · 1 · NT$5
- NT$1 · 0 · NT$0 (dimmed)

Sticky footer card:
- "Total dihitung" → "NT$3.585" (bold)
- "Saldo di Kantong" → "NT$3.600"
- "Selisih" → "−NT$15" in red
- Full-width ink primary button "Simpan sebagai Penyesuaian"
```

## S12 — Sesuaikan Saldo

```
Bottom sheet "Sesuaikan Saldo" over a dimmed SeaBank account detail screen in the Kantong money app. Follow the Kantong design system. Plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Sheet with 24px top corners and a grab handle. The dimmed screen behind shows "SeaBank", "Rp14.600.000", and "Dana Darurat · 73%".

Content:
- Title "Sesuaikan Saldo" and subtitle "SeaBank · cocokkan dengan saldo di aplikasi bank".
- Row "Saldo di Kantong" → "Rp14.600.000" (secondary).
- Large input field labeled "Saldo asli di bank" with value "Rp14.600.380" (focused state, ink border).
- Result row with a slate badge "Selisih +Rp380", caption "akan dicatat sebagai Penyesuaian (tidak masuk laporan pemasukan)".
- Full-width ink primary button "Simpan Penyesuaian" and a text button "Batal".
```

## S13 — Tambah / Edit Rekening

```
Edit account form "Edit Rekening" for SeaBank in the Kantong money app, iOS grouped form style. Follow the Kantong design system. Plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. The screen may be taller than 844px so the whole form is visible.

Nav bar: "Batal" on the left, title "Edit Rekening", "Simpan" (bold) on the right.

Grouped form sections:
1. Field "Nama rekening": "SeaBank".
2. Row "Mata uang" → "IDR" with a blue badge and a lock icon, caption "Tidak bisa diubah karena sudah ada transaksi". Segmented control "Jenis": "Bank" (selected) · "Tunai" · "E-wallet".
3. Read-only row "Saldo saat ini" → "Rp14.600.000", caption "Ubah lewat Sesuaikan Saldo".
4. "Warna & ikon": a row of 8 color dots (one selected) and a bank icon preview.
5. Section "Bunga" with toggle "Rekening berbunga" (ON). When on:
   - "Suku bunga" field "4" with suffix "% per tahun"
   - "Pencairan" segmented control "Harian" (selected) · "Bulanan"
   - "Pajak bunga" field "20" with suffix "%"
   - "Batas saldo kena pajak" field "Rp7.500.000"
6. Emerald-tinted preview card: "Estimasi bunga bersih: +Rp1.280/hari · ≈ Rp38.400/bulan".

Footer: red text button "Arsipkan rekening".
```

## S14 — Rekening → Target

```
Savings goals screen for the Kantong money app. Follow the Kantong design system.

Large title "Rekening", segmented control "Rekening" · "Target" (selected) · "Utang".

Caption "2 target aktif".

Goal card 1 (white, 16px radius):
- "🛟 Dana Darurat" (17px semibold) + blue IDR badge. Mode caption "Ikuti saldo SeaBank".
- "Rp14.600.000 / Rp20.000.000" and "73%" on the right.
- 8px progress bar with blue fill.
- Footer rows: "Tenggat 30 Jun 2027 · butuh ≈ Rp637.000/bulan + bunga ≈ Rp38.400", emerald badge "Sesuai jadwal", secondary text "Estimasi tercapai: Jun 2027".

Goal card 2:
- "✈️ Tiket Pulang" + violet NTD badge. Mode caption "Disisihkan dari Bank NT$".
- "NT$6.000 / NT$15.000" and "40%".
- 8px progress bar with violet fill.
- Footer: "Tenggat 28 Feb 2027 · butuh NT$2.250/bulan", amber badge "Di belakang jadwal", secondary text "Estimasi tercapai: Mar 2027".
- Two compact buttons in the card: secondary "Sisihkan" and text "Ambil".

Collapsed row: "Tercapai (0)". Bottom: secondary button "+ Target Baru". Bottom tab bar with "Rekening" active.
```

## S15 — Sisihkan ke Target

```
Bottom sheet "Sisihkan" over a dimmed Target screen in the Kantong money app. Follow the Kantong design system. Plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Sheet with 24px top corners and a grab handle.

Content:
- Title "Sisihkan untuk ✈️ Tiket Pulang".
- Row "Dari" → "Bank NT$" with a violet NTD badge, caption "Bebas dipakai NT$15.000".
- Large amount input "NT$2.250" (focused, ink border). Below it, suggestion chips: "Sesuai jadwal NT$2.250" (selected), "NT$1.000", "NT$5.000".
- Preview: "NT$8.250 / NT$15.000 · 55%" with a violet progress bar, and caption "Bebas dipakai Bank NT$ menjadi NT$12.750".
- Info note with an info icon: "Saldo Bank NT$ tidak berubah. Uang ini hanya ditandai untuk target."
- Full-width ink primary button "Sisihkan".
```

## S16 — Rekening → Utang

```
Debts and receivables screen for the Kantong money app. Follow the Kantong design system.

Large title "Rekening", segmented control "Rekening" · "Target" · "Utang" (selected).

Two summary tiles side by side:
- "Piutang (orang berutang padaku)": "NT$1.500" in green, caption "≈ Rp768.000"
- "Utang (aku berutang)": "Rp1.000.000" in red

Section "PIUTANG", a grouped list row:
- 40px avatar "A" · "Andi" · secondary "Piutang · dari Dompet NT$" · right-aligned "NT$1.500" in green with "sisa dari NT$2.000" below · thin progress bar 25% paid · "Jatuh tempo 10 Nov · 17 hari lagi" · neutral badge "Sebagian"

Section "UTANG":
- avatar "D" · "Kak Dewi" · secondary "Utang · ke BCA" · right-aligned "Rp1.000.000" in red · progress bar 0% · "Jatuh tempo 30 Nov · 37 hari lagi" · amber badge "Belum dibayar"

Collapsed row: "Lunas (2) ›". Bottom: secondary button "+ Catat Utang / Piutang". Bottom tab bar with "Rekening" active.
```

## S17 — Detail Piutang: Andi

```
Receivable detail screen for "Andi" in the Kantong money app. Follow the Kantong design system.

Nav bar: back chevron "Utang", title "Andi", "Edit" on the right.

Hero: 56px avatar "A", label "Andi meminjam darimu", big "NT$1.500" in green with "sisa dari NT$2.000" below, progress bar showing 25% paid, neutral badge "Sebagian".

Info list:
- "Dipinjamkan" → "10 Okt 2026 · dari Dompet NT$"
- "Jatuh tempo" → "10 Nov 2026 · 17 hari lagi"
- "Catatan" → "Pinjam sementara"

Buttons: full-width ink primary "Catat Pembayaran", then a secondary button with a calendar icon "Tambahkan ke Kalender", and a text button "Tandai lunas".

Section "Riwayat":
- 20 Okt · Pembayaran · ke Dompet NT$ · +NT$500 (slate)
- 10 Okt · Dipinjamkan · dari Dompet NT$ · −NT$2.000 (slate)
Caption: "Tidak dihitung sebagai pemasukan atau pengeluaran."
```

## S18 — Laporan → Ringkasan

```
Reports screen for the Kantong money app. Follow the Kantong design system. Plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Scrollable.

Large title "Laporan", segmented control "Ringkasan" (selected) · "Budget". Month switcher "‹ Oktober 2026 ›". Currency segmented control "IDR" · "NTD" (selected, violet) · "Gabungan".

Three stat tiles: "Masuk +NT$32.000" (green), "Keluar −NT$12.480" (red), "Bersih +NT$19.520" (ink).

Card "Pengeluaran per kategori": a donut chart with center label "NT$12.480" and a legend with colored dots, amounts, and percentages:
- Tempat Tinggal / Sewa NT$5.000 · 40%
- Makan & Minum NT$4.380 · 35%
- Transportasi NT$1.320 · 11%
- Belanja Harian NT$1.294 · 10%
- Lainnya (2 kategori) NT$486 · 4%

Card "6 bulan terakhir": grouped bar chart May–Oct, income (green) vs expense (red) bars, minimal gridlines. October: NT$32.000 vs NT$12.480; earlier months similar placeholder values.

Card "Kekayaan bersih": big "≈ Rp44.538.200", caption "+Rp8.947.480 (+25,1%) dari bulan lalu", and a line chart May–Oct rising to the last point (Sep ≈ Rp35,6 jt → Oct ≈ Rp44,5 jt), ink line with a soft area fill. Footnote "Saldo + piutang − utang · 1 NT$ = Rp512".

Card "Kirim ke Indonesia": "NT$5.000 → Rp2.550.000 · kurs rata-rata 510 · pasar 512".

Card "Bunga diterima (IDR)": "+Rp43.240 bulan ini" with an emerald mini bar chart per month.

Bottom tab bar with "Laporan" active.
```

## S19 — Laporan → Budget

```
Budget screen in the Kantong money app: the "Budget" segment of the Laporan tab. Follow the Kantong design system.

Large title "Laporan", segmented control "Ringkasan" · "Budget" (selected). Month switcher "‹ Oktober 2026 ›" and caption "8 hari tersisa".

Section "BATAS BULANAN" with two stacked limit cards (white, 16px radius), each with an "Ubah" text button at the top-right:
1. Violet NTD badge · label "Batas pengeluaran NTD" · big "NT$12.480" followed by "/ NT$15.000" in secondary text · "83%" on the right in amber · 10px progress bar with amber fill and a thin ink tick at 77% labeled "Hari ini" · caption "Sisa NT$2.520 · NT$315/hari · di atas jadwal".
2. Blue IDR badge · "Batas pengeluaran IDR" · "Rp1.080.000 / Rp2.000.000" · "54%" in green · green fill with the tick at 77% · caption "Sisa Rp920.000 · Rp115.000/hari · lebih hemat dari jadwal".

Section "BUDGET KATEGORI · NTD", a grouped list. Each row: category icon tile, name on the left and percentage on the right, an 8px progress bar, then the caption on the left and "used / limit" on the right with a clear gap (caption may wrap):
- Makan & Minum · NT$4.380 / NT$6.000 · green 73% · "Sisa NT$1.620 · NT$202/hari"
- Transportasi · NT$1.320 / NT$1.500 · amber 88% · "Sisa NT$180 · NT$22/hari"

Section "BUDGET KATEGORI · IDR":
- Hiburan · Rp530.000 / Rp500.000 · red 106% · "Lewat Rp30.000"
- Belanja Harian · Rp450.000 / Rp1.000.000 · green 45% · "Sisa Rp550.000 · Rp68.750/hari"

Bottom: secondary button "+ Tambah Budget Kategori". Bottom tab bar with "Laporan" active.
```

## S20 — Atur Batas Bulanan

```
Bottom sheet "Atur Batas Bulanan" over a dimmed Budget screen in the Kantong money app. Follow the Kantong design system. Plain mobile screen exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Sheet with 24px top corners and a grab handle.

Content:
- Title "Atur Batas Bulanan", subtitle "Total semua pengeluaran dalam satu bulan".
- Currency segmented control "NTD" (selected, violet) · "IDR".
- Large amount input "NT$15.000" (focused, ink border). Below it, suggestion chips: "Rata-rata 3 bulan: NT$13.900", "NT$12.000", "NT$18.000".
- Toggle row "Berlaku tiap bulan" (ON).
- Info row with a bell icon: "Peringatan di 80% dan 100%", caption "Muncul setelah kamu menyimpan transaksi".
- Secondary note: "Transfer, bunga, penyesuaian saldo, dan utang/piutang tidak dihitung."
- Full-width ink primary button "Simpan" and a red text button "Hapus batas".
```

## S21 — Pengaturan

```
Settings screen "Pengaturan" for the Kantong money app, iOS Settings style with grouped rounded lists. Follow the Kantong design system.

Nav bar: back chevron "Beranda", large title "Pengaturan".

Group "Kurs & Mata Uang":
- Mata uang utama → "IDR"
- Sumber kurs → "Otomatis"
- Kurs NT$ → IDR → "1 NT$ = Rp512" · caption "diperbarui 2 jam lalu"

Group "Input Cepat":
- Saat app dibuka → "Beranda"
- Favorit → "4"
- Tap favorit langsung simpan → toggle (ON)
- Footer caption: "Tips: taruh ikon Kantong di Dock iPhone."

Group "Pengingat":
- Pengingat catat harian → "21:00" with a small "Tambahkan ke Kalender" link
- Pengingat backup → "Tiap 7 hari"

Group "Data":
- Kategori → chevron
- Backup (Export JSON) → green check + "2 hari lalu"
- Export CSV transaksi → share icon
- Restore dari backup → chevron

Group "Tampilan & Privasi":
- Tema → "Ikuti iPhone"
- Sembunyikan saldo saat dibuka → toggle (OFF)

Group "Tentang":
- Versi → "1.1.0"
- Penyimpanan → "2,4 MB · tersimpan permanen di iPhone ini"

Each row has a small colored icon tile on the left, like iOS Settings.
```

---

## Status di Stitch

Project **Kantong** · id `7274381096753647527` · design system dari DESIGN.md: `assets/1288122303c24d859fb0f21001cfb87c`.
Versi final tiap layar juga disimpan lokal di [design/screens/](design/screens/) (PNG) dan [design/html/](design/html/) (HTML dari Stitch).

| Layar | Screen ID final | Judul di Stitch |
|---|---|---|
| S1 | `eba19a88a16747e59732f8a54fb67975` | Onboarding - Rekening Kamu |
| S2 | `9dec2d18583546308ae7f54c059c94e4` | Beranda |
| S3 | `00a23bc27c1e46bcafdfed6ef1f8db65` | Beranda · 23 Okt 18:40 |
| S4 | `b1c8aac1894d47288eca34140e815ea1` | Transaksi |
| S5 | `9eec905fffc84a6fa5d17b3cb0f974e4` | Transaksi · Terjadwal |
| S6 | `7c209e89ab364d1992f4770c5ead7b5f` | Edit Jadwal |
| S7 | `8c08824ba1334ad5b5975adfe0703c4b` | Tambah Transaksi |
| S8 | `dfa7907e03fe45219c2bba2151f57836` | Tambah Transaksi · Transfer |
| S9 | `9a33975924714f388272f93415306431` | Rekening |
| S10 | `91cbfa827f774404a3485e3e7f2c9fc7` | Detail Rekening · SeaBank |
| S11 | `68918dee4e434155b6e98825a5af5973` | Hitung Uang · Dompet NT$ |
| S12 | `df18b258d0514081abe88937616d2b7c` | Sesuaikan Saldo · SeaBank |
| S13 | `f81cf31230234b459de27a4e78f3fae3` | Edit Rekening · SeaBank |
| S14 | `c66142a24a7141379f54f01162a982ab` | Rekening · Target |
| S15 | `f8f738962fc644d7b50d640854b4642b` | Sisihkan · Tiket Pulang |
| S16 | `0780bdcea5c3493bbd390c99070da5c3` | Rekening · Utang |
| S17 | `72dfa99d984d4d75a28626e5347d84ce` | Detail Piutang · Andi |
| S18 | `f0dae98fb115488ba4bbf96ee13ce411` | Laporan |
| S19 | `95f735e525e04a5298f22b6707789668` | Laporan · Budget |
| S20 | `0e672fee26bd429fa41b8b4b5db64de3` | Atur Batas Bulanan · Kantong |
| S21 | `ec4a7a4b2c5b4fc7a51a732afeee18f3` | Pengaturan |

**Versi lama yang boleh dihapus manual di Stitch** (sudah digantikan hasil edit): S1 `6381cf67…` dan `5cf9c3a0…` · S3 `ce1810ac…` dan `86e93b41…` · S4 `d2d699ad…` · S7 `73964a5a…` · S9 `f48dce64…` · S10 `cabce765…` · S12 `8e177d11…` · S13 `559f7d73…` dan `e0cbd604…` · S14 `02137670…` · S15 `c75f3b16…` · S17 `91080a32…` · S18 `502edacb…` · S19 `aa382d90…` · S20 `c9e76811…`.
