import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Camera, Image as ImageIcon, Signal, SignalZero, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useData } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useFormatters } from "@/lib/format";
import { MeterIcon, meterColorVar } from "@/components/MeterIcon";
import { MeterPhoto } from "@/components/MeterPhoto";

export const Route = createFileRoute("/_authenticated/devices/$id")({
  head: () => ({ meta: [{ title: "Device · Optimeter" }] }),
  component: DeviceDetail,
});

function DeviceDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { devices, apartments, getDeviceReadings } = useData();
  const { date, dateTime, number, ago } = useFormatters();
  const navigate = useNavigate();
  const [photoFor, setPhotoFor] = useState<string | null>(null);

  const device = devices.find((d) => d.id === id);
  const readings = useMemo(() => (device ? getDeviceReadings(device.id) : []), [device, getDeviceReadings]);
  const apartment = device ? apartments.find((a) => a.id === device.apartmentId) : undefined;

  if (!device) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Device not found</p>
            <Button asChild className="mt-4">
              <Link to="/devices">{t("device.back")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = readings.slice(-30).map((r) => ({
    date: r.date.slice(5, 10),
    delta: r.delta,
    anomaly: !!r.anomaly,
  }));

  const color = meterColorVar(device.type);
  const lastReading = readings.at(-1);
  const prev = readings.at(-2);
  const change =
    lastReading && prev && prev.delta > 0 ? ((lastReading.delta - prev.delta) / prev.delta) * 100 : 0;

  const photoReading = readings.find((r) => r.id === photoFor) || null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate({ to: "/devices" })}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t("device.back")}
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)` }}
          >
            <MeterIcon type={device.type} className="h-7 w-7" style={{ color }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{device.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {apartment?.name} · {device.serial}
            </p>
          </div>
        </div>
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
            (device.online
              ? "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]"
              : "bg-muted text-muted-foreground")
          }
        >
          {device.online ? <Signal className="h-3.5 w-3.5" /> : <SignalZero className="h-3.5 w-3.5" />}
          {device.online ? t("devices.status.online") : t("devices.status.offline")}
        </span>
      </header>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{t("dashboard.last_reading")}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {number(device.currentValue)}{" "}
              <span className="text-base font-normal text-muted-foreground">{t(`unit.${device.type}`)}</span>
            </p>
            {lastReading && (
              <p className="mt-1 text-xs text-muted-foreground">
                {ago(lastReading.date)} {t("common.ago")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{t("dashboard.month_usage")}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {number(readings.filter((r) => new Date(r.date).getTime() > Date.now() - 30 * 86400_000).reduce((s, r) => s + r.delta, 0))}{" "}
              <span className="text-base font-normal text-muted-foreground">{t(`unit.${device.type}`)}</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs">
              <span
                className={
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium " +
                  (change > 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]")
                }
              >
                {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{t("device.confidence")}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {lastReading ? (lastReading.confidence * 100).toFixed(1) : "—"}
              <span className="text-base font-normal text-muted-foreground">%</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("device.recognized")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("dashboard.usage_chart")}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="delta" name={t("device.delta")} radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.anomaly ? "var(--color-destructive)" : color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("device.history")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t("device.date")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("device.reading")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("device.delta")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("device.confidence")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("device.photo")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...readings].reverse().slice(0, 30).map((r) => (
                  <tr key={r.id} className={r.anomaly ? "bg-destructive/5" : undefined}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.anomaly && (
                          <span
                            className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive"
                            title={t(`anomaly.${r.anomaly}`)}
                          >
                            !
                          </span>
                        )}
                        <span>{dateTime(r.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{number(r.value, 3)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      +{number(r.delta, 3)} {t(`unit.${device.type}`)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{(r.confidence * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setPhotoFor(r.id)}>
                        <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                        {t("device.view_photo")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!photoFor} onOpenChange={(o) => !o && setPhotoFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t("device.photo_title")}
            </DialogTitle>
            <DialogDescription>{t("device.photo_desc")}</DialogDescription>
          </DialogHeader>
          {photoReading && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border bg-black">
                <MeterPhoto type={device.type} value={photoReading.value} className="h-auto w-full" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{t("device.date")}</p>
                  <p className="font-medium">{date(photoReading.date)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{t("device.recognized")}</p>
                  <p className="font-medium tabular-nums">
                    {number(photoReading.value, 3)} {t(`unit.${device.type}`)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{t("device.confidence")}</p>
                  <p className="font-medium tabular-nums">{(photoReading.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
