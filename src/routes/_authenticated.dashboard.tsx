import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Cpu,
  Droplets,
  Flame,
  Signal,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData, type MeterType } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useFormatters } from "@/lib/format";
import { MeterIcon, meterColorVar } from "@/components/MeterIcon";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview · Optimeter" }] }),
  component: DashboardPage,
});

type Period = "week" | "month" | "year";

function DashboardPage() {
  const { t } = useI18n();
  const { devices, readings } = useData();
  const { number, ago } = useFormatters();
  const [period, setPeriod] = useState<Period>("month");
  const navigate = useNavigate();

  const days = period === "week" ? 7 : period === "month" ? 30 : 60;

  // Aggregate per type per day
  const series = useMemo(() => {
    const out: Record<string, { date: string; water: number; gas: number; electricity: number }> = {};
    const cutoff = Date.now() - days * 86400_000;
    for (const r of readings) {
      const ts = new Date(r.date).getTime();
      if (ts < cutoff) continue;
      const key = r.date.split("T")[0];
      if (!out[key]) out[key] = { date: key, water: 0, gas: 0, electricity: 0 };
      const dev = devices.find((d) => d.id === r.deviceId);
      if (!dev) continue;
      out[key][dev.type] += r.delta;
    }
    return Object.values(out).sort((a, b) => a.date.localeCompare(b.date));
  }, [readings, devices, days]);

  const monthTotals = useMemo(() => {
    const totals: Record<MeterType, { current: number; previous: number }> = {
      water: { current: 0, previous: 0 },
      gas: { current: 0, previous: 0 },
      electricity: { current: 0, previous: 0 },
    };
    const now = Date.now();
    for (const r of readings) {
      const ts = new Date(r.date).getTime();
      const dev = devices.find((d) => d.id === r.deviceId);
      if (!dev) continue;
      if (ts > now - 30 * 86400_000) totals[dev.type].current += r.delta;
      else if (ts > now - 60 * 86400_000) totals[dev.type].previous += r.delta;
    }
    return totals;
  }, [readings, devices]);

  const distribution = useMemo(() => {
    // weight by an indicative "cost" so the pie reads as spending
    const cost = { water: 35, gas: 8, electricity: 4.5 } as Record<MeterType, number>;
    return (["water", "gas", "electricity"] as MeterType[]).map((type) => ({
      type,
      name: t(`type.${type}`),
      value: Math.round(monthTotals[type].current * cost[type]),
    }));
  }, [monthTotals, t]);

  const anomalies = useMemo(() => {
    const list: { id: string; type: "leak" | "spike" | "offline"; deviceId: string; date: string }[] = [];
    for (const r of readings) {
      if (r.anomaly) list.push({ id: r.id, type: r.anomaly, deviceId: r.deviceId, date: r.date });
    }
    for (const d of devices) {
      if (!d.online) list.push({ id: `off-${d.id}`, type: "offline", deviceId: d.id, date: d.lastSeen });
    }
    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [readings, devices]);

  const onlineCount = devices.filter((d) => d.online).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs sm:flex">
            <Signal className="h-3.5 w-3.5 text-[color:var(--color-success)]" />
            <span className="font-medium">
              {onlineCount}/{devices.length}
            </span>
            <span className="text-muted-foreground">{t("dashboard.devices_online")}</span>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="week">{t("dashboard.period.week")}</TabsTrigger>
              <TabsTrigger value="month">{t("dashboard.period.month")}</TabsTrigger>
              <TabsTrigger value="year">{t("dashboard.period.year")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(["water", "gas", "electricity"] as MeterType[]).map((type) => {
          const { current, previous } = monthTotals[type];
          const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
          const up = change > 0;
          const Icon = type === "water" ? Droplets : type === "gas" ? Flame : Zap;
          return (
            <Card key={type} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t(`type.${type}`)}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      {number(current)} <span className="text-base font-normal text-muted-foreground">{t(`unit.${type}`)}</span>
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs">
                      <span
                        className={
                          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium " +
                          (up ? "bg-destructive/10 text-destructive" : "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]")
                        }
                      >
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">{t("dashboard.vs_prev_month")}</span>
                    </p>
                  </div>
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl"
                    style={{ backgroundColor: `color-mix(in oklab, ${meterColorVar(type)} 18%, transparent)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: meterColorVar(type) }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.usage_chart")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  {(["water", "gas", "electricity"] as MeterType[]).map((tp) => (
                    <linearGradient id={`g-${tp}`} key={tp} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={meterColorVar(tp)} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={meterColorVar(tp)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => d.slice(5)}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="water"
                  name={t("type.water")}
                  stroke={meterColorVar("water")}
                  fill="url(#g-water)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="gas"
                  name={t("type.gas")}
                  stroke={meterColorVar("gas")}
                  fill="url(#g-gas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="electricity"
                  name={t("type.electricity")}
                  stroke={meterColorVar("electricity")}
                  fill="url(#g-electricity)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.distribution")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="var(--color-card)"
                >
                  {distribution.map((d) => (
                    <Cell key={d.type} fill={meterColorVar(d.type)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => `${v} ₴`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-[color:var(--color-warning)]" />
            {t("dashboard.anomalies")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {t("dashboard.no_anomalies")}
            </p>
          ) : (
            <ul className="divide-y">
              {anomalies.map((a) => {
                const dev = devices.find((d) => d.id === a.deviceId);
                if (!dev) return null;
                const severity = a.type === "leak" ? "high" : a.type === "spike" ? "medium" : "medium";
                const color =
                  severity === "high"
                    ? "var(--color-destructive)"
                    : "var(--color-warning)";
                return (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
                      >
                        <MeterIcon type={dev.type} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t(`anomaly.${a.type}`)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {dev.name} · {ago(a.date)} {t("common.ago")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          color,
                          backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
                        }}
                      >
                        {t(`anomaly.severity.${severity}`)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate({ to: "/devices/$id", params: { id: dev.id } })}
                      >
                        <Cpu className="mr-1.5 h-3.5 w-3.5" />
                        {t("devices.view")}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
