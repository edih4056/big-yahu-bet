import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { getCurrency } from "@/lib/currency";
import { Search, Settings as SettingsIcon, Wallet } from "lucide-react";
import { WalletModal } from "./WalletModal";
import { SettingsModal } from "./SettingsModal";

const NAV = [
  { to: "/casino", label: "Casino" },
  { to: "/slots", label: "Slots" },
  { to: "/table-games", label: "Table Games" },
  { to: "/games", label: "Games" },
  { to: "/promotions", label: "Promotions" },
];

export function Navbar() {
  const balance = useWalletStore((s) => s.balance);
  const username = useWalletStore((s) => s.username);
  const currency = useWalletStore((s) => s.currency);
  const [walletOpen, setWalletOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const cur = getCurrency(currency);

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg-primary/85 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 lg:px-6 h-16 flex items-center gap-3">
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-white/5"
                      : "text-text-secondary hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <span className="px-3 py-2 rounded-xl text-sm font-medium text-text-secondary/60">
              Live{" "}
              <span className="ml-1 text-[9px] uppercase font-bold tracking-wider text-accent-light">
                Soon
              </span>
            </span>
          </nav>

          <div className="hidden lg:flex items-center gap-2 ml-auto bg-bg-card rounded-2xl px-3 py-2 w-64 border border-white/5">
            <Search size={15} className="text-text-secondary" />
            <input
              placeholder="Search games..."
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-text-secondary"
            />
          </div>

          <button
            onClick={() => setWalletOpen(true)}
            className="ml-auto lg:ml-0 flex items-center gap-2 bg-bg-card hover:bg-bg-elevated transition rounded-2xl px-3 py-2 border border-white/5"
            aria-label="Open wallet"
          >
            <span className="font-bold text-base gold-text">{cur.symbol}</span>
            <span className="font-semibold text-sm">
              {formatMoney(balance, currency).replace(cur.symbol, "").trim()}
            </span>
            <span className="text-[10px] text-text-secondary font-medium hidden sm:inline">
              {cur.code}
            </span>
          </button>

          <button
            onClick={() => setWalletOpen(true)}
            className="btn-primary hidden sm:flex items-center gap-1.5"
          >
            <Wallet size={15} />
            Wallet
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="btn-ghost"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon size={18} />
          </button>

          <Link
            to="/profile"
            className="hidden md:flex w-10 h-10 rounded-full bg-accent-gradient items-center justify-center font-bold text-sm shadow-glow-sm"
            aria-label="Profile"
            title={username}
          >
            {username.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
