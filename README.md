# TIS Pioneer Plaque - Membership Portal

Sistem membership digital untuk **The Innovators Studio (TIS)** yang terintegrasi dengan Pioneer Plaque fisik. Setiap plaque memiliki QR code unik (digarap oleh vendor Shieldtag) yang menghubungkan pemilik ke sertifikat digital, community group, dan portal keanggotaan eksklusif.

---

## Daftar Isi

- [Alur Pengguna](#alur-pengguna)
- [Tech Stack](#tech-stack)
- [Instalasi & Setup](#instalasi--setup)
- [Menjalankan Project](#menjalankan-project)
- [Struktur Project](#struktur-project)
- [Halaman & Routes](#halaman--routes)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Komponen](#komponen)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Panduan Deployment](#panduan-deployment)
- [Pengelolaan Data Member](#pengelolaan-data-member)
- [Kustomisasi](#kustomisasi)
- [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Alur Pengguna

```
Pioneer Plaque (fisik)
       |
       | [scan QR code Shieldtag]
       v
+---------------------------+
| /pioneer/TIS-XXXX         |
| Tab 1: Certificate        |  <-- Sertifikat digital (Pioneer Identity,
| Tab 2: Pioneer Access     |      Certificate of Authenticity)
+---------------------------+
       |
       | Tab 2 menampilkan:
       | - Unique Code (8 karakter)
       | - Tombol "Join Community Group" (WhatsApp)
       | - Tombol "Go to TIS Website"
       |
       v
+---------------------------+
| /login                    |
| Input unique code         |  <-- User masukkan unique code dari plaque
+---------------------------+
       |
       | [pertama kali]          | [sudah terdaftar]
       v                        v
+---------------------------+  +---------------------------+
| /register                 |  | /membership               |
| Isi data diri:            |  | - QR Code keanggotaan     |
| - Username (ganti default)|  | - Nama & username         |
| - Nama lengkap            |  | - Member benefits         |
| - Email, telepon          |  | - Detail data diri        |
| - Alamat, tanggal lahir   |  | - Tombol Community Group  |
| - Bio                     |  | - Edit Profile / Logout   |
+---------------------------+  +---------------------------+
       |                               |
       | [save]                        | [QR di-scan partner]
       v                               v
+---------------------------+  +---------------------------+
| /membership               |  | /verify/TIS-XXXX          |
| (sama seperti di atas)    |  | Verifikasi keanggotaan    |
+---------------------------+  | (hijau = aktif,           |
                               |  kuning = belum registrasi)|
                               +---------------------------+
```

### Ringkasan Alur:
1. **Scan QR di plaque** -> Muncul sertifikat digital + unique code
2. **Masuk ke website TIS** -> Input unique code untuk login
3. **Pertama kali** -> Isi data diri, ganti username
4. **Setelah registrasi** -> Muncul QR Code keanggotaan + detail member
5. **QR Membership di-scan partner** -> Verifikasi bahwa orang ini member TIS

---

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 14.2 | Framework React (App Router) |
| **React** | 18.3 | UI Library |
| **TypeScript** | 5.6 | Type safety |
| **Tailwind CSS** | 3.4 | Styling utility-first |
| **SQLite** (better-sqlite3) | 11.7 | Database (file-based) |
| **qrcode** | 1.5 | Generate QR code membership |
| **tsx** | 4.19 | Menjalankan TypeScript script (seed) |

---

## Instalasi & Setup

### Prasyarat
- **Node.js** >= 18.x
- **npm** >= 9.x

### Langkah Instalasi

```bash
# 1. Clone / masuk ke folder project
cd tis-pioneer

# 2. Install dependencies
npm install

# 3. Seed database (buat 500 pioneer: TIS-0001 s/d TIS-0500)
npm run seed

# 4. Jalankan development server
npm run dev
```

Server akan berjalan di `http://localhost:3000`.

---

## Menjalankan Project

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan development server (port 3000) |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run seed` | Seed database dengan 500 data pioneer |

---

## Struktur Project

```
tis-pioneer/
├── public/
│   ├── tis-logo.png              # Logo TIS (gambar asli)
│   └── tis-logo.svg              # Logo TIS (SVG fallback)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (metadata, font, background)
│   │   ├── globals.css           # Global styles & custom CSS classes
│   │   ├── page.tsx              # Home (redirect ke /login)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx          # Halaman login (input unique code)
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx          # Halaman registrasi / edit profil
│   │   │
│   │   ├── membership/
│   │   │   └── page.tsx          # Halaman kartu keanggotaan + QR
│   │   │
│   │   ├── pioneer/
│   │   │   └── [code]/
│   │   │       └── page.tsx      # Landing page QR Shieldtag (sertifikat)
│   │   │
│   │   ├── verify/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Halaman verifikasi membership (publik)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts      # POST login, GET cek session, DELETE logout
│   │       ├── register/
│   │       │   └── route.ts      # POST registrasi / update profil
│   │       ├── membership/
│   │       │   └── route.ts      # GET data membership + QR code
│   │       └── pioneer/
│   │           └── [code]/
│   │               └── route.ts  # GET data pioneer (publik)
│   │
│   ├── components/
│   │   ├── TISLogo.tsx           # Komponen logo TIS (3 ukuran)
│   │   └── OriginalBadge.tsx     # Badge "Original Product" (seal)
│   │
│   └── lib/
│       ├── db.ts                 # Inisialisasi DB, query functions, types
│       └── seed.ts               # Script seed 500 pioneer
│
├── tis-pioneer.db                # SQLite database (auto-generated)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── README.md                     # Dokumentasi ini
```

---

## Halaman & Routes

### Halaman Publik (tanpa login)

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/pioneer/[code]` | Pioneer Certificate | Landing page dari QR Shieldtag. Dua tab: **Certificate** (sertifikat keaslian) dan **Pioneer Access** (unique code + tombol aksi). Contoh: `/pioneer/TIS-0001` |
| `/login` | Login | Form input unique code 8 karakter untuk masuk ke portal |
| `/verify/[id]` | Verify Member | Halaman verifikasi keanggotaan saat QR membership di-scan. Tampil hijau jika aktif, kuning jika belum registrasi. Contoh: `/verify/TIS-0001` |

### Halaman Private (perlu login)

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/register` | Register / Edit Profile | Form isi data diri. Username default = Pioneer ID, bisa diganti. Setelah save, redirect ke membership |
| `/membership` | Membership Card | QR code keanggotaan, nama, username, badge, benefits, detail data diri. Ada tombol Edit Profile dan Logout |

### Alur Redirect

| Kondisi | Redirect |
|---------|----------|
| Belum login, akses `/register` atau `/membership` | -> `/login` |
| Sudah login, belum registrasi, akses `/membership` | -> `/register` |
| Sudah login & registrasi, login lagi | -> `/membership` |
| Belum registrasi, login pertama kali | -> `/register` |

---

## API Endpoints

### `POST /api/auth` - Login

Login menggunakan unique code dari Pioneer Plaque.

**Request:**
```json
{
  "unique_code": "5X5P832H"
}
```

**Response (200):**
```json
{
  "success": true,
  "pioneer_id": "TIS-0001",
  "registered": false
}
```

**Side Effect:** Set cookie `tis_session` (HTTP-only, 30 hari)

**Error Codes:**
- `400` - Unique code tidak dikirim
- `401` - Unique code tidak valid

---

### `GET /api/auth` - Cek Session

Cek apakah user sedang login dan ambil data profil.

**Response (200):**
```json
{
  "authenticated": true,
  "pioneer_id": "TIS-0001",
  "registered": true,
  "full_name": "John Pioneer",
  "username": "john_pioneer",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "address": "Jakarta, Indonesia",
  "birth_date": "1990-05-15",
  "bio": "Early adopter",
  "batch_number": "BATCH-01",
  "claim_status": "CLAIMED",
  "claim_date": "2026-05-19T04:02:38.000Z"
}
```

**Error:** `401` jika tidak ada session aktif

---

### `DELETE /api/auth` - Logout

Hapus session dan clear cookie.

**Response (200):**
```json
{
  "success": true
}
```

---

### `POST /api/register` - Registrasi / Update Profil

Simpan atau update data diri pioneer. Memerlukan session aktif.

**Request:**
```json
{
  "full_name": "John Pioneer",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "address": "Jakarta, Indonesia",
  "birth_date": "1990-05-15",
  "username": "john_pioneer",
  "bio": "Early adopter of TIS"
}
```

**Validasi:**
- `full_name`, `email`, `phone`, `username` wajib diisi
- Username: 3-30 karakter, hanya huruf, angka, dan underscore (`[a-zA-Z0-9_]`)
- Username harus unik (tidak boleh sama dengan pioneer lain)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile saved successfully"
}
```

**Error Codes:**
- `400` - Validasi gagal
- `401` - Tidak ada session
- `409` - Username sudah dipakai

---

### `GET /api/membership` - Data Membership + QR Code

Ambil data membership lengkap beserta QR code (data URL). Memerlukan session aktif dan sudah registrasi.

**Response (200):**
```json
{
  "pioneer_id": "TIS-0001",
  "username": "john_pioneer",
  "full_name": "John Pioneer",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "address": "Jakarta, Indonesia",
  "birth_date": "1990-05-15",
  "bio": "Early adopter",
  "batch_number": "BATCH-01",
  "claim_status": "CLAIMED",
  "claim_date": "2026-05-19T04:02:38.000Z",
  "registered_at": "2026-05-19T04:02:38.000Z",
  "qr_code": "data:image/png;base64,...",
  "membership_url": "http://localhost:3000/verify/TIS-0001"
}
```

**Error Codes:**
- `401` - Tidak ada session
- `403` - Belum registrasi

---

### `GET /api/pioneer/[code]` - Data Pioneer (Publik)

Ambil data pioneer berdasarkan Pioneer ID. Tidak perlu login.

**Contoh:** `GET /api/pioneer/TIS-0001`

**Response (200):**
```json
{
  "pioneer_id": "TIS-0001",
  "unique_code": "5X5P832H",
  "batch_number": "BATCH-01",
  "claim_status": "CLAIMED",
  "claim_date": "2026-05-19T04:02:38.000Z",
  "full_name": "John Pioneer",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "username": "john_pioneer",
  "registered": true
}
```

**Error:** `404` jika pioneer tidak ditemukan

---

## Database Schema

Database menggunakan **SQLite** dengan file `tis-pioneer.db` di root project.

### Tabel `pioneers`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Primary key, auto-increment |
| `pioneer_id` | TEXT | ID pioneer, format `TIS-XXXX` (unique) |
| `unique_code` | TEXT | Kode login 8 karakter random (unique) |
| `batch_number` | TEXT | Nomor batch, default `BATCH-01` |
| `claim_status` | TEXT | Status klaim: `UNCLAIMED` atau `CLAIMED` |
| `claim_date` | TEXT | Tanggal klaim (ISO 8601) |
| `full_name` | TEXT | Nama lengkap (diisi saat registrasi) |
| `email` | TEXT | Alamat email |
| `phone` | TEXT | Nomor telepon |
| `address` | TEXT | Alamat (opsional) |
| `birth_date` | TEXT | Tanggal lahir (opsional) |
| `username` | TEXT | Username pilihan user (unique) |
| `bio` | TEXT | Bio singkat (opsional) |
| `registered_at` | TEXT | Tanggal registrasi (ISO 8601) |
| `created_at` | TEXT | Tanggal record dibuat |

### Tabel `sessions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Primary key, auto-increment |
| `token` | TEXT | Token session 64 karakter random (unique) |
| `pioneer_id` | TEXT | FK ke `pioneers.pioneer_id` |
| `created_at` | TEXT | Tanggal session dibuat |
| `expires_at` | TEXT | Tanggal kedaluwarsa (30 hari dari pembuatan) |

### Statistik Data Seed

- **500 pioneer** di-seed (TIS-0001 s/d TIS-0500)
- Semua batch: `BATCH-01`
- Semua status awal: `UNCLAIMED`
- Unique code: 8 karakter alfanumerik tanpa karakter ambigu (tanpa 0/O, 1/I/L)

---

## Komponen

### `TISLogo`
Logo TIS yang reusable dengan 3 ukuran.

```tsx
import TISLogo from '@/components/TISLogo';

<TISLogo size="sm" />  // 40x40px
<TISLogo size="md" />  // 80x80px (default)
<TISLogo size="lg" />  // 128x128px
```

- Menggunakan gambar dari `/public/tis-logo.png`
- Fallback otomatis ke `/public/tis-logo.svg` jika PNG gagal dimuat
- Ditampilkan sebagai lingkaran (`rounded-full`)

### `OriginalBadge`
Badge seal "Original Product" untuk sertifikat.

```tsx
import OriginalBadge from '@/components/OriginalBadge';

<OriginalBadge />  // 80x80px, fixed size
```

- CSS clip-path berbentuk gear/seal
- Gradient abu-abu gelap
- Text "Original" (italic serif) + "Product" (small caps)

---

## Konfigurasi Environment

### Environment Variables

Buat file `.env.local` di root project:

```env
# URL dasar untuk generate QR code membership
# Ganti dengan domain production saat deploy
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Node environment (otomatis di-set oleh hosting)
# production = cookie HTTPS-only
NODE_ENV=production
```

| Variable | Required | Default | Keterangan |
|----------|----------|---------|------------|
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | Base URL untuk QR membership |
| `NODE_ENV` | No | `development` | `production` untuk cookie secure |

---

## Panduan Deployment

### Deploy ke Vercel (Rekomendasi)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variable
vercel env add NEXT_PUBLIC_BASE_URL
# Masukkan: https://your-domain.vercel.app
```

> **Catatan:** SQLite bersifat file-based. Untuk production skala besar, pertimbangkan migrasi ke PostgreSQL atau gunakan Turso (SQLite edge).

### Deploy Manual (VPS/Server)

```bash
# 1. Build
npm run build

# 2. Seed database (jika pertama kali)
npm run seed

# 3. Jalankan
npm run start
```

### Checklist Sebelum Production

- [ ] Ganti `NEXT_PUBLIC_BASE_URL` dengan domain production
- [ ] Ganti link WhatsApp group (`YOUR_GROUP_LINK`) di:
  - `src/app/pioneer/[code]/page.tsx` (baris tombol WhatsApp)
  - `src/app/membership/page.tsx` (baris tombol WhatsApp)
- [ ] Pastikan `NODE_ENV=production` untuk cookie secure (HTTPS)
- [ ] Backup file `tis-pioneer.db` secara berkala
- [ ] (Opsional) Migrasi database ke PostgreSQL untuk skala besar

---

## Pengelolaan Data Member

### Melihat Semua Pioneer

```bash
cd tis-pioneer
sqlite3 tis-pioneer.db "SELECT pioneer_id, unique_code, claim_status, full_name FROM pioneers ORDER BY id"
```

### Melihat Pioneer yang Sudah Registrasi

```bash
sqlite3 tis-pioneer.db "SELECT pioneer_id, username, full_name, email, registered_at FROM pioneers WHERE registered_at IS NOT NULL"
```

### Melihat Statistik

```bash
sqlite3 tis-pioneer.db "
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN claim_status = 'CLAIMED' THEN 1 ELSE 0 END) as claimed,
    SUM(CASE WHEN registered_at IS NOT NULL THEN 1 ELSE 0 END) as registered
  FROM pioneers
"
```

### Export Data ke CSV

```bash
sqlite3 -header -csv tis-pioneer.db "SELECT pioneer_id, unique_code, batch_number, claim_status, full_name, email, phone, username FROM pioneers ORDER BY id" > pioneers_export.csv
```

### Menambah Batch Baru (misal BATCH-02)

Edit `src/lib/seed.ts`, ubah:
- `seedCount` = jumlah pioneer baru
- `batch_number` = `'BATCH-02'`
- Mulai dari nomor setelah batch sebelumnya

Atau langsung via SQL:
```bash
sqlite3 tis-pioneer.db "INSERT INTO pioneers (pioneer_id, unique_code, batch_number) VALUES ('TIS-0501', 'NEWCODE1', 'BATCH-02')"
```

---

## Kustomisasi

### Mengganti Logo

Ganti file `public/tis-logo.png` dengan gambar logo baru. Komponen `TISLogo` akan otomatis menggunakan file PNG terbaru. Format yang didukung: PNG, JPEG, WebP.

### Mengganti Warna Tema

Edit `src/app/globals.css`:
- `.bg-premium` - Background utama aplikasi
- `.bg-premium-dark` - Background gelap
- `.glass-card` - Efek glassmorphism pada card

### Mengganti Link WhatsApp

Cari `YOUR_GROUP_LINK` di dua file:
1. `src/app/pioneer/[code]/page.tsx`
2. `src/app/membership/page.tsx`

Ganti dengan link WhatsApp group yang sebenarnya:
```
https://chat.whatsapp.com/XXXXXXXXXXXXX
```

### Menambah Field Data Diri

1. Tambah kolom di `src/lib/db.ts` (fungsi `initDb` dan interface `Pioneer`)
2. Tambah field di form `src/app/register/page.tsx`
3. Tambah display di `src/app/membership/page.tsx`
4. Update API `src/app/api/register/route.ts`

### Menambah Member Benefits

Edit `src/app/membership/page.tsx`, cari bagian `BenefitItem`:
```tsx
<BenefitItem icon="🏷️" label="Partner Discounts" />
<BenefitItem icon="🎫" label="Exclusive Events" />
// Tambah benefit baru di sini
```

---

## FAQ & Troubleshooting

### Q: Bagaimana cara kerja QR code di Pioneer Plaque?
**A:** QR code pada plaque (digarap vendor Shieldtag) mengarah ke URL `/pioneer/TIS-XXXX`. Saat di-scan, muncul 2 tab: sertifikat digital dan halaman akses (unique code + tombol).

### Q: Apa bedanya Pioneer ID dan Unique Code?
**A:**
- **Pioneer ID** (`TIS-0001`): Identitas publik, tercetak di plaque, digunakan di URL
- **Unique Code** (`5X5P832H`): Kode rahasia untuk login, hanya muncul setelah scan QR

### Q: User lupa unique code-nya?
**A:** Scan ulang QR code di Pioneer Plaque -> Tab "Pioneer Access" -> unique code akan ditampilkan.

### Q: Bagaimana partner memverifikasi keanggotaan?
**A:** Member tunjukkan QR code dari halaman `/membership` -> Partner scan -> Muncul halaman `/verify/TIS-XXXX` yang menampilkan status keanggotaan (hijau = aktif).

### Q: Database error saat menjalankan?
**A:** Hapus file `tis-pioneer.db`, `tis-pioneer.db-shm`, `tis-pioneer.db-wal`, lalu jalankan `npm run seed` ulang.

### Q: Port 3000 sudah dipakai?
**A:** Jalankan `npx next dev -p 3001` atau kill proses yang menggunakan port 3000:
```bash
lsof -ti :3000 | xargs kill
```

### Q: Bagaimana cara menambah pioneer di luar seed script?
**A:** Gunakan SQL langsung:
```bash
sqlite3 tis-pioneer.db "INSERT INTO pioneers (pioneer_id, unique_code, batch_number) VALUES ('TIS-0501', 'ABCD1234', 'BATCH-02')"
```

---

## Lisensi

Copyright 2026 The Innovators Studio. All rights reserved.
