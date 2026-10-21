import { STATUSES, type Status } from "@/lib/atm";
import { STATUS_FILL } from "./StatusBadge";

// Jumlah ATM per status untuk filter yang aktif (AC6).
export function StatusSummary({ summary }: { summary: Record<Status, number> }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-line border-y border-line">
      {STATUSES.map((status) => {
        const urgent = status === "Kritis" && summary[status] > 0;
        return (
          <div key={status} className="flex flex-col gap-1 px-3 py-4 first:pl-0 sm:px-6">
            <dt className="flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className={`size-2.5 rounded-full ${STATUS_FILL[status]}`} />
              {status}
            </dt>
            <dd className={`text-4xl font-bold tabular-nums font-stretch-condensed ${urgent ? "text-kritis" : ""}`}>
              {summary[status]}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
