import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Signal, SignalZero } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData, type MeterType } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useFormatters } from "@/lib/format";
import { MeterIcon, meterColorVar } from "@/components/MeterIcon";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/devices")({
  head: () => ({ meta: [{ title: "Devices · Optimeter" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const { t } = useI18n();
  const { devices, apartments, addDevice } = useData();
  const { ago, number } = useFormatters();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    serial: "",
    name: "",
    type: "water" as MeterType,
    apartmentId: apartments[0]?.id || "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serial || !form.name || !form.apartmentId) return;
    addDevice({
      name: form.name,
      type: form.type,
      apartmentId: form.apartmentId,
      serial: form.serial,
    });
    toast.success(t("toast.connected"));
    setOpen(false);
    setForm({ serial: "", name: "", type: "water", apartmentId: apartments[0]?.id || "" });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("devices.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("devices.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("devices.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("devices.connect")}</DialogTitle>
              <DialogDescription>{t("devices.connect_desc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="serial">{t("devices.device_id")}</Label>
                <Input
                  id="serial"
                  placeholder="OPT-XXXX-XXXX"
                  value={form.serial}
                  onChange={(e) => setForm({ ...form, serial: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("devices.name")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("devices.type")}</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MeterType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">{t("type.water")}</SelectItem>
                      <SelectItem value="gas">{t("type.gas")}</SelectItem>
                      <SelectItem value="electricity">{t("type.electricity")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("devices.apartment")}</Label>
                  <Select
                    value={form.apartmentId}
                    onValueChange={(v) => setForm({ ...form, apartmentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("devices.connect_btn")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">{t("devices.empty")}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => {
            const ap = apartments.find((a) => a.id === d.apartmentId);
            const color = meterColorVar(d.type);
            return (
              <Link key={d.id} to="/devices/$id" params={{ id: d.id }} className="group">
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div
                        className="grid h-12 w-12 place-items-center rounded-xl"
                        style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
                      >
                        <MeterIcon type={d.type} className="h-6 w-6" style={{ color }} />
                      </div>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                          (d.online
                            ? "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {d.online ? <Signal className="h-3 w-3" /> : <SignalZero className="h-3 w-3" />}
                        {d.online ? t("devices.status.online") : t("devices.status.offline")}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-base font-semibold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{ap?.name}</p>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("dashboard.last_reading")}</p>
                        <p className="text-xl font-semibold tabular-nums">
                          {number(d.currentValue)}{" "}
                          <span className="text-xs font-normal text-muted-foreground">{t(`unit.${d.type}`)}</span>
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground">
                        <p>{d.serial}</p>
                        <p>
                          {ago(d.lastSeen)} {t("common.ago")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
