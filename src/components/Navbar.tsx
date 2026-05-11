import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { useWalletStore } from "@/store/walletStore";
import { formatCoins } from "@/lib/format";
import { Search, Coins, Volume2, VolumeX } from "lucide-react";
import { WalletModal } from "./WalletModal";

const NAV = [
  { to: "/casino", label: "Casino" },
  { to: "/slots", label: "Slots" },
  { to: "/table-games", label: "Table Games" },
  { to: "/promotions", label: "Promotions" },
];

export function Navbar() {
  const balance = useWalletStore((s) => s.balance);
  const username = useWalletStore((s) => s.username);
  const soundEnabled = useWalletStore((s) => s.soundEnabled);
  const toggleSound = useWalletStore((s) => s.toggleSound);
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5">
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
              Live Casino{" "}
              <span className="ml-1 text-[9px] uppercase font-bold tracking-wider text-accent-light">
                Soon
              </span>
            </span>
          </nav>

          <div className="hidden lg:flex items-center gap-2 ml-auto bg-bg-card rounded-2xl px-3 py-2 w-72 border border-white/5">
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
            <Coins size={16} className="text-gold" />
            <span className="font-semibold text-sm gold-text">
              {formatCoins(balance)}
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              YAHU
            </span>
          </button>

          <button
            onClick={toggleSound}
            className="btn-ghost"
            aria-label="Toggle sound"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button onClick={() => setWalletOpen(true)} className="btn-primary hidden sm:block">
            Deposit
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
    </>
  );
}
