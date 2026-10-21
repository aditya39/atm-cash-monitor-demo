// Integer rupiah dengan titik pemisah ribuan: 150000000 → "Rp150.000.000".
// Tidak memakai Intl currency karena locale id-ID menyisipkan spasi setelah "Rp".
export function formatRupiah(amount: number): string {
  return "Rp" + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// WIB adalah UTC+7 tanpa daylight saving, jadi cukup digeser 7 jam lalu dibaca sebagai UTC.
// Hasilnya tidak bergantung pada zona waktu atau data locale server.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

// Contoh: "22 Okt 2026, 14.05 WIB" (P1-4).
export function formatDataTime(date: Date): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS);
  const day = `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
  const time = `${pad(wib.getUTCHours())}.${pad(wib.getUTCMinutes())}`;
  return `${day}, ${time} WIB`;
}
