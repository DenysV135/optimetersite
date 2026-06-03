import { useI18n } from "@/lib/i18n";

export function timeAgo(iso: string, lang: "uk" | "en"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return lang === "uk" ? "щойно" : "just now";
  if (m < 60) return `${m} ${lang === "uk" ? "хв" : "min"}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${lang === "uk" ? "год" : "h"}`;
  const d = Math.floor(h / 24);
  return `${d} ${lang === "uk" ? "дн" : "d"}`;
}

export function useFormatters() {
  const { lang } = useI18n();
  const locale = lang === "uk" ? "uk-UA" : "en-US";
  return {
    date: (iso: string) =>
      new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }),
    dateTime: (iso: string) =>
      new Date(iso).toLocaleString(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    number: (n: number, digits = 2) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n),
    ago: (iso: string) => timeAgo(iso, lang),
  };
}
