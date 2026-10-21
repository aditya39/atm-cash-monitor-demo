"use client";

import { LoadError, RELOAD_BUTTON } from "./_components/LoadError";

// Jaring pengaman untuk error yang tidak terduga. Kegagalan Supabase sudah ditangani
// di halaman sebagai nilai, jadi file ini hanya muncul kalau ada bug.
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <LoadError>
        <button type="button" onClick={() => retry()} className={RELOAD_BUTTON}>
          Muat ulang
        </button>
      </LoadError>
    </main>
  );
}
