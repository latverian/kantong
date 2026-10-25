# PRD — Kantong (Money Management Pribadi)

> Nama "Kantong" masih sementara, bebas diganti.

| | |
|---|---|
| **Versi dokumen** | 0.3.5 — lihat [Lampiran B](#lampiran-b--riwayat-perubahan) |
| **Tanggal** | Dibuat 24 Oktober 2026 · diperbarui 25 Oktober 2026 |
| **Pemilik** | Faril (pengguna tunggal) |
| **Platform** | PWA, dipasang di iPhone lewat Safari → *Add to Home Screen* |
| **Dokumen terkait** | [DESIGN.md](DESIGN.md) (design system) · [STITCH-PROMPTS.md](STITCH-PROMPTS.md) (prompt layar untuk Stitch) |
| **Status** | Menunggu review sebelum desain (Stitch) dan development |

> **Sumber kebenaran:** aturan hitung ada di [Bagian 6](#6-aturan-hitung), dan semua angka contoh di desain diambil dari [Lampiran A](#lampiran-a--data-contoh). Kalau ada perubahan, ubah di dua tempat itu dulu.

---

## 1. Latar belakang

Aku mengelola uang dalam **dua mata uang**:

- **Rupiah (IDR)**: tersebar di beberapa rekening tabungan (multi bank). Sebagian rekening memberi **bunga harian**.
- **NTD (New Taiwan Dollar)**: dalam bentuk **cash** dan **rekening bank**.

Aplikasi keuangan yang ada di pasaran kurang pas karena:

1. jarang yang benar-benar nyaman untuk dua mata uang sekaligus,
2. tidak menghitung bunga harian tabungan secara otomatis,
3. data keuangan disimpan di server pihak lain.

Kantong adalah aplikasi pribadi, **gratis**, **offline**, dan **datanya hanya tersimpan di iPhone**.

## 2. Tujuan

| # | Tujuan | Ukuran keberhasilan |
|---|---|---|
| G1 | Tahu posisi uang IDR dan NTD kapan saja | Saldo total per mata uang tampil di layar pertama, < 1 detik setelah app dibuka |
| G2 | Mencatat transaksi secepat mungkin | Transaksi baru ≤ 10 detik (≤ 4 tap + ketik nominal). Transaksi rutin lewat favorit **≤ 2 tap** |
| G3 | Melihat pertumbuhan dari bunga harian | Bunga terhitung otomatis tiap hari. Selisih dengan saldo asli bank ≤ 0,1% per bulan |
| G4 | Mengontrol pengeluaran | Batas pengeluaran bulanan per mata uang + budget per kategori, dengan peringatan di 80% dan 100% |
| G5 | Data aman dan privat | Tidak ada data keuangan yang keluar dari HP. Backup bisa dibuat kapan saja |
| G6 | Merencanakan ke depan | Target tabungan, tagihan rutin, serta utang/piutang terlihat beserta jadwalnya |

### Bukan tujuan

- Sinkron otomatis dengan bank (tidak ada API publik untuk perorangan)
- Multi-user atau berbagi dengan orang lain
- Rilis di App Store
- Investasi (saham, reksa dana, crypto)
- **Siri, Shortcuts, dan widget.** iOS tidak bisa membuka PWA dari Shortcuts: link akan terbuka di Safari biasa yang datanya terpisah. Hanya mungkin jika nanti pindah ke aplikasi native.
- **Push notification.** Ini butuh server. Sebagai gantinya, pengingat dibuat lewat Kalender iPhone (F22).

## 3. Pengguna

**Satu pengguna: aku sendiri.**

- Memakai iPhone sebagai perangkat utama.
- Punya beberapa rekening IDR (BCA, SeaBank, Bank Jago). Sebagian berbunga harian.
- Punya uang NTD dalam bentuk cash dan di bank.
- Sesekali memindahkan NTD ke rekening IDR (kurs berbeda tiap kali).
- Punya tagihan rutin (sewa, paket data, langganan) dan gaji bulanan.
- Kadang meminjamkan atau meminjam uang dari teman/keluarga.
- Sedang menabung untuk beberapa tujuan (dana darurat, tiket pulang).

## 4. Platform dan teknologi

| Aspek | Keputusan |
|---|---|
| Bentuk aplikasi | **PWA**, mode `standalone` (layar penuh, tanpa address bar) |
| Instalasi | Safari → Share → *Add to Home Screen* |
| Penyimpanan data | **IndexedDB di perangkat**. **Tanpa server / database online** |
| Hosting | Static hosting gratis (GitHub Pages / Vercel / Netlify). Hanya untuk file aplikasi, bukan data |
| Offline | Ya, seluruh fitur jalan tanpa internet (Service Worker cache) |
| Internet dibutuhkan untuk | Hanya mengambil kurs otomatis (F19, opsional) |
| Pengingat | File kalender `.ics` → Kalender iPhone (F22) |
| Stack | Vite + React + TypeScript, Dexie.js (IndexedDB), vite-plugin-pwa, Tailwind CSS. Grafik dibuat sendiri dengan SVG (tanpa library chart, supaya ringan) |
| Bahasa UI | Bahasa Indonesia |

## 5. Daftar fitur

**P0** = v1.0 (MVP) · **P1** = v1.1 · **P2** = v2 / nanti.

| ID | Fitur | Prioritas |
|---|---|---|
| F1 | Rekening multi bank dan multi mata uang | P0 |
| F2 | Pencatatan transaksi | P0 |
| F3 | Transaksi favorit (template) | P0 |
| F4 | Transfer beda mata uang (NTD ⇄ IDR) | P0 |
| F5 | Bunga harian otomatis | P0 |
| F6 | Sesuaikan saldo | P0 |
| F7 | Kategori | P0 |
| F8 | Batas pengeluaran bulanan + budget kategori | P0 |
| F9 | Kurs manual & total gabungan | P0 |
| F10 | Beranda | P0 |
| F11 | Riwayat transaksi | P0 |
| F12 | Laporan dasar | P0 |
| F13 | Backup & restore | P0 |
| F14 | Target tabungan | P1 |
| F15 | Tagihan & transaksi terjadwal | P1 |
| F16 | Utang & piutang | P1 |
| F17 | Hitung uang cash | P1 |
| F18 | Laporan lanjutan & kekayaan bersih | P1 |
| F19 | Kurs otomatis | P1 |
| F20 | Buka cepat (langsung ke Tambah Transaksi) | P1 |
| F21 | Sembunyikan saldo | P1 |
| F22 | Pengingat lewat Kalender iPhone + pengingat backup | P1 |
| F23–F31 | Lihat [F23–F31 (P2)](#f23f31-p2--nanti) | P2 |

---

## 6. Aturan hitung

Bagian ini adalah **satu-satunya acuan** untuk semua angka di aplikasi dan desain.

### 6.1 Efek tiap jenis transaksi

| Jenis | Saldo rekening | Laporan (pemasukan / pengeluaran) | Batas bulanan (F8) | Kekayaan bersih |
|---|---|---|---|---|
| Pengeluaran | − | Pengeluaran | ✅ dihitung | − |
| Biaya transfer | − | Pengeluaran (kategori "Biaya Transfer") | ✅ dihitung | − |
| Pemasukan | + | Pemasukan | — | + |
| Bunga (otomatis) | + | Pemasukan (juga ditampilkan terpisah sebagai "Bunga") | — | + |
| Transfer antar rekening | − asal, + tujuan | — | — | tetap (beda mata uang: selisih kurs saja) |
| Penyesuaian saldo | ± | — (tampil terpisah sebagai "Selisih saldo") | — | ± |
| Pinjamkan uang (piutang) | − | — | — | tetap (uang berubah jadi piutang) |
| Terima pembayaran piutang | + | — | — | tetap |
| Pinjam uang (utang) | + | — | — | tetap (uang masuk, utang bertambah) |
| Bayar utang | − | — | — | tetap |
| Sisihkan ke target | tidak berubah (hanya ditandai) | — | — | tetap |

### 6.2 Definisi angka

| Angka | Rumus |
|---|---|
| **Saldo rekening** | saldo awal + semua efek "+" − semua efek "−" pada tabel 6.1 |
| **Perubahan saldo bulan ini** (kartu saldo di Beranda) | saldo hari ini − saldo akhir bulan lalu, per mata uang. Termasuk transfer dan utang/piutang |
| **Masuk / Keluar** (ringkasan Riwayat, Laporan) | Masuk = Pemasukan + Bunga. Keluar = Pengeluaran + Biaya transfer. Transfer, penyesuaian, dan utang/piutang tidak termasuk |
| **Bersih** (Laporan) | Masuk − Keluar |
| **Total saldo gabungan** | Σ saldo IDR + Σ saldo NTD × kurs, ditampilkan dengan "≈" |
| **Kekayaan bersih** | Total saldo gabungan + sisa piutang − sisa utang (semua dikonversi dengan kurs) |
| **Bebas dipakai** (rekening dengan alokasi target) | saldo − total alokasi target dari rekening itu |

### 6.3 Pembulatan dan hari

- **Nominal** IDR dan NTD ditampilkan tanpa desimal. Perhitungan internal tetap presisi (lihat [Bagian 9](#9-model-data)).
- **Persentase progress** (batas, budget, target) dibulatkan **ke bawah**. Contoh: 99,6% tampil 99%, jadi status "100%" tidak muncul sebelum benar-benar tercapai.
- **Persentase di grafik** (legenda donut) dibulatkan ke angka terdekat, supaya totalnya 100%.
- **Hari tersisa** = jumlah hari dari hari ini sampai akhir bulan, **termasuk hari ini**.
- **Sisa per hari** = sisa ÷ hari tersisa, dibulatkan ke bawah.
- **Jadwal ideal** = tanggal hari ini ÷ jumlah hari dalam bulan (mis. 24/31 = 77%).
- Batas hari mengikuti zona waktu HP (00:00 waktu lokal).

---

## 7. Detail fitur

### F1. Rekening multi bank dan multi mata uang (P0)

**User story:** aku ingin punya banyak rekening dengan mata uang berbeda, supaya saldo tiap bank, dompet cash, dan e-wallet tercatat terpisah.

| Field | Keterangan |
|---|---|
| Nama | Bebas, mis. "BCA", "SeaBank", "Dompet NT$" |
| Mata uang | `IDR` atau `NTD` (tidak bisa diubah setelah ada transaksi) |
| Jenis | **Bank**, **Tunai**, **E-wallet** (nilai data: `bank`, `cash`, `ewallet`) |
| Saldo awal | Saldo saat rekening dibuat |
| Warna / ikon | Untuk membedakan secara visual |
| Bunga | Opsional, lihat F5 |
| Diarsipkan | Rekening lama bisa disembunyikan tanpa menghapus data |
| Urutan | Bisa diurutkan manual (drag) |

**Acceptance criteria:**

- [ ] Bisa menambah, mengedit, mengarsipkan, dan menghapus rekening. Hapus hanya bisa jika tidak ada transaksi; kalau ada, sarankan arsip.
- [ ] Layar Rekening mengelompokkan rekening per mata uang (IDR dulu, lalu NTD), masing-masing dengan subtotal.
- [ ] Rekening berbunga menampilkan badge, mis. "4% p.a. · +Rp1.280/hari".
- [ ] Rekening yang punya alokasi target (F14) menampilkan "NT$6.000 dialokasikan ke target".
- [ ] **Onboarding 3 langkah** saat pertama kali buka: (1) Selamat datang & info privasi, (2) Atur daftar rekening: **tambah, ubah, hapus** (hapus bisa di-Urungkan), isi saldo awal (+ suku bunga untuk rekening berbunga), (3) Atur batas bulanan & kurs. Langkah 3 bisa dilewati.
- [ ] Langkah 1 juga menawarkan **Coba dengan data contoh** (data Lampiran A tanpa fitur v1.1; bisa dihapus lewat Pengaturan → Hapus semua data) dan **Pulihkan dari backup**.

### F2. Pencatatan transaksi (P0)

**Field:** jenis (Pengeluaran / Pemasukan / Transfer), nominal, rekening, kategori (kecuali transfer), tanggal & jam (default: sekarang), catatan (opsional), toggle **"☆ Simpan sebagai favorit"** (F3).

**Alur input (target ≤ 10 detik):**

1. Tap tombol **+** di tengah tab bar.
2. Muncul layar Tambah Transaksi dengan **keypad angka besar**. Jenis default: Pengeluaran. Rekening default: rekening terakhir dipakai.
3. Ketik nominal → pilih kategori → **Simpan**.

**Acceptance criteria:**

- [ ] Mata uang nominal otomatis mengikuti rekening yang dipilih (prefix "Rp" atau "NT$").
- [ ] Rekening dan kategori terakhir dipakai diingat.
- [ ] Bisa backdate. Jika rekening berbunga, bunga sejak tanggal itu **dihitung ulang** (F5).
- [ ] Transaksi bisa diedit dan dihapus. Hapus memakai konfirmasi + toast **Urungkan** selama **5 detik**.
- [ ] Input nominal memakai pemisah ribuan otomatis saat diketik (mis. `1.250.000`).
- [ ] Setelah simpan, cek ambang batas bulanan (F8) dan tampilkan toast bila perlu.

### F3. Transaksi favorit (P0)

**User story:** pengeluaran yang sering berulang (makan siang, MRT, kopi) ingin aku catat dengan sekali tap.

| Field | Keterangan |
|---|---|
| Label | Mis. "Bento" |
| Jenis | Pengeluaran / Pemasukan |
| Nominal | **Opsional.** Kosongkan untuk nominal yang berubah-ubah (mis. belanja) |
| Rekening, kategori, catatan | Diisi otomatis saat dipakai |

**Perilaku:**

- Favorit tampil sebagai **baris chip** di bagian atas layar Tambah Transaksi (bisa digeser, urutan bisa diatur).
- **Tap chip yang punya nominal** → langsung tersimpan dengan waktu sekarang, lalu muncul toast "Bento −NT$120 tersimpan · Urungkan" (5 detik). Perilaku ini bisa dimatikan di Pengaturan ("Tap favorit langsung simpan", default ON). Kalau dimatikan, tap chip hanya mengisi form.
- **Tap chip tanpa nominal** → form terisi (rekening, kategori, catatan), keypad aktif untuk mengetik nominal.
- Membuat favorit: toggle "☆ Simpan sebagai favorit" saat menambah transaksi, atau dari Pengaturan → Favorit.
- Saran otomatis: jika transaksi dengan kategori + rekening + nominal yang sama tercatat ≥ 3 kali dalam 30 hari, tawarkan "Jadikan favorit?".

**Acceptance criteria:**

- [ ] Transaksi favorit bisa dicatat dalam **2 tap** dari Beranda (tap **+** → tap chip). Dengan F20 aktif: buka app → tap chip.
- [ ] Favorit bisa ditambah, diedit, diurutkan, dan dihapus.

### F4. Transfer beda mata uang (P0)

**User story:** aku ingin mencatat saat memindahkan NTD ke rekening Rupiah, termasuk kurs dan biayanya.

| Field | Contoh |
|---|---|
| Jumlah dikirim | NT$5.000 (dari Bank NT$) |
| Jumlah diterima | Rp2.550.000 (ke BCA) |
| Kurs (otomatis) | 1 NT$ = Rp510 |
| Biaya (opsional) | NT$150 → dicatat sebagai **transaksi pengeluaran terpisah** kategori "Biaya Transfer", tertaut ke transfer |

**Acceptance criteria:**

- [ ] Kurs dihitung otomatis dari jumlah diterima ÷ jumlah dikirim. Bisa juga isi kurs dulu, lalu jumlah diterima dihitung otomatis.
- [ ] Kurs aktual tersimpan di transaksi (bukan kurs pasar).
- [ ] Tampil perbandingan dengan kurs pasar (F9/F19): "Kurs pasar Rp512 · kamu dapat Rp10.000 lebih sedikit".
- [ ] Transfer tidak dihitung di laporan pemasukan/pengeluaran (lihat 6.1).

### F5. Bunga harian otomatis (P0) ⭐

**User story:** aku ingin melihat bunga tabungan bertambah otomatis tiap hari, supaya saldo di app mendekati saldo asli bank tanpa input manual.

**Pengaturan bunga per rekening:**

| Field | Default IDR | Default NTD | Keterangan |
|---|---|---|---|
| Aktif | Tidak | Tidak | Toggle |
| Suku bunga (% per tahun) | — | — | Sesuai yang tertera di aplikasi bank |
| Pencairan | Harian | Bulanan | `Harian` atau `Bulanan` (akhir bulan) |
| Pajak bunga (%) | 20% | 0% | Bisa diubah |
| Batas saldo kena pajak | Rp7.500.000 | 0 | Pajak hanya dipotong jika saldo **di atas** batas ini |
| Mulai berlaku | Tanggal diaktifkan | — | Bunga tidak dihitung mundur sebelum tanggal ini |

**Rumus (per rekening, per hari):**

```
saldo_harian   = saldo akhir hari tersebut (23:59, setelah semua transaksi hari itu)
bunga_kotor    = saldo_harian × (suku_bunga / 100) / 365
pajak          = saldo_harian > batas_pajak ? bunga_kotor × (pajak_% / 100) : 0
bunga_bersih   = bunga_kotor − pajak
```

**Contoh (SeaBank di Lampiran A):** saldo Rp14.600.000, bunga 4% p.a., pajak 20%

| | Nilai |
|---|---|
| Bunga kotor per hari | Rp1.600 |
| Pajak (saldo > Rp7,5 jt) | Rp320 |
| **Bunga bersih per hari** | **Rp1.280** |
| Estimasi per bulan (30 hari) | Rp38.400 |
| Estimasi per tahun | Rp467.200 |

**Pembulatan:** nilai yang ditambahkan ke saldo dibulatkan ke **Rupiah terdekat**, dan sisa pecahan dibawa ke hari berikutnya. Contoh: bunga Rp611,51 dicatat Rp612, sisa −Rp0,49 dibawa ke esok hari. Dengan begitu tidak ada selisih pembulatan yang menumpuk. Bunga yang sudah cair **ikut berbunga** di hari berikutnya.

**Pencairan bulanan:** bunga tetap dihitung harian, tapi dicatat sebagai satu transaksi di hari terakhir bulan. Selama bulan berjalan tampil "bunga berjalan (belum cair)".

**Kapan dihitung:** setiap kali app dibuka, sistem menghitung semua hari yang belum dihitung, dari `tanggal_bunga_terakhir + 1` sampai **kemarin**. Bunga hari ini baru tercatat besok. Tiap hari per rekening menjadi satu transaksi **Bunga** (kategori "Bunga Tabungan", penanda `Otomatis`).

**Acceptance criteria:**

- [ ] Transaksi backdate di rekening berbunga memicu **hitung ulang** bunga otomatis sejak tanggal transaksi.
- [ ] Mengubah suku bunga hanya berlaku mulai tanggal perubahan (riwayat suku bunga disimpan).
- [ ] Bunga otomatis bisa diedit/dihapus. Setelah diedit, hari itu tidak ditimpa lagi oleh hitung ulang.
- [ ] Beranda menampilkan **"Bunga kemarin"** (total semua rekening). Detail Rekening menampilkan bunga kemarin, bulan ini, dan estimasi per tahun.

> ⚠️ Cara hitung tiap bank bisa berbeda (pembulatan, bunga bertingkat, jam cut-off), jadi angka di app adalah **estimasi**. Koreksinya lewat F6.

### F6. Sesuaikan saldo (P0)

**Alur:** Detail Rekening → **Sesuaikan Saldo** → tampil saldo di Kantong → isi saldo asli → tampil selisih → Simpan, lalu tercatat sebagai transaksi **Penyesuaian**.

**Contoh (Lampiran A):** saldo di Kantong Rp14.600.000, saldo asli Rp14.600.380, selisih **+Rp380**.

**Acceptance criteria:**

- [ ] Penyesuaian tidak masuk laporan pemasukan/pengeluaran (lihat 6.1).
- [ ] Detail Rekening menampilkan "Terakhir dicocokkan: 3 hari lalu".
- [ ] Untuk rekening **Tunai**, tersedia tombol **Hitung Uang** (F17) sebagai cara lain mengisi saldo asli.

### F7. Kategori (P0)

Kategori **dipakai bersama untuk IDR dan NTD**. Bisa ditambah, diedit (nama, ikon, warna), diurutkan, dan diarsipkan.

**Default pengeluaran:** Makan & Minum, Belanja Harian, Transportasi, Tempat Tinggal / Sewa, Tagihan & Utilitas, Pulsa & Internet, Kesehatan, Hiburan, Pakaian, Kirim ke Keluarga, Biaya Transfer *(sistem)*, Lainnya.

**Default pemasukan:** Gaji, Bonus / Lembur, Bunga Tabungan *(sistem)*, Hadiah, Penjualan, Lainnya.

Kategori *(sistem)* tidak bisa dihapus.

### F8. Batas pengeluaran bulanan (P0)

**User story:** aku ingin menetapkan batas total pengeluaran tiap bulan untuk Rupiah dan NTD, supaya tahu kapan harus mengerem.

| Level | Contoh | Keterangan |
|---|---|---|
| **Batas total per mata uang** | NTD: NT$15.000/bulan · IDR: Rp2.000.000/bulan | Fitur utama. Boleh diisi salah satu atau keduanya |
| **Budget per kategori** | Makan & Minum NT$6.000 · Hiburan Rp500.000 | Opsional, untuk kontrol lebih detail |

**Aturan:**

- Yang dihitung: **Pengeluaran + Biaya transfer** (lihat 6.1). Transfer, penyesuaian, bunga, utang/piutang, dan sisihkan ke target **tidak** dihitung.
- Periode: bulan kalender (tanggal 1 sampai akhir bulan).
- Batas otomatis berlaku tiap bulan (default), bisa diubah untuk bulan tertentu saja.
- Batas total dan budget kategori **berdiri sendiri**. Jika jumlah budget kategori melebihi batas total, tampil info "Total budget kategori melebihi batas bulanan".
- Saat mengatur batas, tampil **saran nominal**: rata-rata pengeluaran 3 bulan terakhir.

**Tampilan:**

- Progress bar: **hijau** < 80%, **kuning** 80–99%, **merah** ≥ 100%.
- **Penanda jadwal ideal** (garis tipis "Hari ini") di progress bar (lihat 6.3).
- Teks status: "di atas jadwal" jika % terpakai > jadwal ideal, "lebih hemat dari jadwal" jika di bawahnya.
- Sisa, sisa per hari (6.3), dan "Lewat NT$320" (merah) jika melebihi batas.

**Contoh (Lampiran A, 24 Okt, 8 hari tersisa, jadwal ideal 77%):**

| | NTD | IDR |
|---|---|---|
| Batas | NT$15.000 | Rp2.000.000 |
| Terpakai | NT$12.480 · 83% (kuning) | Rp1.080.000 · 54% (hijau) |
| Sisa | NT$2.520 | Rp920.000 |
| Sisa per hari | NT$315 | Rp115.000 |
| Status | di atas jadwal | lebih hemat dari jadwal |

**Peringatan** (di dalam aplikasi):

- Setelah menyimpan transaksi yang membuat pemakaian **melewati 80% atau 100%**, muncul toast. Contoh (Lampiran A, Jumat 23 Okt setelah PX Mart): "Pengeluaran NTD bulan ini sudah 82% dari batas · Sisa NT$2.675 · NT$297/hari".
- Tiap ambang hanya diperingatkan **sekali per bulan** per batas.

**Acceptance criteria:**

- [ ] Bisa mengatur, mengubah, dan menghapus batas total per mata uang dan budget per kategori.
- [ ] Mengedit atau menghapus transaksi langsung memperbarui progress.
- [ ] Transaksi backdate ke bulan lalu hanya memengaruhi batas bulan lalu.
- [ ] Toast 80% dan 100% muncul tepat sekali per bulan per batas.
- [ ] Layar Budget menampilkan batas total di paling atas, lalu budget kategori dikelompokkan per mata uang.

### F9. Kurs manual & total gabungan (P0)

- Mata uang utama untuk total gabungan: **IDR** (bisa diganti NTD).
- Kurs diisi **manual** di Pengaturan (mis. 1 NT$ = Rp512). Setiap perubahan disimpan sebagai riwayat.
- Total gabungan dan kekayaan bersih selalu ditandai **"≈"** dan menampilkan kurs yang dipakai, mis. "≈ Total gabungan Rp44.770.200 · 1 NT$ = Rp512".

### F10. Beranda (P0)

Urutan isi dari atas. Bagian bertanda *(v1.1)* muncul setelah fiturnya tersedia.

1. Header: tanggal ("Sabtu, 24 Okt"), judul "Beranda", ikon 👁 sembunyikan saldo *(v1.1, F21)*, ikon ⚙ pengaturan.
2. Banner backup jika backup terakhir > 7 hari *(v1.1, F22)*.
3. **Kartu saldo IDR** dan **kartu saldo NTD** (carousel horizontal): total saldo, **perubahan saldo bulan ini** (6.2), jumlah rekening.
4. **"≈ Total gabungan"** + kurs (F9).
5. **Bunga kemarin** (F5).
6. Kartu **Batas bulan ini**: progress IDR dan NTD + "2 kategori hampir/lewat batas ›" (F8).
7. **Jadwal mendatang** (≤ 14 hari ke depan, maks. 3 item) *(v1.1, F15)*.
8. **Target tabungan** (ringkas, maks. 2) *(v1.1, F14)*.
9. **Transaksi terakhir** (5 item) + "Lihat semua".

### F11. Riwayat transaksi (P0)

- [ ] Dikelompokkan per tanggal ("Hari ini", "Kemarin", "Selasa, 20 Okt"), dengan subtotal bersih (Masuk − Keluar, 6.2) per hari per mata uang.
- [ ] Bunga otomatis di hari yang sama digabung menjadi satu baris yang bisa dibuka, mis. "Bunga Tabungan · 2 rekening · +Rp1.880".
- [ ] Filter chip: mata uang, rekening, kategori, jenis (termasuk Utang/Piutang), rentang tanggal.
- [ ] Pencarian berdasarkan catatan, kategori, atau nominal.
- [ ] Pemilih bulan + ringkasan bulan (Masuk / Keluar per mata uang).
- [ ] Tag kecil "Otomatis" (bunga) dan "Terjadwal" (dari F15).

### F12. Laporan dasar (P0)

- Pemilih bulan + pemilih mata uang (`IDR` · `NTD` · `Gabungan`).
- Ringkasan: Masuk, Keluar, Bersih (6.2).
- **Donut chart** pengeluaran per kategori. Maksimal 5 irisan; sisanya digabung jadi "Lainnya (n kategori)". Tap irisan untuk melihat transaksinya.
- Angka **Bunga diterima** bulan ini.

### F13. Backup & restore (P0)

| Aksi | Detail |
|---|---|
| Export JSON | Seluruh data (semua entitas di Bagian 9). Nama file `kantong-backup-2026-10-24.json` |
| Export CSV | Transaksi saja, untuk Excel / Numbers / Google Sheets |
| Simpan | Lewat **share sheet iOS** → "Simpan ke File" → iCloud Drive |
| Import JSON | Tampil ringkasan isi file dulu (jumlah rekening, transaksi, rentang tanggal), lalu konfirmasi **ganti semua data** |

**Acceptance criteria:**

- [ ] Restore menghasilkan data identik (diuji: export → hapus semua → import → semua saldo sama).
- [ ] App meminta *persistent storage* (`navigator.storage.persist()`).

### F14. Target tabungan (P1)

**User story:** aku ingin menabung untuk tujuan tertentu dan tahu kapan target itu tercapai.

| Field | Keterangan |
|---|---|
| Nama, ikon | Mis. "Dana Darurat" 🛟, "Tiket Pulang" ✈️ |
| Mata uang | IDR atau NTD |
| Nominal target | Mis. Rp20.000.000 |
| Tenggat | Opsional, mis. Jun 2027 |
| Mode | **Ikuti saldo rekening** atau **Sisihkan manual** |

**Dua mode:**

| Mode | Cocok untuk | Progress | Contoh (Lampiran A) |
|---|---|---|---|
| **Ikuti saldo rekening** | Rekening khusus menabung | = saldo rekening yang ditautkan (bisa > 1, mata uang sama). Bunga otomatis ikut terhitung | Dana Darurat ← SeaBank: Rp14.600.000 / Rp20.000.000 (73%) |
| **Sisihkan manual** | Uang yang tercampur di rekening harian | = total yang "disisihkan" dari rekening sumber. **Saldo rekening tidak berubah**, hanya ditandai | Tiket Pulang ← Bank NT$: NT$6.000 / NT$15.000 (40%) |

**Estimasi:**

```
setoran_per_bulan = rata-rata 3 bulan terakhir dari:
                    - mode ikuti saldo : perubahan saldo rekening tertaut, di luar bunga
                    - mode sisihkan    : total sisihkan − total ambil
bunga_per_bulan   = estimasi bunga bersih 30 hari rekening tertaut (mode ikuti saldo saja)
butuh_per_bulan   = sisa ÷ jumlah bulan sampai tenggat − bunga_per_bulan
estimasi_tercapai = hari ini + sisa ÷ (setoran_per_bulan + bunga_per_bulan)
status            = "Sesuai jadwal" jika setoran_per_bulan ≥ butuh_per_bulan,
                    selain itu "Di belakang jadwal". "Tercapai" jika progress ≥ 100%.
```

Jika `setoran_per_bulan + bunga_per_bulan ≤ 0`, tampil "Belum bisa diperkirakan".

**Acceptance criteria:**

- [ ] Rekening yang ditautkan ke target mode "ikuti saldo" tidak bisa jadi sumber sisihkan (mencegah hitung dobel).
- [ ] Total sisihkan dari satu rekening tidak boleh melebihi saldonya. Jika saldo turun di bawah total alokasi, tampil peringatan di rekening & target.
- [ ] **Sisihkan** dan **Ambil** tercatat sebagai riwayat target (bukan transaksi).
- [ ] **Gunakan dana** (mis. beli tiket) membuat transaksi pengeluaran dari rekening sumber dan mengurangi alokasi dengan nominal yang sama.
- [ ] Target yang tercapai pindah ke bagian "Tercapai" dan bisa diarsipkan.

### F15. Tagihan & transaksi terjadwal (P1)

**User story:** tagihan dan pemasukan rutin (sewa, paket data, langganan, gaji) ingin tercatat tanpa aku ingat-ingat.

| Field | Keterangan |
|---|---|
| Nama | Mis. "Sewa kamar" |
| Jenis | Pengeluaran / Pemasukan / Transfer |
| Nominal, rekening, kategori | Sama seperti transaksi biasa |
| Ulangi | Harian / Mingguan / Bulanan (tanggal X) / Tahunan |
| Mulai, berakhir | Berakhir: tidak pernah / tanggal / setelah n kali |
| Cara catat | **Otomatis** (langsung tercatat di tanggalnya) atau **Konfirmasi dulu** (masuk daftar "Perlu konfirmasi", nominal bisa diubah sebelum dicatat) |
| Pengingat | Opsional: H-1 jam 09:00 (bisa diubah) → lewat Kalender (F22) |

**Perilaku:**

- Saat app dibuka, jadwal yang jatuh tempo (sampai hari ini) diproses: mode Otomatis langsung dicatat; mode Konfirmasi dulu masuk bagian **"Perlu konfirmasi"** di tab Transaksi → Terjadwal dan sebagai badge di Beranda.
- Transaksi hasil jadwal diberi tag "Terjadwal".
- Tab Transaksi → **Terjadwal** menampilkan ringkasan sisa bulan ini & bulan depan, lalu daftar Pengeluaran rutin dan Pemasukan rutin dengan tanggal berikutnya ("8 hari lagi").

**Acceptance criteria:**

- [ ] Tanggal 29–31 di bulan pendek jatuh ke hari terakhir bulan itu.
- [ ] Mengubah jadwal hanya berlaku untuk kejadian berikutnya; transaksi yang sudah tercatat tidak berubah.
- [ ] Jadwal bisa dijeda tanpa dihapus.

### F16. Utang & piutang (P1)

**User story:** aku ingin mencatat siapa meminjam uangku dan ke siapa aku berutang, termasuk cicilannya.

| Field | Keterangan |
|---|---|
| Arah | **Piutang** (aku meminjamkan) / **Utang** (aku meminjam) |
| Nama orang | Bebas, mis. "Andi" |
| Mata uang, nominal | Mis. NT$2.000 |
| Tanggal, jatuh tempo | Jatuh tempo opsional |
| Rekening | Rekening tempat uang keluar/masuk. Opsional: jika kosong, saldo tidak berubah (untuk utang lama yang dicatat belakangan) |
| Catatan | Opsional |

**Perilaku:**

- Membuat piutang dengan rekening → transaksi "Dipinjamkan" (saldo −). Membuat utang dengan rekening → transaksi "Pinjaman diterima" (saldo +).
- **Catat pembayaran** (sebagian/penuh) → transaksi pembayaran ke/dari rekening yang dipilih. Status: *Belum dibayar* → *Sebagian* → *Lunas*.
- Semua transaksi utang/piutang **tidak** masuk laporan pemasukan/pengeluaran dan batas bulanan (6.1).
- Sisa utang/piutang masuk ke **kekayaan bersih** (6.2).
- Jatuh tempo bisa ditambahkan ke Kalender (F22).

**Acceptance criteria:**

- [ ] Ringkasan di atas: total piutang dan total utang per mata uang (+ konversi "≈").
- [ ] Yang sudah lunas dipindah ke bagian "Lunas" (tersembunyi, bisa dibuka).
- [ ] Pembayaran tidak boleh melebihi sisa.

### F17. Hitung uang cash (P1)

**User story:** sesekali aku ingin menghitung uang tunai di dompet dan mencocokkannya dengan app.

- Tersedia di Detail Rekening jenis **Tunai** → **Hitung Uang** (bottom sheet).
- Daftar pecahan dengan stepper − / +:
  - **NTD:** uang kertas NT$1.000, NT$500, NT$200, NT$100 · koin NT$50, NT$10, NT$5, NT$1
  - **IDR:** uang kertas Rp100.000, Rp50.000, Rp20.000, Rp10.000, Rp5.000, Rp2.000, Rp1.000 · koin Rp1.000, Rp500, Rp200, Rp100
- Tampil total terhitung, saldo di Kantong, dan selisih → **Simpan sebagai Penyesuaian** (F6). Rincian pecahan disimpan di catatan transaksi penyesuaian.
- Contoh (Lampiran A): terhitung NT$3.585, saldo di Kantong NT$3.600, selisih **−NT$15**.

### F18. Laporan lanjutan & kekayaan bersih (P1)

Ditambahkan ke tab Laporan → Ringkasan:

- **Bar chart** Masuk vs Keluar 6 bulan terakhir (per mata uang yang dipilih).
- **Kekayaan bersih** (6.2): nilai sekarang, perubahan dari akhir bulan lalu (nominal & %), dan line chart 6 bulan. Nilai tiap akhir bulan dihitung ulang dari transaksi, memakai kurs tersimpan yang berlaku di akhir bulan itu (F9/F19).
- **Kirim ke Indonesia**: total NTD yang ditransfer ke rekening IDR bulan ini, total Rupiah diterima, dan kurs rata-rata dibanding kurs pasar.
- **Bunga diterima** per bulan (mini bar chart).
- Rekening tab juga menampilkan ringkasan kekayaan bersih di bagian atas.

### F19. Kurs otomatis (P1)

- Sumber kurs: **Manual** (F9) atau **Otomatis**: ambil dari API kurs gratis saat online, cache terakhir dipakai saat offline.
- Tampil waktu update, mis. "1 NT$ = Rp512 · diperbarui 2 jam lalu".

### F20. Buka cepat (P1)

**Pengganti integrasi Siri/Shortcuts** (tidak bisa di PWA, lihat Bukan tujuan).

- Pengaturan "Saat app dibuka": **Beranda** (default) atau **Tambah Transaksi**.
- Jika "Tambah Transaksi": setiap kali app dibuka dari kondisi tertutup, atau kembali setelah > 5 menit di background, layar Tambah Transaksi langsung tampil. Setelah simpan atau tutup, kembali ke Beranda.
- Tips di Pengaturan: taruh ikon Kantong di **Dock iPhone**.
- Digabung dengan F3: buka app → tap chip favorit = **2 tap**.

### F21. Sembunyikan saldo (P1)

- Ikon mata di Beranda. Semua nominal berubah menjadi `Rp•••••` / `NT$•••••`, dan pilihan ini diingat.
- Opsi di Pengaturan: "Sembunyikan saldo saat dibuka".

### F22. Pengingat lewat Kalender iPhone (P1)

PWA tidak bisa mengirim notifikasi tanpa server, jadi pengingat dibuat sebagai **acara di Kalender iPhone**:

| Pengingat | Isi file `.ics` |
|---|---|
| Tagihan / jadwal (F15) | Acara berulang sesuai jadwal + alarm (default H-1 09:00) |
| Jatuh tempo utang/piutang (F16) | Satu acara + alarm H-1 09:00 |
| Catat harian | Acara harian 21:00: "Sudah catat pengeluaran hari ini?" |

- Alur: tap **"Tambahkan ke Kalender"** → iOS menampilkan dialog tambah acara → Tambah. Notifikasinya nanti datang dari Kalender.
- Jika jadwal diubah, app menawarkan file `.ics` baru. Acara lama perlu dihapus manual di Kalender (ditampilkan sebagai catatan).
- **Pengingat backup:** jika backup terakhir > 7 hari (bisa diubah), tampil banner di Beranda: "Sudah 9 hari belum backup · Backup sekarang".

### F23–F31 (P2 / nanti)

| ID | Fitur |
|---|---|
| F23 | Kunci aplikasi (PIN / Face ID lewat passkey) |
| F24 | Sinkron antar perangkat (mis. Supabase) |
| F25 | Import mutasi bank (CSV) |
| F26 | Deposito (bunga cair saat jatuh tempo) |
| F27 | Riwayat & grafik kurs NT$ → Rp |
| F28 | Tag / label lintas kategori (mis. `#mudik-2026`) |
| F29 | Foto struk |
| F30 | Rekap tahunan |
| F31 | Periode budget fleksibel (mulai tanggal gajian) & rollover sisa budget |

---

## 8. Navigasi & daftar layar

**Tab bar:** Beranda · Transaksi · **[ + ]** · Rekening · Laporan. Pengaturan lewat ikon ⚙ di Beranda.

| Tab | Segmen di bawah judul |
|---|---|
| Transaksi | **Riwayat** · **Terjadwal** *(v1.1)* |
| Rekening | **Rekening** · **Target** *(v1.1)* · **Utang** *(v1.1)* |
| Laporan | **Ringkasan** · **Budget** |

Di v1.0, segmen yang belum tersedia tidak ditampilkan. Nomor layar di bawah sama dengan nomor prompt di [STITCH-PROMPTS.md](STITCH-PROMPTS.md).

| # | Layar | Akses | Versi |
|---|---|---|---|
| S1 | Onboarding: langkah 2 dari 3 (atur daftar rekening) | Pertama kali buka | v1.0 |
| S2 | Beranda | Tab Beranda | v1.0 (jadwal, target, ikon mata: v1.1) |
| S3 | Beranda + toast peringatan batas (kondisi Lampiran A11) | Setelah simpan transaksi | v1.0 |
| S4 | Transaksi → Riwayat | Tab Transaksi | v1.0 |
| S5 | Transaksi → Terjadwal | Segmen Terjadwal | v1.1 |
| S6 | Edit Jadwal | Dari S5 | v1.1 |
| S7 | Tambah Transaksi (keypad + favorit) | Tombol **+** | v1.0 |
| S8 | Transfer beda mata uang | S7 → segmen Transfer | v1.0 |
| S9 | Rekening | Tab Rekening | v1.0 (kekayaan bersih: v1.1) |
| S10 | Detail Rekening: SeaBank | Dari S9 | v1.0 (info target: v1.1) |
| S11 | Hitung Uang: Dompet NT$ (sheet) | Detail rekening Tunai | v1.1 |
| S12 | Sesuaikan Saldo (sheet) | Dari S10 | v1.0 |
| S13 | Tambah / Edit Rekening | Dari S9 / S10 | v1.0 |
| S14 | Rekening → Target | Segmen Target | v1.1 |
| S15 | Sisihkan ke Target (sheet) | Dari S14 | v1.1 |
| S16 | Rekening → Utang | Segmen Utang | v1.1 |
| S17 | Detail Piutang: Andi | Dari S16 | v1.1 |
| S18 | Laporan → Ringkasan | Tab Laporan | v1.0 (grafik lanjutan & kekayaan bersih: v1.1) |
| S19 | Laporan → Budget | Segmen Budget / kartu Batas di Beranda | v1.0 |
| S20 | Atur Batas Bulanan (sheet) | Dari S19 | v1.0 |
| S21 | Pengaturan | Ikon ⚙ di Beranda | v1.0 (beberapa baris v1.1) |

## 9. Model data

```ts
Account {
  id, name, currency: 'IDR' | 'NTD', type: 'bank' | 'cash' | 'ewallet',
  openingBalance, color, icon, sortOrder, archived, lastReconciledAt?,
  interest?: {
    enabled, payout: 'daily' | 'monthly',
    rateHistory: { rate: number, from: Date }[],   // % per tahun
    taxPercent, taxThreshold,
    lastAccruedDate, carryRemainder                  // sisa pecahan pembulatan
  }
}

Transaction {
  id, type: 'expense' | 'income' | 'transfer' | 'interest' | 'adjustment' | 'debt',
  accountId, toAccountId?, amount, toAmount?, fxRate?,
  categoryId?, date, note?,
  linkedTransactionId?,            // biaya transfer → transfer induknya
  debtId?, debtFlow?: 'in' | 'out',
  recurringId?, favoriteId?,
  adjustmentSource?: 'manual' | 'cash_count',
  cashCount?: { denomination: number, count: number }[],
  isAuto, isManuallyEdited, createdAt, updatedAt
}

Category       { id, name, kind: 'expense' | 'income', icon, color, sortOrder, archived, isSystem }
Budget         { id, scope: 'total' | 'category', categoryId?, currency, amount,
                 month?: 'YYYY-MM', recurring, lastAlert80?: 'YYYY-MM', lastAlert100?: 'YYYY-MM' }
Favorite       { id, label, type: 'expense' | 'income', amount?, accountId, categoryId, note?, sortOrder }
Goal           { id, name, icon, currency, targetAmount, deadline?, mode: 'linked' | 'allocated',
                 linkedAccountIds?: string[], status: 'active' | 'achieved' | 'archived' }
GoalAllocation { id, goalId, accountId, amount, date, note? }   // + sisihkan, − ambil / gunakan
Recurring      { id, name, type: 'expense' | 'income' | 'transfer', amount, accountId, toAccountId?,
                 categoryId?, rule: { freq: 'daily' | 'weekly' | 'monthly' | 'yearly', interval, byMonthDay?, byWeekday? },
                 startDate, endDate?, count?, postingMode: 'auto' | 'confirm', nextDate, paused,
                 reminder?: { daysBefore, time } }
Debt           { id, direction: 'lent' | 'borrowed', person, currency, principal, date, dueDate?,
                 accountId?, note?, status: 'open' | 'partial' | 'paid' }
FxRate         { id, base: 'NTD', quote: 'IDR', rate, source: 'manual' | 'auto', updatedAt }   // riwayat
Settings       { primaryCurrency, fxMode, theme, hideBalances, hideOnOpen, openTo: 'home' | 'add',
                 favoriteOneTap, lastBackupAt, backupReminderDays, dailyReminderTime }
```

**Penyimpanan angka:** nominal disimpan sebagai **integer dalam satuan terkecil × 100** (mis. Rp1.280 → `128000`) untuk menghindari error floating point.

## 10. Format & lokalisasi

| Hal | Format |
|---|---|
| Rupiah | `Rp1.250.000` (titik sebagai pemisah ribuan) |
| NTD | `NT$1.250` (format angka Indonesia, supaya konsisten) |
| Pengeluaran | `−Rp45.000` (merah + tanda minus, bukan hanya warna) |
| Pemasukan | `+NT$32.000` (hijau + tanda plus) |
| Transfer | `NT$5.000 → Rp2.550.000` (abu-abu) |
| Nilai konversi | `≈ Rp44.770.200` |
| Disembunyikan | `Rp•••••` |
| Tanggal | `Sabtu, 24 Okt 2026` · relatif: "Hari ini", "Kemarin", "8 hari lagi" |
| Bunga | `4% p.a.` |

## 11. Kebutuhan non-fungsional

| Area | Kebutuhan |
|---|---|
| Performa | App terbuka < 1 detik (dari cache). Lancar dengan ≥ 10.000 transaksi |
| Offline | 100% fitur jalan offline, kecuali kurs otomatis |
| Privasi | Tidak ada analytics, tracker, atau request ke server selain ambil kurs (opsional) |
| Keamanan | CSP ketat (`self` saja, tanpa inline script/eval, `connect-src` hanya domain sendiri), HSTS, header keamanan, validasi file backup, tanpa CDN pihak ketiga. Detail & uji serangan: [SECURITY.md](SECURITY.md) |
| iOS | Safe area (notch, home indicator), font input ≥ 16px (supaya Safari tidak zoom), `apple-touch-icon`, splash screen, status bar menyatu |
| Tema | Terang & gelap, mengikuti pengaturan iPhone (bisa dipaksa manual) |
| Aksesibilitas | Kontras WCAG AA, target sentuh ≥ 44×44 pt, status tidak hanya lewat warna |
| Animasi pembuka | Sekali tiap app dibuka, ± 1,5 detik: ikon Si Kantong "memeluk", kilau berkedip, nama muncul, lalu memudar ke app. Bisa di-tap untuk lewati; dimatikan jika *Reduce Motion* aktif |

> **Catatan iOS:** data app di Home Screen **terpisah** dari data di tab Safari biasa. Selalu buka Kantong dari ikon Home Screen.

## 12. Roadmap

| Fase | Isi |
|---|---|
| **v1.0 (MVP)** | P0: F1–F13 |
| **v1.1** | P1: F14–F22 (target, terjadwal, utang/piutang, hitung cash, laporan lanjutan & kekayaan bersih, kurs otomatis, buka cepat, sembunyikan saldo, pengingat) |
| **v2** | P2: F23–F31 |

## 13. Risiko

| Risiko | Mitigasi |
|---|---|
| Data hilang (HP rusak/hilang, storage dihapus iOS) | Backup ke iCloud Drive + pengingat backup + persistent storage |
| Bunga app ≠ bunga bank | Ditandai sebagai estimasi + Sesuaikan Saldo + Hitung Uang |
| Malas input → data tidak lengkap | Favorit (≤ 2 tap), Buka cepat, transaksi terjadwal, pengingat catat harian |
| Import `.ics` dari PWA mode standalone berperilaku beda di versi iOS tertentu | Uji di perangkat. Cadangan: buka file lewat share sheet |
| Alokasi target melebihi saldo setelah ada pengeluaran | Validasi + peringatan di rekening & target (F14) |
| Hitung ulang bunga lambat jika banyak backdate | Hitung ulang hanya dari tanggal terdampak, per rekening |

## 14. Pertanyaan terbuka

1. Nama aplikasi final? (sementara "Kantong")
2. Rekening NTD perlu bunga juga? Kalau ya, pencairannya tiap kapan?
3. Format NTD: `NT$1.250` (format Indonesia) atau `NT$1,250` (format Taiwan)?
4. Ada bank IDR yang memakai **bunga bertingkat**? Kalau ada, masuk v1.
5. Kategori default sudah cocok?

---

## Lampiran A — Data contoh

Semua angka di desain (Stitch) memakai data ini. **Angka disederhanakan:** saldo rekening berbunga dan bunga harian dianggap tetap sepanjang Oktober.

**Waktu acuan:** Sabtu, 24 Oktober 2026 · 8 hari tersisa (termasuk hari ini) · jadwal ideal 77% · kurs pasar **1 NT$ = Rp512** (otomatis, diperbarui 2 jam lalu) · backup terakhir 2 hari lalu (22 Okt).

### A1. Rekening

| Rekening | Mata uang | Jenis | Saldo | Catatan |
|---|---|---|---|---|
| BCA | IDR | Bank | Rp8.450.000 | — |
| SeaBank | IDR | Bank | Rp14.600.000 | 4% p.a., harian, pajak 20% → **Rp1.280/hari** · ditautkan ke target Dana Darurat · terakhir dicocokkan 21 Okt |
| Bank Jago | IDR | Bank | Rp9.125.000 | 3% p.a., harian, pajak 20% → **Rp600/hari** |
| Dompet NT$ | NTD | Tunai | NT$3.600 | — |
| Bank NT$ | NTD | Bank | NT$21.000 | NT$6.000 dialokasikan ke target Tiket Pulang → bebas dipakai NT$15.000 |

| Total | Nilai |
|---|---|
| Total IDR | Rp32.175.000 (3 rekening) |
| Total NTD | NT$24.600 (2 rekening) → ≈ Rp12.595.200 |
| ≈ Total saldo gabungan | **Rp44.770.200** |
| Piutang | NT$1.500 ≈ Rp768.000 |
| Utang | Rp1.000.000 |
| ≈ Kekayaan bersih | **Rp44.538.200** · +Rp8.947.480 (+25,1%) dari akhir September (≈ Rp35.590.720) |

### A2. Oktober 1–24

| | IDR | NTD |
|---|---|---|
| Masuk | +Rp43.240 (bunga) | +NT$32.000 (gaji) |
| Keluar | −Rp1.080.000 | −NT$12.480 |
| Bersih | −Rp1.036.760 | +NT$19.520 |
| Transfer | +Rp2.550.000 (dari Bank NT$) | −NT$5.000 (ke BCA) |
| Utang / piutang | — | −NT$2.000 dipinjamkan, +NT$500 dibayar |
| **Perubahan saldo bulan ini** | **+Rp1.513.240** | **+NT$13.020** |
| Batas bulanan | Rp2.000.000 → 54% · sisa Rp920.000 · Rp115.000/hari | NT$15.000 → 83% · sisa NT$2.520 · NT$315/hari |

**Bunga Oktober** (1–23 Okt = 23 hari): SeaBank Rp29.440 + Bank Jago Rp13.800 = **Rp43.240**. **Bunga kemarin** (23 Okt): Rp1.280 + Rp600 = **Rp1.880**.

### A3. Pengeluaran per kategori

| NTD | Nominal | % |
|---|---|---|
| Tempat Tinggal / Sewa | NT$5.000 | 40% |
| Makan & Minum | NT$4.380 | 35% |
| Transportasi | NT$1.320 | 11% |
| Belanja Harian | NT$1.294 | 10% |
| Lainnya (2 kategori: Biaya Transfer NT$150 + Lainnya NT$336) | NT$486 | 4% |
| **Total** | **NT$12.480** | 100% |

| IDR | Nominal |
|---|---|
| Hiburan | Rp530.000 |
| Belanja Harian | Rp450.000 |
| Pulsa & Internet | Rp100.000 |
| **Total** | **Rp1.080.000** |

### A4. Budget kategori

| Kategori | Terpakai / Budget | % | Keterangan |
|---|---|---|---|
| Makan & Minum | NT$4.380 / NT$6.000 | 73% (hijau) | Sisa NT$1.620 · NT$202/hari |
| Transportasi | NT$1.320 / NT$1.500 | 88% (kuning) | Sisa NT$180 · NT$22/hari |
| Hiburan | Rp530.000 / Rp500.000 | 106% (merah) | Lewat Rp30.000 |
| Belanja Harian | Rp450.000 / Rp1.000.000 | 45% (hijau) | Sisa Rp550.000 · Rp68.750/hari |

"2 kategori hampir/lewat batas" = Transportasi + Hiburan.

### A5. Transaksi terbaru

| Waktu | Transaksi | Rekening | Nominal |
|---|---|---|---|
| Sab 24 Okt 12:30 | Makan & Minum · Bento siang *(favorit)* | Dompet NT$ | −NT$120 |
| Sab 24 Okt 08:10 | Transportasi · MRT *(favorit)* | Dompet NT$ | −NT$35 |
| Jum 23 Okt (otomatis) | Bunga Tabungan · SeaBank + Bank Jago | — | +Rp1.880 |
| Jum 23 Okt 18:40 | Belanja Harian · PX Mart → **memicu toast 82%** | Bank NT$ | −NT$486 |
| Jum 23 Okt 12:00 | Pulsa & Internet · Paket data *(terjadwal)* | BCA | −Rp100.000 |
| Jum 23 Okt 10:00 | Biaya Transfer | Bank NT$ | −NT$150 |
| Jum 23 Okt 10:00 | Transfer · Kirim ke rumah · kurs 510 | Bank NT$ → BCA | NT$5.000 → Rp2.550.000 |
| Sel 20 Okt | Pembayaran piutang dari Andi | Dompet NT$ | +NT$500 |
| Sab 10 Okt | Dipinjamkan ke Andi | Dompet NT$ | −NT$2.000 |

- Subtotal bersih hari ini: −NT$155. Kemarin: −NT$636 (NT$486 + NT$150) · −Rp98.120 (+Rp1.880 − Rp100.000). Transfer dan utang/piutang tidak masuk subtotal.
- Sebelum transfer 23 Okt: saldo Bank NT$ NT$26.636, saldo BCA Rp6.000.000.
- Toast 23 Okt: setelah biaya transfer, pemakaian NTD NT$11.839 (78%). Setelah PX Mart, NT$12.325 → **82%** · sisa NT$2.675 · 9 hari tersisa → **NT$297/hari** · jadwal ideal 74%.

### A6. Jadwal (terjadwal)

| Nama | Jenis | Rekening | Nominal | Ulangi | Cara catat | Berikutnya |
|---|---|---|---|---|---|---|
| Langganan streaming | Pengeluaran · Hiburan | BCA | Rp65.000 | Tiap tgl 28 | Konfirmasi dulu | 28 Okt · 4 hari lagi |
| Sewa kamar | Pengeluaran · Tempat Tinggal / Sewa | Bank NT$ | NT$5.000 | Tiap tgl 1 | Otomatis | 1 Nov · 8 hari lagi |
| Gaji | Pemasukan · Gaji | Bank NT$ | NT$32.000 | Tiap tgl 5 | Konfirmasi dulu | 5 Nov · 12 hari lagi |
| Paket data | Pengeluaran · Pulsa & Internet | BCA | Rp100.000 | Tiap tgl 23 | Konfirmasi dulu | 23 Nov · 30 hari lagi |

Ringkasan: **sisa Oktober** −Rp65.000 · **November** keluar −NT$5.000 · −Rp165.000, masuk +NT$32.000. Semua pengingat: H-1 09:00.

### A7. Target tabungan

| Target | Mode | Progress | Tenggat | Butuh / bulan | Rata-rata setoran 3 bln | Status | Estimasi tercapai |
|---|---|---|---|---|---|---|---|
| 🛟 Dana Darurat (IDR) | Ikuti saldo SeaBank | Rp14.600.000 / Rp20.000.000 · **73%** | 30 Jun 2027 (8 bulan) | ≈ Rp637.000 + bunga ≈ Rp38.400 | Rp650.000 | Sesuai jadwal | Jun 2027 |
| ✈️ Tiket Pulang (NTD) | Sisihkan dari Bank NT$ | NT$6.000 / NT$15.000 · **40%** | 28 Feb 2027 (4 bulan) | NT$2.250 | NT$2.000 | Di belakang jadwal | Mar 2027 |

Contoh **Sisihkan** NT$2.250 ke Tiket Pulang → NT$8.250 / NT$15.000 · **55%** · bebas dipakai Bank NT$ menjadi NT$12.750.

### A8. Utang & piutang

| Orang | Arah | Nominal | Dibayar | Sisa | Tanggal | Jatuh tempo | Status |
|---|---|---|---|---|---|---|---|
| Andi | Piutang | NT$2.000 (dari Dompet NT$) | NT$500 (20 Okt) | **NT$1.500** (≈ Rp768.000) | 10 Okt | 10 Nov · 17 hari lagi | Sebagian (25%) |
| Kak Dewi | Utang | Rp1.000.000 (ke BCA) | — | **Rp1.000.000** | 15 Sep | 30 Nov · 37 hari lagi | Belum dibayar |

Bagian "Lunas": 2 catatan lama.

### A9. Favorit

| Label | Jenis · Kategori | Rekening | Nominal |
|---|---|---|---|
| Bento | Pengeluaran · Makan & Minum | Dompet NT$ | NT$120 |
| MRT | Pengeluaran · Transportasi | Dompet NT$ | NT$35 |
| Kopi | Pengeluaran · Makan & Minum | Dompet NT$ | NT$65 |
| PX Mart | Pengeluaran · Belanja Harian | Bank NT$ | *(kosong, diisi saat dipakai)* |

### A10. Sesuaikan saldo & hitung uang

- **SeaBank:** saldo di Kantong Rp14.600.000 · saldo asli Rp14.600.380 · selisih **+Rp380**. Penyesuaian sebelumnya: 21 Okt +Rp420.
- **Dompet NT$ (Hitung Uang):** NT$1.000 × 2 · NT$500 × 2 · NT$200 × 0 · NT$100 × 5 · NT$50 × 1 · NT$10 × 3 · NT$5 × 1 · NT$1 × 0 = **NT$3.585** · saldo di Kantong NT$3.600 · selisih **−NT$15**.

### A11. Kondisi Jumat 23 Okt 18:40 (dipakai layar S3)

Tepat setelah PX Mart disimpan. Transaksi Sabtu (Bento, MRT) belum terjadi, dan bunga 23 Okt belum tercatat (baru dihitung saat app dibuka 24 Okt).

| Angka | Nilai |
|---|---|
| Saldo IDR · perubahan bulan ini | Rp32.173.120 · +Rp1.511.360 |
| Saldo NTD · perubahan bulan ini | NT$24.755 · +NT$13.175 |
| ≈ Total gabungan | Rp44.847.680 |
| Bunga kemarin (22 Okt) | +Rp1.880 |
| Batas NTD | NT$12.325 / NT$15.000 · 82% · sisa NT$2.675 · NT$297/hari |
| Batas IDR | Rp1.080.000 / Rp2.000.000 · 54% · sisa Rp920.000 · Rp102.222/hari |
| Jadwal ideal · hari tersisa | 74% · 9 hari |
| Jadwal mendatang | streaming 5 hari lagi · sewa 9 hari lagi · gaji 13 hari lagi |
| Target Dana Darurat | Rp14.598.720 / Rp20.000.000 · 72% |
| Transaksi terakhir | PX Mart, Paket data, Biaya Transfer, Transfer, Bunga Tabungan (22 Okt) |

### A12. Lain-lain

- Draft di layar Tambah Transaksi (S7, belum disimpan): Makan & Minum · "Makan malam" · Dompet NT$ · NT$180 · Hari ini 19:05.
- Saran batas NTD (S20): rata-rata 3 bulan NT$13.900.
- Penyimpanan: 2,4 MB · persistent storage aktif.

---

## Lampiran B — Riwayat perubahan

| Versi | Perubahan |
|---|---|
| 0.1 | Draft awal: rekening multi mata uang, transaksi, bunga harian, sesuaikan saldo, budget, laporan, backup |
| 0.2 | Batas pengeluaran bulanan total per mata uang, naik ke P0 |
| 0.3 | Tambah favorit (P0), target tabungan, tagihan terjadwal, utang/piutang, hitung uang cash, kekayaan bersih, buka cepat, dan pengingat lewat Kalender (P1). Siri/Shortcuts dikeluarkan (tidak didukung iOS untuk PWA). Kurs manual naik ke P0, laporan dibagi dasar (P0) / lanjutan (P1). Tambah Bagian 6 (aturan hitung) dan Lampiran A (data contoh). Penomoran fitur & layar dirapikan. Koreksi: 24 Okt 2026 adalah hari Sabtu; angka bunga disesuaikan dengan jumlah hari |
| 0.3.5 | Pengamanan: CSP + header keamanan otomatis saat build, validasi file restore, ID aman di konteks non-HTTPS, skrip uji serangan, SECURITY.md |
| 0.3.4 | Onboarding langkah 2: rekening bisa ditambah, diubah, dan dihapus (dengan Urungkan); catatan privasi di langkah itu dihapus |
| 0.3.3 | Logo resmi (maskot Si Kantong dengan koin kawung & bunga plum) jadi ikon app. Tambah animasi pembuka |
| 0.3.2 | v1.0 dibangun. Grafik pakai SVG sendiri (bukan Recharts). Onboarding: tambah "Coba dengan data contoh" dan "Pulihkan dari backup" |
| 0.3.1 | Desain 21 layar dibuat di Stitch. Label jenis rekening "Cash" → **Tunai**. Tambah Lampiran A11 (kondisi Jumat 23 Okt 18:40 untuk layar S3) |
