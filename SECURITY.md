# Keamanan Kantong

Dokumen ini menjelaskan **bagaimana Kantong dilindungi**, **kenapa** tiap lapisan ada, dan **cara mengujinya sendiri**. Ditulis sekaligus sebagai bahan belajar keamanan siber.

> Prinsip utama: **defense in depth**. Tidak ada satu pertahanan yang sempurna, jadi kita pasang beberapa lapis. Kalau satu lapis jebol, lapis berikutnya masih menahan.

---

## 1. Model ancaman (*threat model*)

Langkah pertama keamanan: tentukan **apa yang dilindungi** dan **dari siapa**.

**Aset yang dilindungi**

| Aset | Di mana | Kenapa penting |
|---|---|---|
| Data keuangan | IndexedDB di iPhone | Saldo, transaksi, kebiasaan belanja |
| File backup | iCloud Drive (JSON) | Berisi **semua** data di atas |
| Kode app | Hosting (Cloudflare Pages) | Kalau diganti penyerang, app palsu bisa mencuri data |
| Akun Cloudflare / GitHub | Internet | Kunci untuk mengganti kode app |

**Ancaman dan pertahanannya**

| Ancaman | Dampak | Pertahanan di Kantong |
|---|---|---|
| Server/database dibobol | Data bocor massal | **Tidak ada server & database.** Data tidak pernah meninggalkan iPhone (permukaan serangan minimal) |
| XSS: kode jahat lewat input | Membaca data lalu mengirimnya keluar | React meng-*escape* teks, CSP `script-src 'self'`, validasi file backup |
| Exfiltration: data dikirim ke server penyerang | Data bocor | CSP `connect-src 'self'` |
| Clickjacking: app ditanam di iframe situs lain | Pengguna tertipu klik | CSP `frame-ancestors 'none'` + `X-Frame-Options: DENY` |
| Man-in-the-middle / downgrade ke HTTP | Kode disisipi di jalan | HTTPS + HSTS + `upgrade-insecure-requests` |
| MIME sniffing | File dianggap skrip | `X-Content-Type-Options: nosniff` |
| Kebocoran alamat lewat Referer | Privasi | `Referrer-Policy: no-referrer` |
| Penyalahgunaan kamera/mikrofon/lokasi | Privasi | `Permissions-Policy` mematikan semuanya |
| Supply chain: library atau CDN disusupi | Kode jahat ikut masuk | Tanpa CDN (font di-*host* sendiri), lockfile, `npm audit`, dependency minim |
| **Akun hosting dibobol** | App palsu ter-deploy | **2FA/passkey** + checklist di Bagian 5 + respons insiden di Bagian 6 |
| File backup bocor | Semua data terbaca | Sementara: iCloud *Advanced Data Protection*. Rencana: backup terenkripsi |
| iPhone hilang | Data terbaca | Passcode/Face ID iPhone. Rencana: kunci app |

---

## 2. Lapisan pertahanan

### 2.1 Content Security Policy (CSP)

CSP adalah daftar **sumber yang diizinkan** untuk tiap jenis konten. Browser menolak semua yang tidak ada di daftar. CSP Kantong dibuat otomatis oleh [vite.security.ts](vite.security.ts) setiap `npm run build`, lalu dikirim lewat dua jalur: tag `<meta>` di `index.html` dan header HTTP di `dist/_headers`.

| Direktif | Nilai | Yang dicegah |
|---|---|---|
| `default-src` | `'self'` | Semua jenis konten hanya boleh dari domain sendiri |
| `script-src` | `'self'` | Skrip inline yang disuntikkan, `eval()`, `new Function()`, skrip dari domain lain |
| `style-src` | `'self'` + hash SHA-256 | Hanya satu `<style>` inline (layar pembuka) yang diizinkan lewat **hash**-nya. CSS lain yang disuntikkan ditolak |
| `connect-src` | `'self'` | `fetch`/XHR/WebSocket ke server lain. **Inilah yang mencegah data dikirim keluar** |
| `img-src`, `font-src` | `'self'` | Gambar/font dari luar, termasuk `data:` URL |
| `object-src` | `'none'` | Plugin lama (Flash, `<embed>`) |
| `base-uri` | `'none'` | Injeksi `<base>` yang membelokkan semua link relatif |
| `form-action` | `'none'` | Form yang dibajak untuk mengirim data |
| `frame-ancestors` | `'none'` | App dimasukkan ke iframe situs lain (clickjacking) |
| `upgrade-insecure-requests` | — | Permintaan `http://` otomatis dinaikkan ke `https://` |

**Pelajaran dari pengujian:** saat diuji, CSP sempat memblokir satu file font. Ternyata Vite menyisipkan font kecil sebagai `data:` URL. Solusi yang benar adalah **mematikan penyisipan itu** (`assetsInlineLimit: 0`), bukan melonggarkan CSP dengan menambahkan `data:`. Melonggarkan aturan demi kenyamanan adalah kesalahan keamanan yang paling sering terjadi.

**Kenapa pakai hash, bukan `'unsafe-inline'`?** `'unsafe-inline'` mengizinkan *semua* style/skrip inline, termasuk milik penyerang. Hash hanya mengizinkan konten yang **persis sama byte-per-byte** dengan yang kita tulis.

### 2.2 Header keamanan HTTP lainnya

Header ini ada di `dist/_headers`. Cloudflare Pages dan Netlify membacanya otomatis.

| Header | Nilai | Fungsi |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Browser **wajib** pakai HTTPS selama 2 tahun, jadi serangan *SSL stripping* gagal. Domain `.dev` (termasuk `pages.dev`) bahkan sudah ada di daftar HSTS bawaan browser |
| `X-Content-Type-Options` | `nosniff` | Browser tidak menebak jenis file, jadi file teks tidak bisa dijalankan sebagai skrip |
| `X-Frame-Options` | `DENY` | Versi lama dari `frame-ancestors`, untuk browser lama |
| `Referrer-Policy` | `no-referrer` | Alamat app tidak dikirim ke situs lain |
| `Permissions-Policy` | kamera, mikrofon, lokasi, pembayaran, dll. `=()` | Fitur perangkat dimatikan total. Kantong tidak butuh, jadi kode jahat pun tidak bisa memakainya |
| `Cross-Origin-Opener-Policy` | `same-origin` | Jendela dari situs lain tidak bisa memegang referensi ke app (mencegah serangan lintas-jendela) |
| `Cross-Origin-Resource-Policy` | `same-origin` | File app tidak bisa disematkan oleh situs lain |
| `X-Robots-Tag` + `robots.txt` | `noindex, nofollow` | App tidak muncul di Google. Ini bukan pertahanan utama (*security through obscurity*), tapi mengurangi perhatian yang tidak perlu |

**Cache:** `index.html`, `sw.js`, dan `manifest` memakai `no-cache`, supaya **perbaikan keamanan langsung sampai** ke iPhone. File di `/assets/` boleh di-cache setahun karena namanya mengandung hash (`index-DlPqB0vh.js`), jadi isi baru selalu mendapat nama baru.

### 2.3 Validasi input (restore backup)

Restore adalah **satu-satunya pintu masuk data dari luar**. Prinsipnya: *never trust input*. [validateBackup()](src/lib/backup.ts) memeriksa:

- **Allowlist:** mata uang hanya `IDR`/`NTD`, jenis transaksi hanya yang dikenal.
- **Tipe data:** nominal harus bilangan bulat, tanggal harus berformat `YYYY-MM-DDTHH:mm`.
- **Batas ukuran:** file maksimal 20 MB, teks maksimal 500 karakter (mencegah serangan memori).
- **Integritas referensi:** transaksi harus menunjuk ke rekening yang ada.
- **ID unik:** tidak boleh ada ID ganda.

Teks seperti `<img src=x onerror=alert(1)>` tetap disimpan sebagai **teks biasa**. React menampilkannya sebagai huruf, bukan HTML, jadi tidak pernah dijalankan.

### 2.4 Konteks aman & kriptografi

`crypto.randomUUID()` hanya tersedia di **secure context** (HTTPS atau `localhost`). Kantong punya cadangan memakai `crypto.getRandomValues()`, generator acak yang aman secara kriptografi. Jangan pernah memakai `Math.random()` untuk ID atau kunci: hasilnya bisa ditebak.

### 2.5 Supply chain (rantai pasok)

- **Tidak ada CDN pihak ketiga.** Font Plus Jakarta Sans di-*host* sendiri. Kalau sebuah CDN dibobol, Kantong tidak ikut terdampak.
- **`package-lock.json`** mengunci versi persis setiap library.
- **`npm run audit`** mengecek kerentanan yang diketahui. Saat ini hasilnya 0.
- **Dependency minim:** React, Dexie, React Router, ikon. Tidak memakai library chart.
- **Tidak ada rahasia di repo.** API key (contoh: kunci Stitch) disimpan di konfigurasi lokal, bukan di folder project.

---

## 3. Hasil uji serangan

Dijalankan dengan `npm run test:attack` terhadap build produksi yang dilayani dengan header asli.

| Pemeriksaan | Hasil |
|---|---|
| 6 header keamanan terkirim | ✅ |
| Pemakaian normal tanpa pelanggaran CSP | ✅ |
| Stored XSS (`<img onerror>` di catatan) tidak tereksekusi | ✅ |
| Kirim data ke `attacker.example` diblokir | ✅ |
| Suntik `<script>` inline diblokir | ✅ |
| `eval()` dan `new Function()` diblokir | ✅ |
| App di-iframe oleh situs lain diblokir | ✅ |

---

## 4. Latihan: uji sendiri

**a. Jalankan simulasi serangan**

```bash
npx playwright install chromium   # sekali saja
npm run build
npm run serve:secure              # terminal 1: http://localhost:4174 dengan header asli
npm run test:attack               # terminal 2
```

**b. Lihat header dengan `curl`**

```bash
curl -I http://localhost:4174/
```

**c. DevTools browser** (Chrome: `Cmd+Option+I`)

- **Network** → klik `localhost` → **Response Headers**: lihat CSP, HSTS, dll.
- **Console:** ketik `fetch('https://example.com')`, lalu lihat pesan *"Refused to connect… Content Security Policy"*.
- **Application → IndexedDB → kantong:** di sinilah data tersimpan. Perhatikan bahwa tidak ada data di server.

**d. Coba serang sendiri**

- Ketik `<img src=x onerror=alert(1)>` di kolom Catatan, lalu simpan. Hasilnya tampil sebagai teks, tidak ada alert.
- Export backup, ubah `"currency": "IDR"` jadi `"USD"` di salah satu rekening, lalu restore. File akan ditolak.

**e. Setelah online:** cek alamatmu di [securityheaders.com](https://securityheaders.com) dan [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory). Targetnya nilai **A** atau lebih tinggi.

---

## 5. Checklist akun & perangkat (paling penting)

CSP tidak bisa melindungi dari **hosting yang dibobol**, karena penyerang yang menguasai akun bisa mengganti header juga. Karena itu **keamanan akun adalah pertahanan terpenting.**

- [ ] Password **unik** untuk Cloudflare dan GitHub, disimpan di password manager (iCloud Keychain sudah cukup).
- [ ] **2FA** aktif, sebaiknya **passkey**. Kalau tidak bisa, pakai aplikasi authenticator. Hindari SMS.
- [ ] **Recovery codes** disimpan offline (dicetak atau di catatan terkunci).
- [ ] Notifikasi login baru aktif. Cek dan hapus berkala sesi, API token, dan SSH key yang tidak dipakai.
- [ ] iPhone: passcode minimal 6 digit + Face ID, iOS selalu ter-update, tidak di-*jailbreak*.
- [ ] iCloud: aktifkan **Advanced Data Protection** supaya file backup terenkripsi end-to-end.

---

## 6. Kalau akun dibobol (respons insiden)

1. **Kunci akun:** ganti password, cabut semua sesi, API token, SSH key, dan deploy key.
2. **Periksa** riwayat deploy di Cloudflare Pages. Cari deploy yang bukan buatanmu.
3. **Rollback** ke deploy terakhir yang kamu buat, atau build ulang dari laptop lalu deploy ulang.
4. **Jangan buka Kantong** di iPhone sampai deploy bersih sudah terpasang.
5. **Evaluasi:** bagaimana penyerang masuk? Perbaiki celahnya (misalnya password dipakai ulang, atau 2FA belum aktif).

---

## 7. Batasan & rencana berikutnya

| Batasan | Rencana |
|---|---|
| File backup JSON belum terenkripsi | Backup terenkripsi **AES-256-GCM** dengan kunci dari kata sandi (**PBKDF2**), lewat WebCrypto bawaan browser |
| Belum ada kunci app | PIN atau Face ID lewat **passkey/WebAuthn** (PRD F23) |
| Domain sendiri belum ada | Opsional: HSTS preload untuk domain pribadi |
| — | Opsional: **Trusted Types** untuk lapisan anti-XSS tambahan |

---

## 8. Deploy aman (Vercel)

Kantong di-deploy ke **https://kantong-p1k2.vercel.app** dari repo GitHub privat `latverian/kantong`.

1. Akun GitHub dan Vercel memakai **2FA** (passkey atau kode dari app Passwords iPhone).
2. Izin GitHub App Vercel dibatasi ke **satu repo saja** (*Only select repositories → kantong*). Ini prinsip *least privilege*.
3. Setiap `git push` ke `main`:
   - **GitHub Actions** menjalankan test, build (gagal kalau `vercel.json` tidak sinkron dengan CSP), `npm audit`, dan simulasi serangan.
   - **Vercel** build dan deploy otomatis. Header keamanan dibaca dari `vercel.json`.
4. Cek setelah deploy:
   ```bash
   curl -I https://kantong-p1k2.vercel.app
   node scripts/attack-test.mjs https://kantong-p1k2.vercel.app   # 11 pemeriksaan (eval hanya di lokal/CI)
   ```
5. Alamat internal deployment (misalnya `kantong-latverian.vercel.app`) dilindungi **Vercel Authentication**. Hanya pemilik akun yang bisa membukanya.
6. **Waspada domain mirip.** `kantong.vercel.app` dan `kantongku.vercel.app` adalah app **orang lain**. Selalu pasang dari `kantong-p1k2.vercel.app`.

**Rollback** (misalnya saat respons insiden): Vercel → project → **Deployments** → pilih deploy lama yang aman → **Promote to Production**.

**Alternatif hosting:** Cloudflare Pages atau Netlify. Cukup upload folder `dist/`; keduanya membaca `dist/_headers` yang dibuat saat build.
