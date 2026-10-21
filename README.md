# ATM Cash Monitor (demo)

Dashboard sisa kas ATM untuk operator kas. Aplikasi demo untuk workshop: **semua data dummy**, bukan produk Hitachi atau bank mana pun.

## Fitur

**v1: Dashboard sisa kas** ([PRD](docs/prd/v1-dashboard-kas.md), [desain](docs/design/v1.md))

- Status kas per ATM: **Kritis** (< 20% atau kapasitas 0), **Waspada** (20% sampai < 40%), **Aman** (≥ 40%). Badge selalu menampilkan teks status.
- Daftar ATM terurut dari persentase sisa kas terendah. Persentase seri diurutkan berdasarkan ID.
- Level kas per ATM dengan garis ambang 20% dan 40%.
- Filter region (Semua region, `JKT-SEL`, `JKT-PUS`, `BDG`) yang tersimpan di URL, misalnya `/?region=BDG`.
- Ringkasan jumlah ATM per status yang mengikuti filter aktif.
- Data dibaca dari Supabase setiap kali halaman dibuka, lengkap dengan waktu muat ("Data per 22 Okt 2026, 14.05 WIB").
- Pesan yang jelas saat tabel kosong, region tanpa ATM, atau data gagal dimuat.

## Stack

Next.js 16 (App Router, Cache Components) + Tailwind 4, Supabase Postgres lewat `@supabase/supabase-js`, Vitest. Deploy di Vercel. Butuh Node.js 22 atau lebih baru.

## Menjalankan lokal

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest, wajib hijau sebelum commit
npm run build   # wajib lolos sebelum membuka PR
```

### Environment variables

Isi di `.env.local` (lokal) dan di Vercel → Settings → Environment Variables (Production **dan** Preview):

| Nama | Isi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key atau publishable key. Aman karena tabel dilindungi RLS (publik hanya bisa membaca) |

Jangan pernah menulis kunci di code atau meng-commit `.env.local`. v1 tidak memakai service role key.

Catatan:

- Nilai `NEXT_PUBLIC_*` ditanam ke hasil build. Setelah mengubah env var di Vercel, lakukan **redeploy**. Perubahan **data** di Supabase tidak butuh redeploy.
- Tanpa env var, build tetap lolos dan halaman menampilkan "Data sisa kas gagal dimuat. Coba muat ulang." Penyebabnya dicatat di log server.

### Database

Migrasi ada di [`supabase/migrations/`](supabase/migrations/):

1. `20261022000000_create_atms.sql`: tabel `atms`, CHECK nominal ≥ 0, RLS dengan akses publik hanya `SELECT`.
2. `20261022000100_seed_atms.sql`: 12 ATM dummy di 3 region.

Terapkan berurutan (MCP Supabase `apply_migration`, `supabase db push`, atau SQL editor). Langkah verifikasi RLS ada di [docs/design/v1.md](docs/design/v1.md#verifikasi-setelah-migrasi-diterapkan).

## Struktur

```
app/page.tsx              halaman dashboard (shell statis + data saat request)
app/_components/          komponen tampilan: tabel, filter, ringkasan, badge
lib/atm.ts                logika bisnis murni: status, persentase, urutan, filter, ringkasan
lib/format.ts             format rupiah dan waktu WIB
lib/atms-data.ts          baca tabel atms dari Supabase (server saja)
supabase/migrations/      skema, RLS, dan seed
docs/                     PRD, desain, changelog
```

## Dokumentasi

- [docs/prd/](docs/prd/): requirement dan acceptance criteria (sumber kebenaran)
- [docs/design/v1.md](docs/design/v1.md): desain teknis v1
- [docs/CHANGELOG.md](docs/CHANGELOG.md): riwayat perubahan
- [docs/RUNBOOK-DEMO.md](docs/RUNBOOK-DEMO.md) dan [docs/KERANGKA-SDLC.md](docs/KERANGKA-SDLC.md): materi workshop
