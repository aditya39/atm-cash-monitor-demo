# Changelog

Semua perubahan penting di project ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

## [Belum dirilis]

### Ditambahkan

- **Dashboard sisa kas ATM (PRD v1).** Desain: [docs/design/v1.md](design/v1.md).
  - Status Kritis, Waspada, dan Aman per ATM dengan badge berteks. Kapasitas 0 tetap Kritis.
  - Daftar terurut dari persentase sisa kas terendah, seri diurutkan berdasarkan ID.
  - Level kas per ATM dengan garis ambang 20% dan 40%.
  - Filter region yang tersimpan di URL (`?region=BDG`).
  - Ringkasan jumlah per status yang mengikuti filter.
  - Waktu data dimuat dalam WIB.
  - Pesan untuk tabel kosong, region tanpa ATM, dan data gagal dimuat.
- Logika bisnis murni di `lib/atm.ts` dan `lib/format.ts`, dengan 36 test Vitest yang diturunkan dari acceptance criteria.
- Migrasi Supabase: tabel `atms` dengan RLS (publik hanya `SELECT`) dan seed 12 ATM dummy. **Belum diterapkan** ke project Supabase.
- Dependensi `@supabase/supabase-js` 2.117.3 (versi dikunci).

### Diubah

- Halaman awal `create-next-app` diganti dashboard. Bahasa halaman `id`, font Archivo.
