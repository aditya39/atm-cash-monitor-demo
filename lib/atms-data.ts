import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Atm } from "@/lib/atm";

// Supabase yang menggantung ditampilkan sebagai error (P1-2), bukan loading tanpa akhir.
const TIMEOUT_MS = 8_000;

export type AtmsResult = { ok: true; atms: Atm[] } | { ok: false };

// bigint dari PostgREST datang sebagai number JSON. Nilai di luar safe integer kehilangan presisi.
const isRupiah = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// Membaca semua ATM saat request (AC9) dengan anon key, jadi tunduk pada RLS (AC7).
// Kegagalan dikembalikan sebagai nilai. Detailnya hanya ditulis ke log server.
export async function getAtms(): Promise<AtmsResult> {
  // Query hanya jalan untuk request user sungguhan. Tanpa ini, Next juga memulai query di
  // render prerender saat request lalu membatalkannya, dan log server mencatat error palsu.
  await connection();

  // Dibaca di dalam fungsi, bukan di level modul, supaya build tetap jalan tanpa env var.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("[atms] NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi");
    return { ok: false };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("atms")
      .select("id, lokasi, region, sisa_kas, kapasitas")
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));

    if (error) {
      console.error("[atms] query gagal:", error.message);
      return { ok: false };
    }

    const invalid = data.find((row) => !isRupiah(row.sisa_kas) || !isRupiah(row.kapasitas));
    if (invalid) {
      console.error(`[atms] nominal tidak valid di ATM ${invalid.id}`);
      return { ok: false };
    }

    return {
      ok: true,
      atms: data.map((row) => ({
        id: row.id,
        lokasi: row.lokasi,
        region: row.region,
        sisaKas: row.sisa_kas,
        kapasitas: row.kapasitas,
      })),
    };
  } catch (error) {
    console.error("[atms] Supabase tidak bisa dihubungi:", error instanceof Error ? error.message : error);
    return { ok: false };
  }
}
