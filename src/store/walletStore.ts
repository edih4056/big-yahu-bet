import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/format";
import type { CurrencyCode } from "@/lib/currency";

export type Transaction = {
  id: string;
  ts: number;
  kind: "bet" | "win" | "reload" | "adjust";
  game: string;
  amount: number;
  balanceAfter: number;
};

export type GameHistoryEntry = {
  id: string;
  ts: number;
  game: string;
  bet: number;
  result: number;
  net: number;
};

type WalletState = {
  balance: number;
  transactions: Transaction[];
  history: GameHistoryEntry[];
  username: string;
  soundEnabled: boolean;
  hasSeenWelcome: boolean;
  currency: CurrencyCode;
  bet: (game: string, amount: number) => boolean;
  win: (game: string, amount: number) => void;
  pushHistory: (entry: Omit<GameHistoryEntry, "id" | "ts">) => void;
  reload: () => void;
  setBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  setUsername: (name: string) => void;
  toggleSound: () => void;
  markWelcomeSeen: () => void;
  setCurrency: (c: CurrencyCode) => void;
};

const STARTING_BALANCE = 10_000;
const MAX_TX = 50;
const MAX_HISTORY = 100;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: STARTING_BALANCE,
      transactions: [],
      history: [],
      username: "Guest",
      soundEnabled: true,
      hasSeenWelcome: false,
      currency: "YAHU",

      bet: (game, amount) => {
        if (amount <= 0) return false;
        const cur = get().balance;
        if (cur < amount) return false;
        const balanceAfter = cur - amount;
        const tx: Transaction = {
          id: uid(),
          ts: Date.now(),
          kind: "bet",
          game,
          amount: -amount,
          balanceAfter,
        };
        set((s) => ({
          balance: balanceAfter,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        }));
        return true;
      },

      win: (game, amount) => {
        if (amount <= 0) return;
        const balanceAfter = get().balance + amount;
        const tx: Transaction = {
          id: uid(),
          ts: Date.now(),
          kind: "win",
          game,
          amount,
          balanceAfter,
        };
        set((s) => ({
          balance: balanceAfter,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        }));
      },

      pushHistory: (entry) => {
        const e: GameHistoryEntry = {
          id: uid(),
          ts: Date.now(),
          ...entry,
        };
        set((s) => ({
          history: [e, ...s.history].slice(0, MAX_HISTORY),
        }));
      },

      reload: () => {
        const balanceAfter = STARTING_BALANCE;
        const tx: Transaction = {
          id: uid(),
          ts: Date.now(),
          kind: "reload",
          game: "wallet",
          amount: STARTING_BALANCE - get().balance,
          balanceAfter,
        };
        set((s) => ({
          balance: balanceAfter,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        }));
      },

      setBalance: (amount) => {
        const target = Math.max(0, Math.floor(amount));
        const diff = target - get().balance;
        if (diff === 0) return;
        const tx: Transaction = {
          id: uid(),
          ts: Date.now(),
          kind: "adjust",
          game: "wallet",
          amount: diff,
          balanceAfter: target,
        };
        set((s) => ({
          balance: target,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        }));
      },

      addBalance: (amount) => {
        const inc = Math.floor(amount);
        if (inc === 0) return;
        const balanceAfter = Math.max(0, get().balance + inc);
        const tx: Transaction = {
          id: uid(),
          ts: Date.now(),
          kind: "adjust",
          game: "wallet",
          amount: inc,
          balanceAfter,
        };
        set((s) => ({
          balance: balanceAfter,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        }));
      },

      setUsername: (name) => set({ username: name.trim() || "Guest" }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      setCurrency: (c) => set({ currency: c }),
    }),
    {
      name: "byb-wallet",
      version: 2,
    }
  )
);

export const STARTING_COINS = STARTING_BALANCE;
