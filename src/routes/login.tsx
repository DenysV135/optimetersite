import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@optimeter.app");
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo />
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">{t("landing.hero.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("landing.hero.subtitle")}</p>
        </div>
        <p className="text-xs text-muted-foreground">© Optimeter · {new Date().getFullYear()}</p>
      </div>

      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between p-5">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <form onSubmit={onSubmit} className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.welcome_back")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>

            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={submitting} className="h-11 w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.signin")}
              </Button>
            </div>

            <p className="mt-6 rounded-lg border bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              {t("auth.demo_hint")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
