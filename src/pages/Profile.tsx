import { useWalletStore } from "@/store/walletStore";
import { formatMoney } from "@/lib/format";
import { Coins, History, Trophy } from "lucide-react";

export default function Profile() {
  const balance = useWalletStore((s) => s.balance);
  const username = useWalletStore((s) => s.username);
  const history = useWalletStore((s) => s.history);
  const setUsername = useWalletStore((s) => s.setUsername);
  const reload = useWalletStore((s) => s.reload);
  const currency = useWalletStore((s) => s.currency);
  const fmt = (n: number) => formatMoney(n, currency);

  const totalNet = history.reduce((s, e) => s + e.net, 0);
  const wins = history.filter((e) => e.net > 0).length;
  const losses = history.filter((e) => e.net < 0).length;

  return (
    <div className="px-4 lg:px-6 py-6 max-w-5xl">
      <h1 className="heading text-2xl sm:text-3xl mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-base p-5">
          <div className="text-xs uppercase tracking-wider text-text-secondary mb-2">
            Display name
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-bg-elevated rounded-xl px-3 py-2 outline-none border border-white/5 focus:border-accent/50"
            maxLength={20}
          />
        </div>
        <div className="card-base p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-secondary mb-2">
            <Coins size={14} className="text-gold" /> Balance
          </div>
          <div className="text-3xl font-extrabold gold-text">
            {fmt(balance)}
          </div>
          <button onClick={reload} className="btn-secondary mt-3 text-sm">
            Reload to 10,000
          </button>
        </div>
        <div className="card-base p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-secondary mb-2">
            <Trophy size={14} className="text-accent-light" /> Lifetime stats
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Hands / spins</span>
              <span className="font-semibold">{history.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Wins</span>
              <span className="font-semibold text-win">{wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Losses</span>
              <span className="font-semibold text-rose-300">{losses}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
              <span className="text-text-secondary">Net</span>
              <span
                className={`font-bold ${
                  totalNet >= 0 ? "text-win" : "text-rose-300"
                }`}
              >
                {totalNet >= 0 ? "+" : ""}
                {fmt(totalNet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-base mt-6 p-5">
        <div className="flex items-center gap-2 mb-3">
          <History size={16} className="text-accent-light" />
          <h2 className="heading text-base">Game History</h2>
        </div>
        {history.length === 0 ? (
          <div className="text-text-secondary text-sm py-6 text-center">
            No plays yet. Pick a game to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Game</th>
                  <th className="py-2 pr-3 text-right">Bet</th>
                  <th className="py-2 pr-3 text-right">Result</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 30).map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-2 pr-3 text-text-secondary">
                      {new Date(e.ts).toLocaleTimeString()}
                    </td>
                    <td className="py-2 pr-3">{e.game}</td>
                    <td className="py-2 pr-3 text-right">
                      {fmt(e.bet)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {fmt(e.result)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        e.net >= 0 ? "text-win" : "text-rose-300"
                      }`}
                    >
                      {e.net >= 0 ? "+" : ""}
                      {fmt(e.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
