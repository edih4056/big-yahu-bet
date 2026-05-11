import { Modal } from "./Modal";
import { useWalletStore } from "@/store/walletStore";
import { CURRENCY_LIST } from "@/lib/currency";
import { Volume2, VolumeX, Check } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export function SettingsModal({ open, onClose }: Props) {
  const currency = useWalletStore((s) => s.currency);
  const setCurrency = useWalletStore((s) => s.setCurrency);
  const soundEnabled = useWalletStore((s) => s.soundEnabled);
  const toggleSound = useWalletStore((s) => s.toggleSound);
  const username = useWalletStore((s) => s.username);
  const setUsername = useWalletStore((s) => s.setUsername);

  return (
    <Modal open={open} onClose={onClose} title="Settings" size="md">
      <div className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
            Display name
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-bg-card border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-accent/60 transition"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
            Currency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CURRENCY_LIST.map((c) => {
              const active = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition text-left ${
                    active
                      ? "border-accent bg-accent/15 shadow-glow-sm"
                      : "border-white/10 bg-bg-card hover:bg-bg-elevated"
                  }`}
                >
                  <span className="text-xl font-bold w-7 text-center">
                    {c.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{c.code}</div>
                    <div className="text-[10px] text-text-secondary truncate">
                      {c.label}
                    </div>
                  </div>
                  {active && (
                    <Check size={14} className="text-accent-light" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-text-secondary mt-2">
            Display only — internal balances stay in demo coins. No real money.
          </p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
            Sound
          </label>
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between bg-bg-card border border-white/5 rounded-xl px-4 py-3 hover:bg-bg-elevated transition"
          >
            <span className="flex items-center gap-2 font-medium">
              {soundEnabled ? (
                <Volume2 size={16} className="text-accent-light" />
              ) : (
                <VolumeX size={16} className="text-text-secondary" />
              )}
              {soundEnabled ? "Sound on" : "Muted"}
            </span>
            <span
              className={`relative w-10 h-5 rounded-full transition ${
                soundEnabled ? "bg-accent" : "bg-bg-elevated"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  soundEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
