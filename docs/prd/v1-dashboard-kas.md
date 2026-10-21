# PRD v1: Dashboard Sisa Kas ATM

Status: **disetujui** (21 Okt, trainer) · Data: dummy, aplikasi demo (bukan produk Hitachi atau bank mana pun) · Dibuat dengan skill `write-spec`

## Masalah

Operator kas baru tahu sebuah ATM kehabisan kas **setelah ada keluhan nasabah**. Ini terjadi **beberapa kali seminggu**. Data sisa kas tersebar di laporan harian, jadi tidak ada satu tempat untuk melihat ATM mana yang paling mendesak. Akibatnya ATM kritis terlambat diisi ulang, nasabah tidak bisa menarik uang, dan bank menerima keluhan yang sebenarnya bisa dicegah.

## Pengguna

- **Operator kas**: memantau semua ATM di regionnya dan menentukan ATM mana yang diisi ulang lebih dulu.

## Tujuan

1. **Operator menemukan ATM Kritis di regionnya dalam < 1 menit** sejak membuka dashboard, tanpa membuka laporan harian.
2. **Satu sumber data sisa kas.** Semua ATM ada di satu halaman dengan angka terbaru setiap kali halaman dibuka.
3. **ATM kritis diketahui sebelum ada keluhan nasabah.** Jumlah kejadian "ATM kosong yang baru diketahui dari keluhan" turun (lihat Metrik keberhasilan).

## Non-goals (tidak dibangun di v1)

| Tidak dibangun | Alasan |
|---|---|
| **Login dan role pengguna** | Data dummy untuk demo. Akses per pengguna baru perlu saat memakai data nyata. |
| **Mengubah data ATM dari aplikasi** | v1 hanya membaca. Fitur tulis butuh login dan audit, dan sisa kas seharusnya datang dari sistem sumber. |
| **Permintaan isi ulang** | Dibahas terpisah di PRD v2 (`docs/prd/v2-permintaan-isi-ulang.md`). |
| **Peta** | Daftar terurut sudah cukup untuk menjawab "mana yang paling mendesak". Peta butuh koordinat dan library tambahan. |
| **Notifikasi** | Butuh job terjadwal dan kanal kirim (email, chat). Dashboard dibuktikan berguna dulu. |
| **Export** | Laporan harian sudah ada. Tujuan v1 adalah menggantikan pencarian manual, bukan membuat laporan baru. |

## User stories

**Operator kas**

1. Sebagai operator kas, saya ingin **ATM dengan persentase sisa kas terendah tampil paling atas**, supaya saya tahu mana yang diisi ulang lebih dulu tanpa membaca semua baris.
2. Sebagai operator kas, saya ingin **melihat status Kritis, Waspada, atau Aman di setiap ATM**, supaya saya tidak perlu menghitung persentase sendiri.
3. Sebagai operator kas, saya ingin **hanya melihat ATM di region saya**, supaya daftar tidak tercampur dengan region lain.
4. Sebagai operator kas, saya ingin **melihat jumlah ATM per status** di region yang sedang saya lihat, supaya saya tahu besarnya pekerjaan hari ini dalam sekali lihat.
5. Sebagai operator kas, saya ingin **angka sisa kas terbaru setiap kali saya membuka atau me-refresh halaman**, supaya keputusan saya tidak berdasarkan data kemarin.
6. *(Kasus batas)* Sebagai operator kas, saya ingin **ATM yang kapasitasnya tercatat 0 tetap muncul sebagai Kritis**, supaya data yang salah tidak menyembunyikan ATM bermasalah.
7. *(Kasus batas, P1)* Sebagai operator kas, saya ingin **pesan yang jelas saat region tidak punya ATM atau data gagal dimuat**, supaya saya tidak mengira semua ATM aman.

## Requirement

Semua AC bisa dicek pass/fail.

### P0: wajib ada sebelum rilis

**P0-1. Status kas per ATM**

Persentase sisa kas = `sisa kas ÷ kapasitas × 100`. Status ditentukan dari persentase itu:

| Status | Aturan | Warna badge |
|---|---|---|
| **Kritis** | < 20%, atau kapasitas 0 | merah |
| **Waspada** | 20% sampai < 40% | kuning |
| **Aman** | ≥ 40% | hijau |

Badge selalu menampilkan teks status, tidak hanya warna.

- [ ] **AC1**: Kapasitas Rp200.000.000. Sisa Rp38.000.000 (19%) berstatus **Kritis**. Sisa Rp40.000.000 (tepat 20%) berstatus **Waspada**.
- [ ] **AC2**: Kapasitas Rp200.000.000. Sisa Rp78.000.000 (39%) berstatus **Waspada**. Sisa Rp80.000.000 (tepat 40%) berstatus **Aman**.
- [ ] **AC3**: Kapasitas 0 tidak menimbulkan error (tidak ada pembagian dengan nol). ATM itu berstatus **Kritis** dan persentasenya dianggap 0%.
- [ ] **AC10**: Status dihitung dari nilai yang belum dibulatkan. Persentase yang tampil **dibulatkan ke bawah** ke bilangan bulat, supaya angka yang terlihat selalu cocok dengan badge. Contoh: kapasitas Rp150.000.000, sisa Rp29.999.999 (19,99…%) tampil **19%** dan berstatus **Kritis**.

**P0-2. Daftar ATM terurut**

- [ ] **AC4**: Daftar terurut dari persentase sisa kas terendah ke tertinggi. Yang dipakai adalah persentase **sebelum dibulatkan**: ATM 19,2% tampil di atas ATM 19,8%, walaupun keduanya tampil 19%.
- [ ] **AC11**: Jika persentase sebelum dibulatkan persis sama, ATM diurutkan berdasarkan ID secara alfabet, supaya urutan selalu sama setiap kali halaman dibuka.
- [ ] **AC12**: Setiap baris menampilkan ID, lokasi, region, sisa kas, kapasitas, persentase, dan badge status.
- [ ] **AC8**: Nominal tampil sebagai integer rupiah dengan titik pemisah ribuan. `150000000` tampil `Rp150.000.000`, dan `0` tampil `Rp0`.

**P0-3. Filter region**

Pilihan filter: **Semua region**, `JKT-SEL`, `JKT-PUS`, `BDG`. Bawaan: Semua region.

- [ ] **AC5**: Filter `BDG` hanya menampilkan ATM region BDG. Tidak ada ATM region lain yang ikut tampil.
- [ ] **AC13**: Filter **Semua region** menampilkan ke-12 ATM.

**P0-4. Ringkasan per status**

- [ ] **AC6**: Ringkasan di atas daftar menampilkan jumlah ATM Kritis, Waspada, dan Aman. Ringkasan **mengikuti filter yang aktif**, dan jumlahnya selalu sama dengan isi daftar yang tampil.

**P0-5. Data dari Supabase, aman dari perubahan**

- [ ] **AC7**: Tabel `atms` memakai **Row Level Security (RLS)**. Publik (anon key) hanya boleh `SELECT`. `INSERT`, `UPDATE`, dan `DELETE` dengan anon key ditolak.
- [ ] **AC14**: Tabel `atms` berisi 12 ATM dummy di 3 region (`JKT-SEL`, `JKT-PUS`, `BDG`). Data ini mencakup minimal satu ATM untuk setiap status, dan minimal satu ATM Kritis di `BDG`. Tidak ada ATM berkapasitas 0 di data dummy; kasus itu cukup dibuktikan oleh unit test (AC3). Nama lokasi fiktif, tanpa nama bank.

**P0-6. Data selalu terbaru**

- [ ] **AC9**: Dashboard membaca data saat halaman dibuka, bukan saat build. Mengubah sisa kas satu ATM di Supabase Table Editor langsung terlihat di URL produksi setelah refresh, **tanpa redeploy**.

### P1: sebaiknya ada, menyusul cepat

- **P1-1. Empty state.** Jika filter tidak menemukan ATM, tampil "Tidak ada ATM di region ini." Jika tabel kosong, tampil "Belum ada data ATM." Ringkasan menampilkan 0 untuk semua status.
- **P1-2. Error state.** Jika Supabase tidak bisa dihubungi, halaman menampilkan "Data sisa kas gagal dimuat. Coba muat ulang." Halaman tidak boleh kosong tanpa penjelasan, crash, atau menampilkan data lama seolah-olah terbaru.
- **P1-3. Filter tersimpan di URL** (misalnya `?region=BDG`), supaya filter tetap aktif setelah refresh dan tautannya bisa dibagikan ke rekan satu region.
- **P1-4. Waktu data dimuat** ditampilkan, misalnya "Data per 22 Okt 2026, 14.05 WIB", supaya operator yakin angkanya baru.

### P2: belum dibangun, tapi desain v1 tidak boleh menghalanginya

| Fitur nanti | Yang perlu dijaga di v1 |
|---|---|
| Permintaan isi ulang (PRD v2) | Fungsi status di `lib/` bisa dipakai ulang untuk menentukan ATM mana yang boleh diminta isi ulang. ID ATM stabil. |
| Login dan akses per region | Region tersimpan sebagai kolom di `atms`, jadi RLS bisa diperketat per pengguna tanpa mengubah struktur tabel. |
| Notifikasi saat ATM menjadi Kritis | Logika status berupa fungsi murni, jadi bisa dipanggil dari job terjadwal, bukan hanya dari halaman. |
| Ambang berbeda per ATM atau region | Angka 20% dan 40% ditulis di satu tempat saja, tidak tersebar di code. |

## Batasan dan catatan teknis

Batasan berikut sudah ditetapkan di `.claude/CLAUDE.md`. Semuanya berlaku di PRD ini.

- **Stack**: Next.js (App Router) + Tailwind, Supabase Postgres. Data diambil dari server memakai `@supabase/supabase-js`.
- **Logika murni di `lib/`** dan diuji dengan Vitest sebelum implementasi: status (AC1–AC3, AC10), persentase tampil (AC10), urutan (AC4, AC11), dan format rupiah (AC8). Expected value diambil dari AC di atas, bukan dari code.
- **Hindari error pembulatan desimal.** Cek `kapasitas = 0` lebih dulu (langsung Kritis, AC3). Setelah itu bandingkan dengan integer, misalnya Kritis jika `sisa_kas × 100 < 20 × kapasitas`. Tanpa cek pertama, rumus ini memberi status Aman untuk kapasitas 0. Nominal disimpan sebagai `bigint`.
- **Halaman membaca data saat request** (AC9). Cara membuat halaman dinamis dicek di docs Next.js versi yang terpasang (`node_modules/next/dist/docs/`).
- **Kunci Supabase** hanya ada di `.env.local` dan Environment Variables Vercel. Tidak ditulis di code dan tidak di-commit.
- **Migrasi** disimpan di `supabase/migrations/`.

## Metrik keberhasilan

Ini aplikasi demo, jadi metrik leading diukur saat uji coba. Target metrik lagging adalah hipotesis untuk versi dengan data nyata.

**Leading (diukur saat uji coba, sebelum merge)**

| Metrik | Target | Stretch | Cara ukur |
|---|---|---|---|
| Waktu menemukan ATM Kritis di satu region | < 60 detik | < 20 detik | 3 orang yang belum pernah melihat dashboard diberi tugas "Sebutkan semua ATM Kritis di BDG". Waktu diukur dengan stopwatch dari halaman terbuka sampai jawaban selesai. |
| Ketepatan jawaban | 100% | – | ATM yang disebut sama persis dengan data di Supabase. |
| Kesegaran data | 100% | – | Ubah 3 nilai sisa kas di Supabase. Ketiganya harus terlihat setelah satu kali refresh (AC9). |

**Lagging (versi nyata, dievaluasi 1 bulan setelah dipakai)**

| Metrik | Baseline | Target |
|---|---|---|
| Kejadian ATM kosong yang pertama kali diketahui dari keluhan nasabah | "beberapa kali seminggu" (perlu angka pasti, lihat Q3) | ≤ 1 per minggu |

## Pertanyaan terbuka

| # | Pertanyaan | Untuk | Menghambat? |
|---|---|---|---|
| Q1 | Apakah tabel `atms` diberi CHECK constraint `sisa_kas ≥ 0` dan `kapasitas ≥ 0`? Rekomendasi: ya. | Engineering | Tidak. Diputuskan saat membuat migrasi (Step 3). |
| Q2 | Jika sisa kas tercatat lebih besar dari kapasitas (data anomali), apakah ditampilkan apa adanya (> 100%, Aman) atau diberi tanda? | Engineering, data | Tidak. Data dummy tidak berisi kasus ini. |
| Q3 | Berapa angka pasti kejadian "ATM kosong diketahui dari keluhan" per minggu saat ini? | Stakeholder, data | Tidak. Hanya dibutuhkan untuk metrik lagging. |
| Q4 | Apakah ambang 20% dan 40% cocok untuk semua lokasi? ATM di lokasi ramai mungkin perlu ambang lebih tinggi. | Stakeholder | Tidak. v1 memakai ambang yang sama untuk semua ATM (lihat P2). |
| Q5 | Apakah sisa kas cukup dihitung sebagai total rupiah, atau perlu dipecah per kaset atau pecahan uang? | Stakeholder | Tidak. v1 memakai total rupiah. |

## Timeline dan ketergantungan

- **Tenggat**: v1 harus sudah live di URL produksi sebelum demo workshop, karena demo PRD v2 dimulai dari v1 yang sudah berjalan.
- **Ketergantungan**:
  - Project Supabase `atm-demo` aktif. Free tier di-pause setelah ±1 minggu tidak dipakai.
  - Environment Variables Supabase sudah diisi di Vercel, untuk Production **dan** Preview.
- **Tahapan**:
  1. **v1 (PRD ini)**: dashboard baca saja.
  2. **v2**: permintaan isi ulang (`docs/prd/v2-permintaan-isi-ulang.md`). Memakai fungsi status dari v1.
  3. **Nanti**: kandidat P2 di atas, setelah ada data nyata dan login.
