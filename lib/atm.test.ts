import { describe, expect, it } from "vitest";
import {
  REGIONS,
  buildDashboard,
  getDisplayPercent,
  getStatus,
  parseRegion,
  sortAtms,
  type Atm,
} from "@/lib/atm";

// Expected value di file ini diambil dari acceptance criteria
// docs/prd/v1-dashboard-kas.md, bukan dari implementasi.

function atm(id: string, region: string, sisaKas: number, kapasitas: number): Atm {
  return { id, lokasi: `Lokasi ${id}`, region, sisaKas, kapasitas };
}

const ids = (atms: Atm[]) => atms.map((a) => a.id);

describe("getStatus dan getDisplayPercent (P0-1)", () => {
  it("AC1: kapasitas Rp200.000.000, sisa Rp38.000.000 (19%) Kritis, sisa Rp40.000.000 (tepat 20%) Waspada", () => {
    expect(getStatus(38_000_000, 200_000_000)).toBe("Kritis");
    expect(getStatus(40_000_000, 200_000_000)).toBe("Waspada");
  });

  it("AC2: kapasitas Rp200.000.000, sisa Rp78.000.000 (39%) Waspada, sisa Rp80.000.000 (tepat 40%) Aman", () => {
    expect(getStatus(78_000_000, 200_000_000)).toBe("Waspada");
    expect(getStatus(80_000_000, 200_000_000)).toBe("Aman");
  });

  it("AC3: kapasitas 0 tidak error, berstatus Kritis, dan persentasenya 0%", () => {
    expect(getStatus(0, 0)).toBe("Kritis");
    expect(getStatus(5_000_000, 0)).toBe("Kritis");
    expect(getDisplayPercent(0, 0)).toBe(0);
    expect(getDisplayPercent(5_000_000, 0)).toBe(0);
  });

  it("AC10: kapasitas Rp150.000.000, sisa Rp29.999.999 (19,99…%) tampil 19% dan Kritis", () => {
    expect(getDisplayPercent(29_999_999, 150_000_000)).toBe(19);
    expect(getStatus(29_999_999, 150_000_000)).toBe("Kritis");
  });

  it("AC1, AC2, AC10: persentase tampil cocok dengan badge di sekitar batas 20% dan 40%", () => {
    expect(getDisplayPercent(38_000_000, 200_000_000)).toBe(19);
    expect(getDisplayPercent(40_000_000, 200_000_000)).toBe(20);
    expect(getDisplayPercent(78_000_000, 200_000_000)).toBe(39);
    expect(getDisplayPercent(80_000_000, 200_000_000)).toBe(40);
  });

  it("Q2: sisa kas di atas kapasitas tampil apa adanya dan berstatus Aman", () => {
    expect(getDisplayPercent(210_000_000, 200_000_000)).toBe(105);
    expect(getStatus(210_000_000, 200_000_000)).toBe("Aman");
  });
});

describe("sortAtms (P0-2)", () => {
  it("AC4: urut dari persentase terendah, memakai nilai sebelum dibulatkan (19,2% di atas 19,8%)", () => {
    const persen198 = atm("ATM-A", "BDG", 49_500_000, 250_000_000);
    const persen192 = atm("ATM-B", "BDG", 48_000_000, 250_000_000);
    const persen40 = atm("ATM-C", "BDG", 80_000_000, 200_000_000);

    expect(getDisplayPercent(48_000_000, 250_000_000)).toBe(19);
    expect(getDisplayPercent(49_500_000, 250_000_000)).toBe(19);
    expect(ids(sortAtms([persen40, persen198, persen192]))).toEqual(["ATM-B", "ATM-A", "ATM-C"]);
  });

  it("AC11: persentase persis sama diurutkan berdasarkan ID secara alfabet", () => {
    const jks03 = atm("ATM-JKS-03", "JKT-SEL", 90_000_000, 300_000_000);
    const bdg10 = atm("ATM-BDG-10", "BDG", 30_000_000, 100_000_000);
    const bdg03 = atm("ATM-BDG-03", "BDG", 60_000_000, 200_000_000);

    expect(ids(sortAtms([jks03, bdg10, bdg03]))).toEqual(["ATM-BDG-03", "ATM-BDG-10", "ATM-JKS-03"]);
  });

  it("AC3: ATM berkapasitas 0 dianggap 0% sehingga tampil di atas ATM 1%", () => {
    const persen1 = atm("ATM-A", "BDG", 2_000_000, 200_000_000);
    const kapasitasNol = atm("ATM-Z", "BDG", 5_000_000, 0);

    expect(ids(sortAtms([persen1, kapasitasNol]))).toEqual(["ATM-Z", "ATM-A"]);
  });

  it("tidak mengubah urutan array asli", () => {
    const input = [atm("ATM-A", "BDG", 80_000_000, 200_000_000), atm("ATM-B", "BDG", 10_000_000, 200_000_000)];
    sortAtms(input);
    expect(ids(input)).toEqual(["ATM-A", "ATM-B"]);
  });
});

describe("parseRegion (P0-3, P1-3)", () => {
  it("pilihan filter adalah JKT-SEL, JKT-PUS, dan BDG", () => {
    expect([...REGIONS]).toEqual(["JKT-SEL", "JKT-PUS", "BDG"]);
  });

  it("menerima region dari URL, misalnya ?region=BDG", () => {
    expect(parseRegion("BDG")).toBe("BDG");
    expect(parseRegion("JKT-SEL")).toBe("JKT-SEL");
    expect(parseRegion("JKT-PUS")).toBe("JKT-PUS");
  });

  it("tanpa region atau region tidak dikenal berarti Semua region", () => {
    expect(parseRegion(undefined)).toBeNull();
    expect(parseRegion("")).toBeNull();
    expect(parseRegion("SBY")).toBeNull();
    expect(parseRegion("bdg")).toBeNull();
  });

  it("memakai nilai pertama jika region muncul lebih dari sekali di URL", () => {
    expect(parseRegion(["BDG", "JKT-PUS"])).toBe("BDG");
  });
});

// 12 ATM, 4 per region. Persentase dan status dihitung manual dari aturan P0-1.
const SEMUA_ATM: Atm[] = [
  atm("ATM-JKS-01", "JKT-SEL", 30_000_000, 200_000_000), // 15%, Kritis
  atm("ATM-JKS-02", "JKT-SEL", 45_000_000, 100_000_000), // 45%, Aman
  atm("ATM-JKS-03", "JKT-SEL", 90_000_000, 300_000_000), // 30%, Waspada
  atm("ATM-JKS-04", "JKT-SEL", 141_000_000, 150_000_000), // 94%, Aman
  atm("ATM-JKP-01", "JKT-PUS", 120_000_000, 300_000_000), // 40%, Aman
  atm("ATM-JKP-02", "JKT-PUS", 25_000_000, 250_000_000), // 10%, Kritis
  atm("ATM-JKP-03", "JKT-PUS", 78_000_000, 200_000_000), // 39%, Waspada
  atm("ATM-JKP-04", "JKT-PUS", 40_000_000, 200_000_000), // 20%, Waspada
  atm("ATM-BDG-01", "BDG", 49_500_000, 250_000_000), // 19,8%, Kritis
  atm("ATM-BDG-02", "BDG", 48_000_000, 250_000_000), // 19,2%, Kritis
  atm("ATM-BDG-03", "BDG", 60_000_000, 200_000_000), // 30%, Waspada
  atm("ATM-BDG-04", "BDG", 120_000_000, 150_000_000), // 80%, Aman
];

describe("buildDashboard (P0-2, P0-3, P0-4, P1-1)", () => {
  it("AC13: Semua region menampilkan ke-12 ATM", () => {
    expect(buildDashboard(SEMUA_ATM, null).rows).toHaveLength(12);
  });

  it("AC5: filter BDG hanya menampilkan ATM region BDG", () => {
    const { rows } = buildDashboard(SEMUA_ATM, "BDG");
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.region === "BDG")).toBe(true);
  });

  it("AC4, AC11: baris tampil terurut dari persentase terendah, seri diurutkan berdasarkan ID", () => {
    expect(ids(buildDashboard(SEMUA_ATM, null).rows)).toEqual([
      "ATM-JKP-02", // 10%
      "ATM-JKS-01", // 15%
      "ATM-BDG-02", // 19,2%
      "ATM-BDG-01", // 19,8%
      "ATM-JKP-04", // 20%
      "ATM-BDG-03", // 30%, seri dengan ATM-JKS-03
      "ATM-JKS-03", // 30%
      "ATM-JKP-03", // 39%
      "ATM-JKP-01", // 40%
      "ATM-JKS-02", // 45%
      "ATM-BDG-04", // 80%
      "ATM-JKS-04", // 94%
    ]);
  });

  it("AC12: setiap baris membawa persentase tampil dan status", () => {
    const bdg01 = buildDashboard(SEMUA_ATM, "BDG").rows.find((row) => row.id === "ATM-BDG-01");
    expect(bdg01).toMatchObject({
      id: "ATM-BDG-01",
      lokasi: "Lokasi ATM-BDG-01",
      region: "BDG",
      sisaKas: 49_500_000,
      kapasitas: 250_000_000,
      percent: 19,
      status: "Kritis",
    });
  });

  it("AC6: ringkasan mengikuti filter yang aktif", () => {
    expect(buildDashboard(SEMUA_ATM, null).summary).toEqual({ Kritis: 4, Waspada: 4, Aman: 4 });
    expect(buildDashboard(SEMUA_ATM, "BDG").summary).toEqual({ Kritis: 2, Waspada: 1, Aman: 1 });
    expect(buildDashboard(SEMUA_ATM, "JKT-PUS").summary).toEqual({ Kritis: 1, Waspada: 2, Aman: 1 });
  });

  it("AC6: jumlah di ringkasan selalu sama dengan isi daftar yang tampil", () => {
    for (const region of [null, ...REGIONS]) {
      const { rows, summary } = buildDashboard(SEMUA_ATM, region);
      expect(summary.Kritis + summary.Waspada + summary.Aman).toBe(rows.length);
      expect(summary.Kritis).toBe(rows.filter((row) => row.status === "Kritis").length);
      expect(summary.Waspada).toBe(rows.filter((row) => row.status === "Waspada").length);
      expect(summary.Aman).toBe(rows.filter((row) => row.status === "Aman").length);
    }
  });

  it("tidak ada pesan kosong jika ada ATM yang tampil", () => {
    expect(buildDashboard(SEMUA_ATM, "BDG").emptyMessage).toBeNull();
  });

  it("P1-1: tabel kosong menampilkan 'Belum ada data ATM.' dan ringkasan 0", () => {
    for (const region of [null, "BDG" as const]) {
      const dashboard = buildDashboard([], region);
      expect(dashboard.rows).toEqual([]);
      expect(dashboard.emptyMessage).toBe("Belum ada data ATM.");
      expect(dashboard.summary).toEqual({ Kritis: 0, Waspada: 0, Aman: 0 });
    }
  });

  it("P1-1: filter tanpa hasil menampilkan 'Tidak ada ATM di region ini.' dan ringkasan 0", () => {
    const tanpaBdg = SEMUA_ATM.filter((a) => a.region !== "BDG");
    const dashboard = buildDashboard(tanpaBdg, "BDG");
    expect(dashboard.rows).toEqual([]);
    expect(dashboard.emptyMessage).toBe("Tidak ada ATM di region ini.");
    expect(dashboard.summary).toEqual({ Kritis: 0, Waspada: 0, Aman: 0 });
  });
});
