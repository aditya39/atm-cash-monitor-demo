-- PRD v1 AC14: 12 ATM dummy di 3 region. Nama lokasi fiktif, tanpa nama bank.
-- lib/seed.test.ts membaca file ini. Pertahankan format satu ATM per baris:
-- ('ID', 'Lokasi', 'REGION', sisa_kas, kapasitas)

insert into public.atms (id, lokasi, region, sisa_kas, kapasitas) values
  ('ATM-JKS-01', 'Apartemen Lili Tower A', 'JKT-SEL', 30000000, 200000000),         -- 15%, Kritis
  ('ATM-JKS-02', 'Minimarket Seroja 24 Jam', 'JKT-SEL', 45000000, 100000000),       -- 45%, Aman
  ('ATM-JKS-03', 'Gedung Bougenville Lt. 1', 'JKT-SEL', 90000000, 300000000),       -- 30%, Waspada (seri dengan ATM-BDG-03)
  ('ATM-JKS-04', 'SPBU Flamboyan', 'JKT-SEL', 141000000, 150000000),                -- 94%, Aman
  ('ATM-JKP-01', 'Stasiun Kemuning Pintu Utara', 'JKT-PUS', 120000000, 300000000),  -- tepat 40%, Aman
  ('ATM-JKP-02', 'Pusat Grosir Teratai Blok B', 'JKT-PUS', 25000000, 250000000),    -- 10%, Kritis
  ('ATM-JKP-03', 'Hotel Anggrek Lobi Barat', 'JKT-PUS', 78000000, 200000000),       -- 39%, Waspada
  ('ATM-JKP-04', 'Mal Dahlia Lantai Dasar', 'JKT-PUS', 40000000, 200000000),        -- tepat 20%, Waspada
  ('ATM-BDG-01', 'Ruko Kenanga Raya', 'BDG', 49500000, 250000000),                  -- 19,8% (tampil 19%), Kritis
  ('ATM-BDG-02', 'Plaza Cendana Lt. 1', 'BDG', 48000000, 250000000),                -- 19,2% (tampil 19%), Kritis
  ('ATM-BDG-03', 'Terminal Angsana', 'BDG', 60000000, 200000000),                   -- 30%, Waspada
  ('ATM-BDG-04', 'Kampus Swadaya Gedung B', 'BDG', 120000000, 150000000)            -- 80%, Aman
on conflict (id) do nothing;
