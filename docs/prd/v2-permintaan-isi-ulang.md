# PRD v2: Permintaan Isi Ulang

Status: disetujui untuk demo · Data: dummy · Bergantung pada PRD v1

## Masalah
Setelah melihat ATM yang kritis di dashboard, operator masih meminta isi ulang lewat chat. Tidak ada catatan siapa meminta apa, dan statusnya tidak terlihat.

## Pengguna
- **Operator kas**: membuat permintaan isi ulang dan memperbarui statusnya.

## Yang dibangun
1. Tombol **Minta isi ulang** di setiap ATM berstatus Kritis atau Waspada.
2. Form: nominal (rupiah) dan catatan opsional.
3. Tabel Supabase `refill_requests`: `atm_id`, `amount`, `note`, `status`, `created_at`.
4. Status permintaan: `diminta` → `dikirim` → `selesai`.
5. Badge **Isi ulang: diminta/dikirim** di baris ATM yang punya permintaan aktif.
6. Halaman `/permintaan` berisi semua permintaan, terbaru di atas.

## Non-goals
- Login dan approval berjenjang
- Mengubah sisa kas ATM secara otomatis setelah status `selesai`
- Notifikasi email atau chat

## Acceptance criteria (bisa dicek pass/fail)
- [ ] AC1: Nominal harus bilangan bulat > 0 dan kelipatan Rp50.000. Nominal 0, negatif, atau Rp75.000 ditolak.
- [ ] AC2: Nominal tidak boleh melebihi ruang kosong ATM (`kapasitas - sisa kas`).
- [ ] AC3: Status hanya boleh maju satu langkah: `diminta` → `dikirim` → `selesai`. Lompat dari `diminta` ke `selesai` ditolak, mundur juga ditolak.
- [ ] AC4: Satu ATM hanya boleh punya satu permintaan aktif (`diminta` atau `dikirim`).
- [ ] AC5: Tombol **Minta isi ulang** tidak muncul untuk ATM berstatus Aman.
- [ ] AC6: Tabel `refill_requests` memakai RLS. Tulis data hanya lewat server (route handler atau server action), bukan langsung dari browser dengan anon key.
- [ ] AC7: Semua test v1 tetap lulus.

## Catatan teknis
- Aturan AC1–AC3 ditulis sebagai fungsi murni di `lib/` dan diuji lebih dulu.
- Fitur dikerjakan di branch baru dan masuk lewat PR. Vercel membuat Preview URL untuk PR itu.
