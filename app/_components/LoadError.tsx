import type { ReactNode } from "react";

export const RELOAD_BUTTON =
  "rounded-full border border-ink px-4 py-1.5 text-sm font-medium outline-offset-2 hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-ink";

// Pesan P1-2. Dipakai halaman (Supabase gagal) dan app/error.tsx (error tak terduga).
export function LoadError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 border-l-4 border-kritis bg-raised px-5 py-4">
      <p className="font-semibold">Data sisa kas gagal dimuat. Coba muat ulang.</p>
      {children}
    </div>
  );
}
