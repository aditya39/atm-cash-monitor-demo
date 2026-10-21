-- PRD v1 P0-5: sisa kas per ATM. Data dummy untuk demo.
-- Publik (anon key) hanya boleh SELECT (AC7). Tidak ada jalur tulis dari aplikasi di v1.

create table public.atms (
  id text primary key,
  lokasi text not null,
  region text not null,
  sisa_kas bigint not null check (sisa_kas >= 0),
  kapasitas bigint not null check (kapasitas >= 0)
);

comment on table public.atms is 'Sisa kas per ATM (data dummy, PRD v1).';
comment on column public.atms.sisa_kas is 'Sisa kas dalam integer rupiah.';
comment on column public.atms.kapasitas is 'Kapasitas kas dalam integer rupiah. Kapasitas 0 tetap ditampilkan sebagai Kritis.';

alter table public.atms enable row level security;

create policy "Publik boleh membaca ATM"
  on public.atms
  for select
  to anon, authenticated
  using (true);

-- Tanpa policy INSERT/UPDATE/DELETE, RLS sudah menolak penulisan.
-- Hak tabelnya juga dibatasi ke SELECT, supaya penolakan tidak hanya bergantung pada RLS
-- (TRUNCATE, misalnya, tidak diperiksa oleh RLS).
revoke all on public.atms from anon, authenticated;
grant select on public.atms to anon, authenticated;
