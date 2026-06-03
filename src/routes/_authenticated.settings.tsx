import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useData, type CaptureInterval } from "@/lib/data";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · Optimeter" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { settings, updateSettings } = useData();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("settings.language")}</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">Українська</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("settings.theme")}</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="mr-1.5 h-4 w-4" />
                {t("settings.theme.light")}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="mr-1.5 h-4 w-4" />
                {t("settings.theme.dark")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.capture")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("settings.capture_desc")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label>{t("settings.capture")}</Label>
            <Select
              value={settings.captureInterval}
              onValueChange={(v) => {
                updateSettings({ captureInterval: v as CaptureInterval });
                toast.success(t("settings.saved"));
              }}
            >
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">{t("settings.interval.15m")}</SelectItem>
                <SelectItem value="1h">{t("settings.interval.1h")}</SelectItem>
                <SelectItem value="6h">{t("settings.interval.6h")}</SelectItem>
                <SelectItem value="12h">{t("settings.interval.12h")}</SelectItem>
                <SelectItem value="24h">{t("settings.interval.24h")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">{t("settings.notifications")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.notifications_desc")}</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(c) => {
                updateSettings({ notifications: c });
                toast.success(t("settings.saved"));
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.account")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              toast.success(t("toast.logged_out"));
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
