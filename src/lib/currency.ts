export type CurrencyCode = "YAHU" | "USD" | "EUR" | "CHF" | "GBP" | "BTC" | "ETH";

export type Currency = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  decimals: number;
  /** prefix puts symbol before amount, suffix puts code after */
  layout: "prefix" | "suffix";
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  YAHU: { code: "YAHU", label: "Yahu Coins", symbol: "🪙", decimals: 2, layout: "suffix" },
  USD:  { code: "USD",  label: "US Dollar",  symbol: "$",  decimals: 2, layout: "prefix" },
  EUR:  { code: "EUR",  label: "Euro",       symbol: "€",  decimals: 2, layout: "prefix" },
  CHF:  { code: "CHF",  label: "Swiss Franc",symbol: "Fr.",decimals: 2, layout: "prefix" },
  GBP:  { code: "GBP",  label: "Pound",      symbol: "£",  decimals: 2, layout: "prefix" },
  BTC:  { code: "BTC",  label: "Bitcoin",    symbol: "₿",  decimals: 8, layout: "prefix" },
  ETH:  { code: "ETH",  label: "Ether",      symbol: "Ξ",  decimals: 6, layout: "prefix" },
};

export const CURRENCY_LIST: Currency[] = Object.values(CURRENCIES);

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES[code] ?? CURRENCIES.YAHU;
}
