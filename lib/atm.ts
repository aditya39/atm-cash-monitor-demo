// Ambang status dalam persen. Satu-satunya tempat angka 20 dan 40 ditulis (PRD P2).
export const THRESHOLDS = { kritis: 20, waspada: 40 } as const;

export const REGIONS = ["JKT-SEL", "JKT-PUS", "BDG"] as const;
export type Region = (typeof REGIONS)[number];

export const STATUSES = ["Kritis", "Waspada", "Aman"] as const;
export type Status = (typeof STATUSES)[number];

export type Atm = {
  id: string;
  lokasi: string;
  region: string;
  sisaKas: number;
  kapasitas: number;
};

export type AtmRow = Atm & { percent: number; status: Status };

export type Dashboard = {
  rows: AtmRow[];
  summary: Record<Status, number>;
  emptyMessage: string | null;
};

export function getStatus(sisaKas: number, kapasitas: number): Status {
  // Kapasitas 0 dicek lebih dulu. Tanpa cek ini, perbandingan di bawah memberi Aman (AC3).
  if (kapasitas === 0) return "Kritis";
  // Dibandingkan sebagai integer supaya tidak ada error pembulatan desimal.
  if (sisaKas * 100 < THRESHOLDS.kritis * kapasitas) return "Kritis";
  if (sisaKas * 100 < THRESHOLDS.waspada * kapasitas) return "Waspada";
  return "Aman";
}

export function getDisplayPercent(sisaKas: number, kapasitas: number): number {
  if (kapasitas === 0) return 0;
  // Dibulatkan ke bawah supaya angka yang tampil selalu cocok dengan badge (AC10).
  return Math.floor((sisaKas * 100) / kapasitas);
}

function ratio(atm: Atm): number {
  return atm.kapasitas === 0 ? 0 : atm.sisaKas / atm.kapasitas;
}

function compareId(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Urut dari persentase sebelum dibulatkan (AC4). Seri diurutkan berdasarkan ID (AC11).
export function sortAtms(atms: readonly Atm[]): Atm[] {
  return [...atms].sort((a, b) => ratio(a) - ratio(b) || compareId(a.id, b.id));
}

// Region dari URL (?region=BDG). Nilai di luar pilihan filter berarti Semua region.
export function parseRegion(raw: string | string[] | undefined): Region | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return REGIONS.find((region) => region === value) ?? null;
}

function getEmptyMessage(totalAtms: number, visibleAtms: number): string | null {
  if (totalAtms === 0) return "Belum ada data ATM.";
  if (visibleAtms === 0) return "Tidak ada ATM di region ini.";
  return null;
}

// Daftar dan ringkasan dihitung dari baris yang sama, jadi jumlahnya selalu cocok (AC6).
export function buildDashboard(atms: readonly Atm[], region: Region | null): Dashboard {
  const visible = region ? atms.filter((atm) => atm.region === region) : atms;
  const rows = sortAtms(visible).map((atm) => ({
    ...atm,
    percent: getDisplayPercent(atm.sisaKas, atm.kapasitas),
    status: getStatus(atm.sisaKas, atm.kapasitas),
  }));

  const summary: Record<Status, number> = { Kritis: 0, Waspada: 0, Aman: 0 };
  for (const row of rows) summary[row.status] += 1;

  return { rows, summary, emptyMessage: getEmptyMessage(atms.length, rows.length) };
}
