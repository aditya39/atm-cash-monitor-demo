# PRD v1: Dashboard Sisa Kas ATM

Status: disetujui untuk demo · Data: dummy, aplikasi demo (bukan produk Hitachi atau bank mana pun)

## Masalah
Tim operasional baru tahu ATM kehabisan kas setelah ada keluhan nasabah. Data sisa kas tersebar di laporan harian, jadi ATM yang kritis terlambat diisi ulang.

## Pengguna
- **Operator kas**: memantau semua ATM di regionnya dan menentukan ATM mana yang diisi ulang lebih dulu.

## Yang dibangun
1. Halaman dashboard yang menampilkan daftar ATM: ID, lokasi, region, sisa kas, kapasitas, dan persentase sisa kas.
2. Daftar diurutkan dari persentase sisa kas terendah.
3. Filter per region.
4. Badge status per ATM:
   - **Kritis** (merah): sisa kas < 20% kapasitas
   - **Waspada** (kuning): 20% sampai < 40%
   - **Aman** (hijau): ≥ 40%
5. Ringkasan di atas daftar: jumlah ATM per status.
6. Data dari tabel Supabase `atms`, diisi 12 ATM dummy di 3 region (JKT-SEL, JKT-PUS, BDG).

## Non-goals (tidak dibangun di v1)
- Login dan role pengguna
- Mengubah data ATM dari aplikasi
- Permintaan isi ulang (masuk PRD v2)
- Peta, notifikasi, export

## Acceptance criteria (bisa dicek pass/fail)
- [ ] AC1: ATM dengan sisa kas 19% kapasitas berstatus **Kritis**. Tepat 20% berstatus **Waspada**.
- [ ] AC2: ATM dengan sisa 39% berstatus **Waspada**. Tepat 40% berstatus **Aman**.
- [ ] AC3: Kapasitas 0 tidak membuat error. ATM itu berstatus **Kritis**.
- [ ] AC4: Daftar terurut dari persentase terendah ke tertinggi.
- [ ] AC5: Filter region `BDG` hanya menampilkan ATM region BDG.
- [ ] AC6: Ringkasan jumlah per status sama dengan isi daftar.
- [ ] AC7: Tabel `atms` memakai **Row Level Security (RLS)**: publik hanya boleh `SELECT`, tidak boleh insert, update, atau delete.
- [ ] AC8: Nominal ditampilkan dalam format rupiah, misalnya `Rp150.000.000`.
- [ ] AC9: Dashboard membaca data saat halaman dibuka, bukan saat build. Mengubah sisa kas satu ATM di Supabase langsung terlihat di URL produksi setelah refresh, tanpa redeploy.

## Catatan teknis
- Logika status (AC1–AC3) dan format rupiah (AC8) ditulis sebagai fungsi murni di `lib/`, supaya bisa diuji tanpa Supabase.
- Kunci Supabase hanya di `.env.local` (tidak di-commit) dan di Environment Variables project Vercel.
