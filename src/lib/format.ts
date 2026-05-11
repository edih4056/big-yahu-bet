import { getCurrency, type CurrencyCode } from "./currency";

export function formatCoins(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMoney(value: number, code: CurrencyCode): string {
  const c = getCurrency(code);
  // For crypto, scale internal demo-coin units down so 10000 YAHU ≈ a sensible BTC/ETH amount.
  // We keep internal accounting in "coins" — for display only we apply a scale.
  const scale =
    code === "BTC" ? 1 / 100000 : code === "ETH" ? 1 / 1000 : 1;
  const num = value * scale;
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  });
  return c.layout === "prefix"
    ? `${c.symbol}${formatted}`
    : `${formatted} ${c.code}`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (value >= 10_000) return (value / 1_000).toFixed(1) + "K";
  return formatCoins(value);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
