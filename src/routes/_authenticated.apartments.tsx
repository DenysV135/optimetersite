import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apartments")({
  head: () => ({ meta: [{ title: "Locations · Optimeter" }] }),
  component: ApartmentsPage,
});

function ApartmentsPage() {
  const { t } = useI18n();
  const { apartments, devices, addApartment } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    addApartment(form);
    toast.success(t("toast.apartment_added"));
    setForm({ name: "", address: "" });
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("apartments.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("apartments.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("apartments.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("apartments.add")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("apartments.name")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">{t("apartments.address")}</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("apartments.create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {apartments.map((a) => {
          const count = devices.filter((d) => d.apartmentId === a.id).length;
          return (
            <Card key={a.id} className="overflow-hidden">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Home className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">{a.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {a.address}
                  </p>
                  <div className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {count} {t("apartments.devices_count")}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
