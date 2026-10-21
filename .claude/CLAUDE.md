# ATM Cash Monitor (demo)

Aplikasi demo untuk workshop. Semua data dummy. Bukan produk Hitachi atau bank mana pun.

## Stack
- Next.js (App Router, TypeScript) + Tailwind
- Supabase (Postgres) untuk data, akses dari server memakai `@supabase/supabase-js`
- Vitest untuk unit test logika di `lib/`
- Deploy: Vercel, terhubung ke GitHub. Setiap PR mendapat Preview URL, merge ke `main` = produksi

## Perintah
- `npm run dev`: jalankan lokal di http://localhost:3000
- `npm test`: Vitest, wajib hijau sebelum commit
- `npm run build`: wajib lolos sebelum membuka PR

## Aturan kerja
- Requirement ada di `docs/prd/`. Acceptance criteria (AC) adalah sumber kebenaran.
- **Test dulu.** Expected value diambil dari AC di PRD, bukan dari code. Pastikan test baru gagal dulu, baru implementasi.
- Logika bisnis (status kas, validasi nominal, transisi status) ditulis sebagai fungsi murni di `lib/` dan diuji.
- Setiap tabel Supabase wajib RLS. Tulis data hanya dari server, jangan dari browser.
- Kunci Supabase hanya di `.env.local` dan Environment Variables Vercel. Jangan pernah ditulis di code atau di-commit.
- Perubahan migrasi database disimpan di `supabase/migrations/`.
- Halaman yang menampilkan data Supabase harus membaca data saat request, bukan dibekukan saat build. Cek caranya di docs Next.js versi ini (lihat aturan Next.js di bawah).
- Kerjakan fitur di branch baru, lalu buka PR berisi ringkasan, risiko, dan output test.
- Setiap PR fitur wajib memperbarui README (daftar fitur), `docs/CHANGELOG.md`, dan `docs/design/`. PR tanpa update dokumentasi belum selesai.
- **Jangan pernah merge PR.** Merge diputuskan manusia.

## Aturan Next.js
Aturan resmi Next.js untuk agent (dibuat oleh `create-next-app`):

@../AGENTS.md

## Format
- Nominal selalu integer rupiah, tampil sebagai `Rp150.000`.
- Teks UI dalam bahasa Indonesia.
