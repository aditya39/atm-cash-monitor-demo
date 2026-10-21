import { THRESHOLDS, type AtmRow, type Status } from "@/lib/atm";
import { formatRupiah } from "@/lib/format";
import { STATUS_FILL, StatusBadge } from "./StatusBadge";

const TICKS = [THRESHOLDS.kritis, THRESHOLDS.waspada];

// Level kas seperti isi kaset, dengan garis ambang status. Angka persennya tetap ditulis di sebelahnya.
function CashGauge({ percent, status }: { percent: number; status: Status }) {
  return (
    <div aria-hidden className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
      <div className={`h-full ${STATUS_FILL[status]}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      {TICKS.map((tick) => (
        <span key={tick} className="absolute inset-y-0 w-px bg-ink/40" style={{ left: `${tick}%` }} />
      ))}
    </div>
  );
}

// Di layar kecil kolom region, sisa kas, dan kapasitas digabung ke kolom ATM dan level kas.
export function AtmTable({ rows }: { rows: AtmRow[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">Daftar ATM, urut dari persentase sisa kas terendah</caption>
      <thead className="border-b border-ink text-sm text-muted">
        <tr>
          <th scope="col" className="py-2 pr-3 font-medium">Status</th>
          <th scope="col" className="py-2 pr-3 font-medium">ATM</th>
          <th scope="col" className="hidden py-2 pr-3 font-medium md:table-cell">Region</th>
          <th scope="col" className="py-2 pr-3 font-medium md:w-56">
            Level kas
            <span aria-hidden className="mt-1 hidden gap-3 text-xs md:flex">
              <span className="relative h-4 flex-1">
                {TICKS.map((tick) => (
                  <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${tick}%` }}>
                    {tick}%
                  </span>
                ))}
              </span>
              {/* Selebar kolom persen (w-11) di baris, supaya label sejajar dengan garis ambang. */}
              <span className="w-11 shrink-0" />
            </span>
          </th>
          <th scope="col" className="hidden py-2 pr-3 text-right font-medium md:table-cell">Sisa kas</th>
          <th scope="col" className="hidden py-2 text-right font-medium md:table-cell">Kapasitas</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((row) => (
          <tr key={row.id} className="align-top md:align-middle">
            <td className="py-3 pr-3">
              <StatusBadge status={row.status} />
            </td>
            <td className="py-3 pr-3">
              <span className="block font-semibold tabular-nums">{row.id}</span>
              <span className="block text-sm text-muted">{row.lokasi}</span>
              <span className="block text-sm text-muted md:hidden">{row.region}</span>
            </td>
            <td className="hidden py-3 pr-3 text-sm md:table-cell">{row.region}</td>
            <td className="py-3 pr-3">
              <div className="flex items-center gap-3">
                <CashGauge percent={row.percent} status={row.status} />
                <span className="w-11 shrink-0 text-right font-semibold tabular-nums">{row.percent}%</span>
              </div>
              <span className="mt-1 block text-sm tabular-nums text-muted md:hidden">
                {formatRupiah(row.sisaKas)} dari {formatRupiah(row.kapasitas)}
              </span>
            </td>
            <td className="hidden py-3 pr-3 text-right tabular-nums md:table-cell">{formatRupiah(row.sisaKas)}</td>
            <td className="hidden py-3 text-right tabular-nums text-muted md:table-cell">
              {formatRupiah(row.kapasitas)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
