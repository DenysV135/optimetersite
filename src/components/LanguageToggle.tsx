import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ size = "sm" }: { size?: "sm" | "default" }) {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex rounded-full border bg-card p-0.5">
      <Button
        size={size}
        variant={lang === "uk" ? "default" : "ghost"}
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setLang("uk")}
      >
        UA
      </Button>
      <Button
        size={size}
        variant={lang === "en" ? "default" : "ghost"}
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setLang("en")}
      >
        EN
      </Button>
    </div>
  );
}
