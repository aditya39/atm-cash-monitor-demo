import { describe, expect, it } from "vitest";
import { formatDataTime, formatRupiah } from "@/lib/format";

// Expected value diambil dari docs/prd/v1-dashboard-kas.md dan .claude/CLAUDE.md.

describe("formatRupiah (AC8)", () => {
  it("150000000 tampil Rp150.000.000", () => {
    expect(formatRupiah(150_000_000)).toBe("Rp150.000.000");
  });

  it("0 tampil Rp0", () => {
    expect(formatRupiah(0)).toBe("Rp0");
  });

  it("150000 tampil Rp150.000, tanpa spasi setelah Rp", () => {
    expect(formatRupiah(150_000)).toBe("Rp150.000");
  });

  it("angka di bawah seribu tampil tanpa pemisah", () => {
    expect(formatRupiah(999)).toBe("Rp999");
  });
});

describe("formatDataTime (P1-4)", () => {
  it("tampil seperti contoh PRD: 22 Okt 2026, 14.05 WIB", () => {
    expect(formatDataTime(new Date("2026-10-22T07:05:00Z"))).toBe("22 Okt 2026, 14.05 WIB");
  });

  it("memakai zona WIB walaupun tanggal UTC-nya berbeda", () => {
    expect(formatDataTime(new Date("2026-12-31T18:00:00Z"))).toBe("1 Jan 2027, 01.00 WIB");
  });

  it("jam dan menit satu digit diberi nol di depan", () => {
    expect(formatDataTime(new Date("2026-03-04T02:03:00Z"))).toBe("4 Mar 2026, 09.03 WIB");
  });
});
