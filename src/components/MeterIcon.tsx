import { Droplets, Flame, Zap, type LucideIcon } from "lucide-react";
import type { MeterType } from "@/lib/data";

export const meterIcon: Record<MeterType, LucideIcon> = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
};

export function MeterIcon({
  type,
  className,
  style,
}: {
  type: MeterType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = meterIcon[type];
  return <Icon className={className} style={style} />;
}

export function meterColorVar(type: MeterType) {
  return type === "water" ? "var(--color-water)" : type === "gas" ? "var(--color-gas)" : "var(--color-electricity)";
}
