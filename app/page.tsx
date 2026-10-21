import { Suspense } from "react";
import { buildDashboard, parseRegion } from "@/lib/atm";
import { getAtms } from "@/lib/atms-data";
import { formatDataTime } from "@/lib/format";
import { AtmTable } from "./_components/AtmTable";
import { LoadError, RELOAD_BUTTON } from "./_components/LoadError";
import { RegionFilter, regionHref } from "./_components/RegionFilter";
import { StatusSummary } from "./_components/StatusSummary";

// Judul dan petunjuk ikut shell statis. Data ATM dirender saat request di dalam <Suspense>
// (cacheComponents aktif), jadi angka selalu terbaru tanpa redeploy (AC9).
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl font-extrabold tracking-tight font-stretch-condensed sm:text-6xl">
          Sisa kas ATM
        </h1>
        <p className="max-w-prose text-muted">
          Urut dari sisa kas terendah. ATM paling atas diisi ulang lebih dulu.
        </p>
      </header>

      <Suspense fallback={<p role="status" className="text-muted">Memuat data sisa kas…</p>}>
        <Dashboard searchParams={searchParams} />
      </Suspense>

      <footer className="mt-auto border-t border-line pt-4 text-sm text-muted">
        Aplikasi demo. Semua data dummy, bukan data bank mana pun.
      </footer>
    </main>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const region = parseRegion((await searchParams).region);
  const result = await getAtms();

  // P1-2: tanpa ringkasan dan tanpa data lama, supaya tidak terlihat seolah semua ATM aman.
  if (!result.ok) {
    return (
      <LoadError>
        {/* <a>, bukan <Link>, supaya browser memuat ulang halaman sepenuhnya. */}
        <a href={regionHref(region)} className={RELOAD_BUTTON}>
          Muat ulang
        </a>
      </LoadError>
    );
  }

  const loadedAt = new Date();
  const { rows, summary, emptyMessage } = buildDashboard(result.atms, region);

  return (
    <section aria-label="Sisa kas per ATM" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RegionFilter active={region} />
        <p className="text-sm text-muted">
          Data per <time dateTime={loadedAt.toISOString()}>{formatDataTime(loadedAt)}</time>
        </p>
      </div>

      <StatusSummary summary={summary} />

      {emptyMessage ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-10 text-center text-muted">
          {emptyMessage}
        </p>
      ) : (
        <AtmTable rows={rows} />
      )}
    </section>
  );
}
