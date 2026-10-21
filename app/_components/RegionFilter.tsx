import Link from "next/link";
import { REGIONS, type Region } from "@/lib/atm";

// Filter tersimpan di URL supaya tetap aktif setelah refresh dan bisa dibagikan (P1-3).
export function regionHref(region: Region | null): string {
  return region ? `/?region=${region}` : "/";
}

const OPTIONS = [
  { region: null, label: "Semua region" },
  ...REGIONS.map((region) => ({ region, label: region })),
];

export function RegionFilter({ active }: { active: Region | null }) {
  return (
    <nav aria-label="Filter region">
      <ul className="flex flex-wrap gap-2">
        {OPTIONS.map(({ region, label }) => {
          const isActive = region === active;
          return (
            <li key={label}>
              <Link
                href={regionHref(region)}
                aria-current={isActive ? "page" : undefined}
                className={`inline-block rounded-full border px-4 py-1.5 text-sm font-medium outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink ${
                  isActive
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-raised text-ink hover:border-ink"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
