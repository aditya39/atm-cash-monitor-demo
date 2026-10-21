import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REGIONS, getStatus, type Atm } from "@/lib/atm";

// AC14: isi data dummy dicek langsung dari file migrasi seed,
// jadi tidak butuh koneksi Supabase.
const SEED_FILE = "supabase/migrations/20261022000100_seed_atms.sql";

// Format baris di file seed: ('ID', 'Lokasi', 'REGION', sisa_kas, kapasitas)
const ROW = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+)\)/g;

function seedAtms(): Atm[] {
  const sql = readFileSync(SEED_FILE, "utf8");
  return [...sql.matchAll(ROW)].map(([, id, lokasi, region, sisaKas, kapasitas]) => ({
    id,
    lokasi,
    region,
    sisaKas: Number(sisaKas),
    kapasitas: Number(kapasitas),
  }));
}

describe("seed ATM dummy (AC14)", () => {
  it("berisi 12 ATM dengan ID unik", () => {
    const atms = seedAtms();
    expect(atms).toHaveLength(12);
    expect(new Set(atms.map((a) => a.id)).size).toBe(12);
  });

  it("tersebar di 3 region: JKT-SEL, JKT-PUS, BDG", () => {
    expect(new Set(seedAtms().map((a) => a.region))).toEqual(new Set(REGIONS));
  });

  it("minimal satu ATM untuk setiap status", () => {
    const statuses = new Set(seedAtms().map((a) => getStatus(a.sisaKas, a.kapasitas)));
    expect(statuses).toEqual(new Set(["Kritis", "Waspada", "Aman"]));
  });

  it("minimal satu ATM Kritis di BDG", () => {
    const kritisBdg = seedAtms().filter(
      (a) => a.region === "BDG" && getStatus(a.sisaKas, a.kapasitas) === "Kritis",
    );
    expect(kritisBdg.length).toBeGreaterThanOrEqual(1);
  });

  it("tidak ada ATM berkapasitas 0", () => {
    expect(seedAtms().filter((a) => a.kapasitas === 0)).toEqual([]);
  });

  it("nama lokasi fiktif tanpa nama bank", () => {
    const bank = /\b(bank|bca|bri|bni|mandiri|btn|cimb|danamon|permata)\b/i;
    expect(seedAtms().filter((a) => bank.test(a.lokasi))).toEqual([]);
  });
});
