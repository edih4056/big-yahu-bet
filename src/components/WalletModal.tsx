import { useState } from "react";
import { Modal } from "./Modal";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { getCurrency } from "@/lib/currency";
import {
  ArrowDown,
  ArrowUp,
  RotateCw,
  Coins,
  Plus,
  Check,
  Pencil,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const QUICK_ADD = [100, 500, 1000, 5000, 10000, 50000];

export function WalletModal({ open, onClose }: Props) {
  const balance = useWalletStore((s) => s.balance);
  const tx = useWalletStore((s) => s.transactions);
  const reload = useWalletStore((s) => s.reload);
  const setBalance = useWalletStore((s) => s.setBalance);
  const addBalance = useWalletStore((s) => s.addBalance);
  const currency = useWalletStore((s) => s.currency);

  const cur = getCurrency(currency);
  const [customInput, setCustomInput] = useState("");
  const [mode, setMode] = useState<"add" | "set">("add");

  const customNum = (() => {
    const cleaned = customInput.replace(/[^0-9.\-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  })();

  function applyCustom() {
    if (!customNum || customNum < 0) return;
    if (mode === "add") {
      addBalance(customNum);
    } else {
      setBalance(customNum);
    }
    setCustomInput("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Wallet">
      {/* Balance card */}
      <div className="rounded-2xl bg-bg-elevated/60 p-5 mb-4">
        <div className="text-xs uppercase tracking-wider text-text-secondary">
          Balance
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <Coins size={22} className="text-gold" />
          <div className="text-3xl font-extrabold gold-text">
            {formatMoney(balance, currency)}
          </div>
        </div>
        <div className="text-[11px] text-text-secondary mt-2">
          Demo coins only — no real money is involved. Currency is a display
          label only; switch it any time in Settings.
        </div>
      </div>

      {/* Custom amount input — Add or Set */}
      <div className="rounded-2xl bg-bg-card border border-white/5 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
            Custom amount
          </div>
          <div className="flex items-center gap-1 bg-bg-elevated rounded-lg p-0.5">
            <button
              onClick={() => setMode("add")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition ${
                mode === "add"
                  ? "bg-accent-gradient text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <Plus size={12} /> Add
            </button>
            <button
              onClick={() => setMode("set")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition ${
                mode === "set"
                  ? "bg-accent-gradient text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <Pencil size={11} /> Set to
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-bg-elevated rounded-xl border border-white/5 px-3 py-2.5 focus-within:border-accent/60 transition">
          <span className="font-bold text-gold text-base">{cur.symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustom();
            }}
            placeholder={mode === "add" ? "Amount to add" : "New balance"}
            className="bg-transparent outline-none flex-1 min-w-0 text-lg font-semibold"
          />
          <span className="text-xs font-medium text-text-secondary">
            {cur.code}
          </span>
          <button
            onClick={applyCustom}
            disabled={!customNum}
            className="btn-primary !px-3 !py-1.5 text-sm flex items-center gap-1"
          >
            <Check size={14} />
            {mode === "add" ? "Add" : "Set"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {QUICK_ADD.map((v) => (
            <button
              key={v}
              onClick={() => addBalance(v)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-bg-elevated hover:bg-accent/20 transition"
              title={`Add ${formatMoney(v, currency)}`}
            >
              +{v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-text-secondary mt-2">
          <strong>Add</strong> = add the amount to your balance ·{" "}
          <strong>Set to</strong> = replace your balance with that exact amount.
        </div>
      </div>

      {/* Reset to default */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={reload}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <RotateCw size={14} /> Reset to 10,000
        </button>
      </div>

      {/* Recent transactions */}
      <div className="text-xs uppercase tracking-wider text-text-secondary mb-2">
        Recent transactions
      </div>
      <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5">
        {tx.length === 0 && (
          <div className="text-text-secondary text-sm py-6 text-center">
            No transactions yet — start playing.
          </div>
        )}
        {tx.slice(0, 10).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between text-sm rounded-lg bg-bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              {t.amount >= 0 ? (
                <ArrowUp size={14} className="text-win shrink-0" />
              ) : (
                <ArrowDown size={14} className="text-rose-400 shrink-0" />
              )}
              <span className="font-medium capitalize">{t.kind}</span>
              <span className="text-text-secondary truncate">· {t.game}</span>
            </div>
            <div
              className={`font-semibold whitespace-nowrap ${
                t.amount >= 0 ? "text-win" : "text-rose-300"
              }`}
            >
              {t.amount >= 0 ? "+" : ""}
              {formatMoney(t.amount, currency)}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
