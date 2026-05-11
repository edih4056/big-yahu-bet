import { Modal } from "./Modal";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { ArrowDown, ArrowUp, RotateCw, Coins } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function WalletModal({ open, onClose }: Props) {
  const balance = useWalletStore((s) => s.balance);
  const tx = useWalletStore((s) => s.transactions);
  const reload = useWalletStore((s) => s.reload);
  const currency = useWalletStore((s) => s.currency);

  return (
    <Modal open={open} onClose={onClose} title="Wallet">
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={reload}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <RotateCw size={16} /> Reload demo coins
        </button>
      </div>

      <div className="text-xs uppercase tracking-wider text-text-secondary mb-2">
        Recent transactions
      </div>
      <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5">
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
            <div className="flex items-center gap-2">
              {t.amount >= 0 ? (
                <ArrowUp size={14} className="text-win" />
              ) : (
                <ArrowDown size={14} className="text-rose-400" />
              )}
              <span className="font-medium capitalize">{t.kind}</span>
              <span className="text-text-secondary">· {t.game}</span>
            </div>
            <div
              className={`font-semibold ${t.amount >= 0 ? "text-win" : "text-rose-300"}`}
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
