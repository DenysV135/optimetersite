import { Link, useNavigate, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Cpu, Home, Settings as SettingsIcon, LogOut, Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";

export function AppLayout() {
  const { t } = useI18n();
  const { logout, user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/devices", label: t("nav.devices"), icon: Cpu },
    { to: "/apartments", label: t("nav.apartments"), icon: Home },
    { to: "/settings", label: t("nav.settings"), icon: SettingsIcon },
  ] as const;

  const handleLogout = () => {
    logout();
    toast.success(t("toast.logged_out"));
    navigate({ to: "/login" });
  };

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((it) => {
        const active = pathname === it.to || pathname.startsWith(it.to + "/");
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClick}
            className={
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent")
            }
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo />
        </div>
        <div className="mt-2 flex-1">
          <NavList />
        </div>
        <div className="border-t p-3">
          <div className="flex items-center justify-between rounded-xl bg-sidebar-accent/60 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={handleLogout} title={t("nav.logout")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex h-16 items-center gap-2 px-5">
                  <Logo />
                </div>
                <NavList onClick={() => setOpen(false)} />
                <div className="mt-4 border-t p-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Logo compact />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <Button size="icon" variant="ghost" onClick={toggle} title="Theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2">
      <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-[color:var(--color-water)] text-primary-foreground shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">Optimeter</p>
          <p className="text-[11px] text-muted-foreground">smart metering</p>
        </div>
      )}
    </Link>
  );
}
