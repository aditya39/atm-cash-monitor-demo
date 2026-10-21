# Runbook Demo: ATM Cash Monitor, dari PRD sampai Vercel

Tujuan demo: peserta melihat satu siklus SDLC utuh dengan Claude Code. PRD → desain → test → code → review → PR dengan Preview URL → merge oleh manusia → produksi dan dokumentasi ter-update. Lalu diulang untuk fitur baru.

Alat per step mengikuti [KERANGKA-SDLC.md](KERANGKA-SDLC.md). Semua alat berasal dari marketplace, tanpa skill buatan sendiri.

Isi folder ini:

| File | Fungsi |
|---|---|
| `docs/KERANGKA-SDLC.md` | Alat yang dipakai di tiap step SDLC |
| `docs/prd/v1-dashboard-kas.md` | PRD pertama: dashboard sisa kas (contoh hasil `write-spec`) |
| `docs/prd/v2-permintaan-isi-ulang.md` | PRD kedua: permintaan isi ulang (didemokan live) |
| `.claude/CLAUDE.md` | Aturan project, termasuk wajib update dokumentasi di setiap PR. Ditaruh di `.claude/` supaya tidak bentrok dengan `create-next-app` |
| `.claude/settings.json` | Izin: push dan buat PR = **ask**, merge PR dan push ke main = **deny** |

---

## A. Persiapan akun dan plugin (dikerjakan trainer sendiri)

### Akun
- [ ] **GitHub**: repo baru **publik**, misalnya `atm-cash-monitor-demo`. Data dummy saja. `gh auth login` sudah aktif.
- [ ] **Supabase**: project baru `atm-demo`, region Singapore, di **organization atau akun Supabase terpisah** yang tidak berisi project kantor. Login MCP kemungkinan berlaku per organization, bukan per project.
  - Free tier di-pause setelah ±1 minggu tidak dipakai. **Buka project H-1 dan pagi hari demo.**
- [ ] **Vercel**: akun Hobby pribadi (login dengan GitHub), bukan team kantor.
  - Hobby hanya untuk penggunaan pribadi/non-komersial. Konfirmasi ke Hacktiv8 apakah boleh memakai akun pribadi.

### Plugin (sekali, di folder demo, scope project)
```bash
claude plugin install product-management@anthropic-plugin-directory --scope project
claude plugin install engineering@anthropic-plugin-directory --scope project
claude plugin install feature-dev@claude-plugins-official --scope project
claude plugin install commit-commands@claude-plugins-official --scope project
claude plugin install pr-review-toolkit@claude-plugins-official --scope project
claude plugin install frontend-design@claude-plugins-official --scope project
claude plugin install context7@claude-plugins-official --scope project
claude plugin install supabase@claude-plugins-official --scope project
claude plugin install playwright@claude-plugins-official --scope project
```
Opsional: `hookify` (Step 5) dan `vercel` (Step 9).

Dicek 21 Okt: semua nama plugin di atas ada di marketplace. `feature-dev`, `frontend-design`, dan `context7` **sudah terpasang** di laptop Anda (scope user), jadi baris install-nya boleh dilewati.

Setelah install:
- [ ] Buka `/mcp`. Login **hanya** ke `supabase` (akun demo). Server lain yang ikut terpasang dari `product-management` dan `engineering` (Slack, Gmail, Notion, Jira, dan lain-lain) **jangan di-login**, lalu matikan.
- [ ] Cek Supabase: `Tampilkan daftar project Supabase yang bisa kamu akses.` Yang muncul harus **hanya `atm-demo`**.
- [ ] Ketik `/` di Claude Desktop. Pastikan `/feature-dev`, `/commit-push-pr`, `/review-pr`, dan `/brainstorm` muncul.
- [ ] Kalau memasang plugin `vercel`: set `VERCEL_PLUGIN_TELEMETRY=off`. Plugin ini memasang hook dan telemetry-nya menyala secara default (bahan diskusi ISMS).

## B. Latihan malam ini (±2–3 jam): hasilnya v1 live + cadangan v2

Buka folder di Claude Desktop (tab Code, local session), mode **Ask permissions**. Mulai **sesi baru** di setiap sub-langkah B3–B5 (`/clear`), karena dokumennya sudah tersimpan di repo.

### B1. Scaffold (±10 menit)
```bash
cd demo-atm-cash-monitor
git init -b main
npx create-next-app@latest . --ts --tailwind --eslint --app --use-npm --yes
npm install -D vitest
npm pkg set scripts.test="vitest run"
git add -A && git commit -m "chore: scaffold Next.js + PRD + aturan Claude"
gh repo create atm-cash-monitor-demo --public --source . --push
```
`create-next-app` membuat `AGENTS.md` (aturan Next.js untuk agent). `.claude/CLAUDE.md` sudah meng-import-nya. `.gitignore` bawaan sudah mengabaikan `.env*`.

Diuji 21 Okt di folder latihan: scaffold di folder yang sudah berisi `.claude/` dan `docs/` lolos, Next.js 16.4, `npm run build` lolos. Kalau ada file `CLAUDE.md` di root, `create-next-app` menolak jalan. Itu sebabnya file aturan ditaruh di `.claude/CLAUDE.md`.

Opsional (Step 0): `Analisis repo ini dan rekomendasikan hook, skill, MCP, dan subagent yang cocok untuk Next.js + Supabase.` (butuh plugin `claude-code-setup`).

### B2. Sambungkan Vercel dan Supabase (±10 menit)
1. Vercel → **Add New Project** → import repo `atm-cash-monitor-demo` → Deploy. Halaman starter Next.js tampil di URL produksi.
2. Supabase → Project Settings → API. Isi di Vercel → Settings → Environment Variables (Production **dan** Preview), dan di `.env.local` lokal:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (atau *publishable key*): boleh terlihat di browser, karena dilindungi RLS
   - `SUPABASE_SERVICE_ROLE_KEY` (atau *secret key*): **hanya server**, jangan pernah diberi prefix `NEXT_PUBLIC_`
3. Vercel → Settings → **Deployment Protection**. Project baru sering melindungi Preview URL dengan login Vercel. Matikan untuk Preview di project demo ini, atau pastikan HP yang dipakai demo sudah login Vercel.

### B3. PRD v1 (Step 1, ±10 menit)
PRD v1 contoh sudah ada. Latih skill-nya supaya Anda tahu rasanya:
```
Tulis PRD untuk dashboard sisa kas ATM bagi operator kas. Simpan sebagai markdown di docs/prd/v1-dashboard-kas.md.
```
Skill `write-spec` (plugin `product-management`) akan mewawancarai Anda. Jawab berdasarkan contoh PRD yang ada, lalu bandingkan hasilnya. Pastikan **AC9** (data dibaca saat request) dan **AC7** (RLS) tetap ada. Kalau hilang, minta Claude menambahkannya.

### B4. Bangun v1 (Step 2–9, ±45–60 menit)
Satu perintah dari plugin `feature-dev`:
```
/feature-dev Implementasi docs/prd/v1-dashboard-kas.md. Test dulu dari acceptance criteria: tunjukkan test merah, lalu hijau. Buat migrasi Supabase dengan RLS dan terapkan ke project atm-demo lewat MCP sebelum push. Pakai skill frontend-design untuk tampilan. Perbarui README, docs/CHANGELOG.md, dan docs/design/.
```
`/feature-dev` akan berhenti untuk **pertanyaan klarifikasi** dan **persetujuan arsitektur**. Itu titik keputusan manusia. Jawab, lalu lanjutkan.

Setelah selesai:
```
/commit-push-pr
```
Klik Allow untuk push dan buat PR. Lalu:
```
/review-pr
```
Cek Preview URL di PR → klik **Merge** di GitHub → v1 live di URL produksi. **Catat URL-nya.**

Wajib dicek (AC9): ubah sisa kas satu ATM di Supabase Table Editor, lalu refresh URL produksi. Angkanya harus ikut berubah **tanpa redeploy**. Kalau tidak berubah, halaman masih dibekukan saat build. Minta Claude memperbaikinya sebelum lanjut.

### B5. Latihan v2 sebagai cadangan (±30–45 menit)
```
/feature-dev Implementasi docs/prd/v2-permintaan-isi-ulang.md. Test dulu dari acceptance criteria: tunjukkan test merah, lalu hijau. Terapkan migrasi ke Supabase atm-demo lewat MCP sebelum push. Perbarui README, docs/CHANGELOG.md, dan docs/design/.
```
Lalu `/commit-push-pr` dan cek Preview URL. **Jangan merge.**

**Catat waktu** setiap bagian (berapa menit `/feature-dev` sampai PR terbuka). Angka ini menentukan apakah demo di kelas muat 25 menit.

Latih juga momen merge: kirim `Merge PR-nya sekarang.` dan **catat apa yang terjadi**. Kemungkinan besar Claude menolak sendiri karena CLAUDE.md. Kalau Claude mencoba, rule `deny` yang memblokir. Skrip di kelas mengikuti hasil latihan ini.

Lalu tutup PR-nya (*Close*, bukan merge) dan beri nama branch-nya `cadangan/v2`. Kalau demo live macet, PR ini dibuka lagi.

Sebelum tidur: kembalikan Supabase ke kondisi v1 (hapus tabel `refill_requests` lewat SQL editor Supabase), supaya demo besok mulai dari kondisi yang sama.

### B6. Opsional: dokumentasi otomatis saat deploy (Step 10b)
Hanya kalau waktu tersisa. Workflow GitHub Actions dengan `claude-code-action` yang menambahkan entri `docs/RELEASES.md` setiap deployment produksi sukses. **Belum diuji.** Jangan masuk skrip kelas sebelum berhasil sekali jalan. Kalau tidak sempat, cukup ceritakan sebagai "level berikutnya".

## C. Skrip di kelas (±25 menit)

| Menit | Langkah | Yang dikatakan / dilakukan |
|---|---|---|
| 0–3 | Buka URL produksi v1, PRD v1, dan `docs/CHANGELOG.md` | "Aplikasi ini dibangun Claude dari PRD ini. Dokumentasinya ikut ditulis di PR yang sama." |
| 3–6 | Buka PRD v2 | "PRD ini dibuat dengan skill `write-spec` dari plugin Anthropic." Tunjukkan non-goals dan acceptance criteria: "AC inilah yang nanti jadi test." |
| 6 | Jalankan `/feature-dev` dengan prompt v2 (sama seperti B5) | Sesi baru, mode Ask permissions |
| 6–10 | Pertanyaan klarifikasi dan desain dari `/feature-dev` | Jawab cepat. "Claude bertanya dulu sebelum menulis code, seperti engineer senior." |
| 10–17 | Claude bekerja | Bawakan slide Bagian H/I. Sesekali kembali ke layar: test **merah**, lalu **hijau** |
| ±15 | Prompt izin MCP Supabase (migrasi) | "Claude membuat tabel di database cloud, tapi baru setelah kita setujui." |
| ±17 | `/commit-push-pr`, klik Allow | "Push dan PR adalah titik approval manusia." |
| ±19 | Prompt: `Merge PR-nya sekarang.` | Dua lapis: CLAUDE.md meminta dengan sopan, `settings.json` menegakkan (`deny gh pr merge`). Tunjukkan kedua file. Sesuaikan kalimatnya dengan hasil latihan B5 |
| 19–23 | Buka PR di GitHub | Komentar Vercel berisi **Preview URL**. Buka di HP, coba form isi ulang. Tunjukkan README dan CHANGELOG ikut berubah di diff |
| 23–25 | Klik **Merge** di GitHub | Tunggu deploy ±1–2 menit, refresh URL produksi. Fitur baru live |

Opsional kalau waktu tersisa:
- `/review-pr`: beberapa reviewer spesialis bekerja sekaligus di PR.
- `Buka Preview URL dengan Playwright, ajukan isi ulang Rp50.000 untuk ATM yang kritis, lalu ambil screenshot.`

Kalimat penutup: *"Semua langkah dikerjakan AI dengan plugin resmi. Yang tidak kami serahkan: keputusan merge. Itu tanda tangan manusia."*

## D. Kalau macet

| Gejala | Tindakan |
|---|---|
| `/feature-dev` tidak muncul di menu `/` | Plugin belum terpasang di folder ini. Cek `claude plugin list`. Pakai PR cadangan |
| `/feature-dev` banyak bertanya | Jawab singkat. Ini bagus untuk diperlihatkan: Claude bertanya, bukan menebak |
| Lewat menit 17 belum ada PR | Biarkan jalan di belakang. Buka PR cadangan `cadangan/v2` dan Preview URL-nya |
| Build Vercel gagal | Buka log build di Vercel, salin error ke Claude: `Build Vercel gagal dengan error ini, perbaiki di branch yang sama.` |
| Halaman error "fetch failed" atau data kosong | Cek Environment Variables di Vercel (Preview **dan** Production), lalu redeploy |
| Supabase "project paused" | Restore di dashboard Supabase (±1–2 menit). Sementara itu tunjukkan PR dan test-nya |
| Internet kelas lambat | Tunjukkan hasil latihan B4–B5: PR, test, Preview URL |

## E. Catatan keamanan untuk dibahas (ISMS)

- Repo publik, data dummy, aplikasi tidak memakai nama Hitachi atau bank.
- Kunci Supabase hanya di `.env.local` (di-ignore git) dan di Vercel. Tabel wajib RLS, karena anon key memang terlihat di browser.
- Supabase MCP hanya diberi akses ke project demo. Untuk analisis tanpa mengubah data, MCP bisa dijalankan read-only (`read_only=true`).
- Plugin Anthropic `product-management` dan `engineering` membawa konfigurasi banyak MCP server (Slack, Gmail, Notion, dan lain-lain). Tidak ada yang tersambung sebelum di-login. Ini contoh bagus: **pasang plugin = baca dulu apa saja yang ikut terpasang**.
- Plugin pihak ketiga bisa memasang hook dan telemetry. Contoh nyata: plugin Vercel.
- Code dan data dikirim ke layanan cloud (Anthropic, GitHub, Vercel, Supabase). Untuk project Hitachi sungguhan: izin security officer dulu.

## F. Setelah workshop

- Pause atau hapus project Supabase `atm-demo`. Endpoint tulis di v2 tidak memakai login, jadi siapa pun yang tahu URL-nya bisa membuat permintaan isi ulang.
- Hapus Environment Variables di Vercel, atau hapus project Vercel-nya.
- Repo boleh tetap publik sebagai materi, karena tidak berisi kunci apa pun.
