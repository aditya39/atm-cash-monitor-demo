import type { Status } from "@/lib/atm";

export const STATUS_FILL: Record<Status, string> = {
  Kritis: "bg-kritis",
  Waspada: "bg-waspada",
  Aman: "bg-aman",
};

const BADGE: Record<Status, string> = {
  Kritis: "bg-kritis text-kritis-ink",
  Waspada: "bg-waspada text-waspada-ink",
  Aman: "bg-aman text-aman-ink",
};

// Badge selalu menampilkan teks status, tidak hanya warna (P0-1).
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${BADGE[status]}`}>
      {status}
    </span>
  );
}
