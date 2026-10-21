# Kerangka SDLC dengan Claude Code: ATM Cash Monitor

Setiap step berisi alat yang dipakai (skill, MCP, plugin, atau fitur bawaan), prompt contoh, hasilnya, dan titik keputusan manusia. **Tidak ada skill buatan sendiri.** Semua alat sudah tersedia di marketplace.

Label sumber:
- **Bawaan** = sudah ada di Claude Code
- **A** = buatan Anthropic
- **V** = resmi dari vendor tool-nya
- **K** = komunitas

Semua plugin di bawah ada di marketplace `claude-plugins-official` atau `anthropic-plugin-directory` (dicek 21 Okt). **Belum diuji satu per satu. Coba dulu sebelum demo.**

## Plugin yang dipasang (sekali, scope project)

| Plugin | Sumber | Dipakai di step |
|---|---|---|
| `product-management@anthropic-plugin-directory` | A | 1 PRD, 10 Dokumentasi |
| `engineering@anthropic-plugin-directory` | A | 2 Desain, 4 Test, 9 Deploy, 10 Dokumentasi |
| `feature-dev@claude-plugins-official` | A | 2 Desain, 11 Fitur baru |
| `context7@claude-plugins-official` | V | 2, 5 |
| `supabase@claude-plugins-official` | K | 3 Database |
| `frontend-design@claude-plugins-official` | A | 5 Implementasi |
| `hookify@claude-plugins-official` | A | 5 |
| `playwright@claude-plugins-official` | V | 6 Test UI |
| `pr-review-toolkit@claude-plugins-official` | A | 7 Review |
| `commit-commands@claude-plugins-official` | A | 8 PR |
| `vercel@claude-plugins-official` | V | 9 Deploy (opsional) |

```bash
claude plugin install <nama>@<marketplace> --scope project
```

**Penting:** plugin `product-management` dan `engineering` ikut membawa konfigurasi banyak MCP server (Slack, Gmail, Notion, Jira, dan lain-lain). Server-server itu **tidak tersambung sebelum di-login**. **Jangan login ke akun kantor.** Untuk demo cukup pakai skill-nya. Matikan server yang tidak dipakai lewat `/mcp`.

---

## Step 0 · Setup project
| | |
|---|---|
| **Pakai** | `create-next-app` + **`claude-code-setup`** (A, skill `claude-automation-recommender`) |
| **Alternatif** | `/init` (Bawaan) |
| **Prompt** | `Analisis repo ini dan rekomendasikan hook, skill, MCP, dan subagent yang cocok untuk Next.js + Supabase.` |
| **Hasil** | Next.js siap, `.claude/CLAUDE.md`, `.claude/settings.json`, daftar rekomendasi |
| **Manusia** | Pilih rekomendasi yang dipakai |

## Step 1 · PRD
| | |
|---|---|
| **Pakai** | **`product-management`** (A): skill **`write-spec`** |
| **Isinya** | Mewawancarai kita bertahap, lalu menulis PRD: masalah, goals, **non-goals**, requirement P0/P1/P2 lengkap dengan **acceptance criteria**, dan success metrics. Tanpa tracker pun tetap jalan, karena skill ini bekerja dari jawaban kita |
| **Pendukung** | Command `/brainstorm` dari plugin yang sama, untuk mengeksplorasi ide dulu |
| **Alternatif** | **Matt Pocock skills** (K, `mattpocock-skills`): `grill-me` (wawancara "keras" untuk menguji rencana) lalu `to-spec`, yang bisa ditulis sebagai markdown lokal |
| **Prompt** | `Tulis PRD untuk dashboard sisa kas ATM bagi operator kas. Simpan sebagai markdown di docs/prd/v1-dashboard-kas.md.` |
| **Hasil** | `docs/prd/v1-dashboard-kas.md` (contoh jadinya sudah ada di folder ini) |
| **Manusia** | Jawab wawancara, setujui non-goals dan acceptance criteria |
| **Wow** | Claude **bertanya balik** seperti seorang PM, bukan langsung mengarang |

## Step 2 · Desain teknis dan keputusan arsitektur
| | |
|---|---|
| **Pakai** | **`engineering`** (A): skill **`system-design`** (rancangan) dan **`architecture`** (ADR, catatan keputusan) |
| **Pendukung** | **`context7`** (V): dokumentasi Next.js dan Supabase versi terbaru |
| **Alternatif** | `/feature-dev` (A) fase Explore dan Architecture · Plan Mode (Bawaan) |
| **Prompt** | `Rancang implementasi docs/prd/v1-dashboard-kas.md dan tulis ke docs/design/v1.md. Catat keputusan "baca data saat request, bukan saat build" sebagai ADR di docs/adr/.` |
| **Hasil** | `docs/design/v1.md`, `docs/adr/0001-*.md` |
| **Manusia** | Setujui desain sebelum ada code |

## Step 3 · Database
| | |
|---|---|
| **Pakai** | **`supabase`** (K): MCP Supabase + skill `supabase-postgres-best-practices` |
| **Tool MCP** | `list_tables`, `apply_migration`, `execute_sql`, `get_advisors` (cek keamanan/performa), `get_logs` |
| **Prompt** | `Buat migrasi tabel atms sesuai PRD di supabase/migrations, aktifkan RLS (publik hanya SELECT), terapkan ke project atm-demo, isi 12 ATM dummy, lalu jalankan advisor keamanan.` |
| **Hasil** | Tabel di Supabase, file migrasi di repo, laporan advisor |
| **Manusia** | Setujui setiap `apply_migration` |
| **Wow** | Claude membuat tabel di **database cloud**, lalu advisor Supabase mengecek RLS-nya |
| **Hati-hati** | Login MCP pakai akun atau organization Supabase khusus demo |

## Step 4 · Test dulu
| | |
|---|---|
| **Pakai** | **`engineering`** (A): skill **`testing-strategy`** untuk rencana test, lalu Vitest |
| **Alternatif** | Skill `tdd` dari Matt Pocock (K) · skill `test-driven-development` dari Superpowers (K) |
| **Prompt** | `Buat test plan dari acceptance criteria PRD v1, lalu tulis test Vitest untuk AC1–AC3 dan AC8 di lib/. Expected value dari PRD. Jalankan dan tunjukkan semuanya MERAH.` |
| **Hasil** | Test plan + `lib/*.test.ts` yang gagal dulu |
| **Manusia** | Cek expected value cocok dengan PRD |

## Step 5 · Implementasi
| | |
|---|---|
| **Pakai** | **`frontend-design`** (A) untuk UI + **`context7`** (V) |
| **Penjaga** | **`hookify`** (A): `/hookify jangan pernah edit file .env` membuat hook dari satu kalimat |
| **Prompt** | `Implementasi sampai semua test hijau. Pakai skill frontend-design untuk dashboard. Jalankan npm test dan npm run build.` |
| **Hasil** | Dashboard di localhost:3000, test hijau |
| **Manusia** | Baca diff |
| **Wow** | `/hookify` membuat aturan pengaman dari satu kalimat |

## Step 6 · Test UI di browser
| | |
|---|---|
| **Pakai** | **`playwright`** (V, Microsoft): MCP browser |
| **Alternatif** | Browser pane Claude Desktop (Bawaan) |
| **Prompt** | `Buka localhost:3000 dengan Playwright, filter region BDG, pastikan hanya ATM BDG yang tampil, lalu ambil screenshot.` |
| **Wow** | Browser **bergerak sendiri** di layar |

## Step 7 · Review
| | |
|---|---|
| **Pakai** | `/code-review` dan `/security-review` (Bawaan) + **`pr-review-toolkit`** (A): `/review-pr` |
| **Isi pr-review-toolkit** | Agent spesialis yang jalan bersamaan: `code-reviewer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer`, `code-simplifier` |
| **Manusia** | Putuskan temuan mana yang diperbaiki |
| **Wow** | Beberapa reviewer AI dengan keahlian berbeda bekerja **sekaligus** |

## Step 8 · Commit dan Pull Request
| | |
|---|---|
| **Pakai** | **`commit-commands`** (A): `/commit`, `/commit-push-pr` |
| **Pengaman** | `.claude/settings.json`: push dan buat PR = **ask**, merge = **deny** |
| **Manusia** | Klik Allow untuk push dan buat PR |

## Step 9 · Deploy ke Vercel
| | |
|---|---|
| **Sebelum deploy** | **`engineering`** (A): skill **`deploy-checklist`** (cek CI, migrasi, env vars, rencana rollback) |
| **Deploy (utama)** | **Integrasi GitHub bawaan Vercel**: setiap PR otomatis dapat **Preview URL**, merge ke `main` = produksi |
| **Dari Claude (opsional)** | **`vercel`** (V): MCP Vercel + command `bootstrap`, `deploy`, `env`, `status` |
| **Prompt** | `Jalankan deploy checklist untuk PR ini. Lalu cek status Preview di Vercel. Kalau build gagal, baca lognya dan perbaiki.` |
| **Manusia** | Cek Preview URL di HP, lalu **klik Merge** |
| **Wow** | Preview URL dibuka di HP sebelum merge. Setelah merge, produksi berubah dalam ±1 menit |
| **Catatan ISMS** | Plugin `vercel` memasang hook dan telemetry-nya menyala secara default (`VERCEL_PLUGIN_TELEMETRY=off`) |

## Step 10 · Dokumentasi yang selalu up to date
Dokumentasi diperbarui di **dua momen**.

**a) Saat ada PRD baru: dokumentasi ikut di PR yang sama**

| | |
|---|---|
| **Pakai** | **`engineering`** (A): skill **`documentation`** (README, docs arsitektur, runbook) |
| **Aturan di CLAUDE.md** | "Setiap PR fitur wajib memperbarui README (daftar fitur), `docs/CHANGELOG.md`, dan `docs/design/`. PR tanpa update dokumentasi belum selesai." |
| **Penegak** | Reviewer di Step 7 mengecek dokumentasi ikut berubah, jadi dokumentasi masuk bersama code dan direview bersama |
| **Prompt** | `Perbarui README, docs/CHANGELOG.md, dan docs/design/ sesuai perubahan di branch ini.` |

**b) Saat ada deployment baru: catatan rilis otomatis**

| | |
|---|---|
| **Pakai** | **GitHub Actions** + `claude-code-action`. Pemicunya event deployment sukses dari Vercel ke GitHub (`deployment_status`), atau push ke `main` |
| **Isi tugas** | Tambahkan entri di `docs/RELEASES.md` (tanggal, URL produksi, PRD yang dirilis, ringkasan perubahan), lalu buka PR dokumentasi kecil |
| **Pendukung** | **`product-management`** (A): skill **`stakeholder-update`** untuk pengumuman rilis yang ramah non-teknis |
| **Wajib dijaga** | Cegah putaran tanpa akhir: workflow dilewati kalau commit hanya mengubah `docs/` atau dibuat oleh bot Claude |
| **Status** | **Perlu diuji.** Pastikan dulu Vercel mengirim status deployment ke GitHub di repo ini |

**Opsional, paling wow: situs dokumentasi.** Plugin **`mintlify`** (V) mengubah `docs/` jadi situs dokumentasi yang ikut ter-update setiap merge. Cek dulu paket gratisnya.

## Step 11 · Fitur baru (PRD v2) dan redeploy
| | |
|---|---|
| **Pakai** | `write-spec` (Step 1) → **`/feature-dev`** (A) → `/review-pr` → `/commit-push-pr` |
| **Isi `/feature-dev`** | Satu command dengan 7 fase: Discovery → Codebase Exploration → Clarifying Questions → Architecture Design → Implementation → Quality Review → Summary |
| **Prompt** | `Tulis PRD permintaan isi ulang untuk ATM yang kritis di docs/prd/v2-permintaan-isi-ulang.md`, lalu `/feature-dev Implementasi docs/prd/v2-permintaan-isi-ulang.md, test dulu, dan perbarui dokumentasi.` |
| **Hasil** | PR fitur baru + Preview URL → merge → produksi dan dokumentasi ter-update |
| **Wow** | Fitur kedua cukup dikerjakan dengan beberapa perintah, karena alurnya sudah terbentuk di step sebelumnya |

---

## Ringkasan satu baris per step

| Step | Pakai |
|---|---|
| 0 Setup | `create-next-app` + `claude-code-setup` |
| 1 PRD | `product-management` → `write-spec` |
| 2 Desain | `engineering` → `system-design`, `architecture` (ADR) + `context7` |
| 3 Database | `supabase` (MCP + skill) |
| 4 Test dulu | `engineering` → `testing-strategy` + Vitest |
| 5 Implementasi | `frontend-design` + `hookify` |
| 6 Test UI | MCP `playwright` |
| 7 Review | `/code-review`, `/security-review`, `pr-review-toolkit` |
| 8 PR | `commit-commands` + rule ask/deny |
| 9 Deploy | `engineering` → `deploy-checklist` + integrasi GitHub Vercel (+ plugin `vercel`) |
| 10 Dokumentasi | `engineering` → `documentation` di setiap PR + GitHub Actions saat deploy |
| 11 Fitur baru | `write-spec` → `/feature-dev` → `/review-pr` → `/commit-push-pr` |

## Catatan

- **Jangan pasang semua plugin sekaligus.** Setiap plugin aktif menambah context di setiap sesi (materi Sesi 4).
- Hampir semua alat utama buatan **Anthropic (A)**. Itu nilai jual untuk konteks Hitachi. Plugin **K** dan **V** tetap dievaluasi dulu: hook apa yang dipasang, data apa yang dikirim keluar.
- Skill `/prd-to-pr` yang sempat dibuat di `.claude/skills/` tidak dipakai lagi di kerangka ini. Boleh dihapus, atau disimpan sebagai contoh skill tim untuk Sesi 4.
