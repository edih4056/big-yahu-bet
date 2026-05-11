import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { useWalletStore } from "@/store/walletStore";
import { Coins, ShieldAlert } from "lucide-react";

export function WelcomeModal() {
  const seen = useWalletStore((s) => s.hasSeenWelcome);
  const mark = useWalletStore((s) => s.markWelcomeSeen);
  const setUsername = useWalletStore((s) => s.setUsername);
  const username = useWalletStore((s) => s.username);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(username);

  useEffect(() => {
    if (!seen) setOpen(true);
  }, [seen]);

  const close = () => {
    if (name.trim()) setUsername(name.trim());
    mark();
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={close} title="Welcome to Big Yahu Bet">
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
        <ShieldAlert className="text-rose-300 shrink-0" size={20} />
        <p className="text-sm text-rose-100/90 leading-relaxed">
          This is a <strong>demo</strong> casino. No real money is used. All
          coins are play money for entertainment only.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-bg-elevated">
        <Coins className="text-gold shrink-0" size={22} />
        <p className="text-sm">
          You start with <span className="gold-text font-bold">10,000 YAHU</span>{" "}
          demo coins. Reload anytime from your wallet.
        </p>
      </div>

      <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
        Display name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-bg-card border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-accent/60 transition"
        placeholder="Your display name"
        maxLength={20}
      />

      <button onClick={close} className="btn-primary w-full mt-4">
        Enter the casino
      </button>

      <div className="text-[10px] text-text-secondary text-center mt-3">
        18+ · Showcase project · No real gambling involved
      </div>
    </Modal>
  );
}
