import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type MeterType = "water" | "gas" | "electricity";

export interface Apartment {
  id: string;
  name: string;
  address: string;
}

export interface Reading {
  id: string;
  deviceId: string;
  date: string; // ISO
  value: number; // cumulative meter value
  delta: number; // diff from previous
  confidence: number; // 0..1
  anomaly?: "leak" | "spike" | null;
}

export interface Device {
  id: string;
  name: string;
  type: MeterType;
  apartmentId: string;
  online: boolean;
  lastSeen: string;
  serial: string;
  currentValue: number;
}

export type CaptureInterval = "15m" | "1h" | "6h" | "12h" | "24h";

interface Settings {
  captureInterval: CaptureInterval;
  notifications: boolean;
}

interface DataCtx {
  apartments: Apartment[];
  devices: Device[];
  readings: Reading[];
  settings: Settings;
  addApartment: (a: Omit<Apartment, "id">) => void;
  addDevice: (
    d: Omit<Device, "id" | "online" | "lastSeen" | "currentValue" | "serial"> & { serial?: string },
  ) => void;
  getDeviceReadings: (deviceId: string) => Reading[];
  updateSettings: (s: Partial<Settings>) => void;
}

const Ctx = createContext<DataCtx | null>(null);

// ---- Demo data generation ----

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateReadings(
  deviceId: string,
  type: MeterType,
  days: number,
  startValue: number,
  seed: number,
): Reading[] {
  const r = rand(seed);
  const out: Reading[] = [];
  let value = startValue;
  const now = new Date();

  // baseline daily usage
  const baseDaily = type === "water" ? 0.45 : type === "gas" ? 0.6 : 9;
  const variance = type === "water" ? 0.25 : type === "gas" ? 0.3 : 4;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(9 + Math.floor(r() * 4), Math.floor(r() * 60), 0, 0);

    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const seasonal = 1 + Math.sin((d.getMonth() / 12) * Math.PI * 2) * 0.15;
    const weekendBoost = weekend ? 1.18 : 1;

    let delta = (baseDaily + (r() - 0.5) * variance) * seasonal * weekendBoost;

    let anomaly: "leak" | "spike" | null = null;
    // sprinkle a couple of anomalies
    if (i === 4) {
      delta = baseDaily * 3.5;
      anomaly = "spike";
    } else if (i === 12 && type === "water") {
      delta = baseDaily * 2.6;
      anomaly = "leak";
    }

    if (delta < 0) delta = 0;
    value += delta;

    out.push({
      id: `${deviceId}-${i}`,
      deviceId,
      date: d.toISOString(),
      value: Math.round(value * 1000) / 1000,
      delta: Math.round(delta * 1000) / 1000,
      confidence: 0.94 + r() * 0.05,
      anomaly,
    });
  }
  return out;
}

const initialApartments: Apartment[] = [
  { id: "ap-1", name: "Квартира у Львові", address: "вул. Стрийська 22, кв. 14, Львів" },
  { id: "ap-2", name: "Дача в селі", address: "вул. Лісова 7, Муроване" },
];

const initialDevices: Device[] = [
  {
    id: "dev-w1",
    name: "Холодна вода",
    type: "water",
    apartmentId: "ap-1",
    online: true,
    lastSeen: new Date(Date.now() - 4 * 60_000).toISOString(),
    serial: "OPT-W-001A",
    currentValue: 0,
  },
  {
    id: "dev-g1",
    name: "Газовий лічильник",
    type: "gas",
    apartmentId: "ap-1",
    online: true,
    lastSeen: new Date(Date.now() - 12 * 60_000).toISOString(),
    serial: "OPT-G-014B",
    currentValue: 0,
  },
  {
    id: "dev-e1",
    name: "Електролічильник",
    type: "electricity",
    apartmentId: "ap-1",
    online: true,
    lastSeen: new Date(Date.now() - 2 * 60_000).toISOString(),
    serial: "OPT-E-209C",
    currentValue: 0,
  },
  {
    id: "dev-w2",
    name: "Вода (дача)",
    type: "water",
    apartmentId: "ap-2",
    online: false,
    lastSeen: new Date(Date.now() - 3 * 3600_000).toISOString(),
    serial: "OPT-W-022D",
    currentValue: 0,
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [settings, setSettings] = useState<Settings>({ captureInterval: "1h", notifications: true });

  const readings = useMemo(() => {
    const all: Reading[] = [];
    for (const d of devices) {
      const start = d.type === "water" ? 142.5 : d.type === "gas" ? 980.2 : 4521;
      const seed = parseInt(d.id.replace(/\D/g, "") || "1", 10) * 73 + d.type.length;
      const list = generateReadings(d.id, d.type, 60, start, seed);
      all.push(...list);
    }
    return all;
  }, [devices]);

  // sync each device's currentValue from latest reading
  const devicesWithValues = useMemo(() => {
    return devices.map((d) => {
      const last = readings.filter((r) => r.deviceId === d.id).at(-1);
      return { ...d, currentValue: last ? last.value : d.currentValue };
    });
  }, [devices, readings]);

  const addApartment = (a: Omit<Apartment, "id">) =>
    setApartments((prev) => [...prev, { ...a, id: `ap-${Date.now()}` }]);

  const addDevice: DataCtx["addDevice"] = (d) => {
    const id = `dev-${Date.now()}`;
    setDevices((prev) => [
      ...prev,
      {
        ...d,
        id,
        serial: d.serial || id.toUpperCase(),
        online: true,
        lastSeen: new Date().toISOString(),
        currentValue: 0,
      },
    ]);
  };

  const getDeviceReadings = (deviceId: string) => readings.filter((r) => r.deviceId === deviceId);

  const updateSettings = (s: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...s }));

  return (
    <Ctx.Provider
      value={{
        apartments,
        devices: devicesWithValues,
        readings,
        settings,
        addApartment,
        addDevice,
        getDeviceReadings,
        updateSettings,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}

export const METER_UNITS: Record<MeterType, string> = {
  water: "m³",
  gas: "m³",
  electricity: "kWh",
};
