import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, BarChart3, Camera, Droplets, Flame, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/AppLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Optimeter — Smart Meter Monitoring" },
      {
        name: "description",
        content:
          "Optimeter mounts on any water, gas or electricity meter, photographs the dial and shows every reading in a beautiful dashboard.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">{t("landing.cta.login")}</Link>
          </Button>
          <Button asChild>
            <Link to="/login">
              {t("landing.cta.start")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
            {t("landing.hero.badge")}
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            {t("landing.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/login">
                {t("landing.cta.start")}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/login">{t("landing.cta.login")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { icon: Camera, title: t("device.photo_proof"), desc: t("device.photo_desc") },
            { icon: BarChart3, title: t("dashboard.usage_chart"), desc: t("dashboard.subtitle") },
            { icon: ShieldCheck, title: t("dashboard.anomalies"), desc: t("anomaly.leak") },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 ring-soft">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-[color:var(--color-water)]" />
            {t("type.water")}
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[color:var(--color-gas)]" />
            {t("type.gas")}
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[color:var(--color-electricity)]" />
            {t("type.electricity")}
          </div>
        </div>
      </section>
    </div>
  );
}
