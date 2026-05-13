import { GAMES } from "@/lib/games";
import { GameCard } from "@/components/GameCard";

export function CategoryPage({
  title,
  filter,
}: {
  title: string;
  filter?: (g: (typeof GAMES)[number]) => boolean;
}) {
  const list = filter ? GAMES.filter(filter) : GAMES;
  return (
    <div className="px-4 lg:px-6 py-6">
      <h1 className="heading text-2xl sm:text-3xl mb-4">{title}</h1>
      <p className="text-text-secondary text-sm mb-6 max-w-2xl">
        Browse the full lineup of demo casino titles. All games are
        play-money-only — no real wagers, no real winnings.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {list.map((g) => (
          <div key={g.slug} className="flex justify-center">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Casino() {
  return <CategoryPage title="All Games" />;
}
export function Slots() {
  return (
    <CategoryPage title="Slots" filter={(g) => g.category === "slots"} />
  );
}
export function TableGames() {
  return (
    <CategoryPage title="Table Games" filter={(g) => g.category === "table"} />
  );
}
export function Games() {
  // The "Games" category contains all Originals + Towers etc.
  return (
    <CategoryPage
      title="Games"
      filter={(g) => g.category === "games" || g.category === "originals"}
    />
  );
}
export function Originals() {
  return (
    <CategoryPage
      title="Yahu Originals"
      filter={(g) => g.category === "originals"}
    />
  );
}
export function NewReleases() {
  // Mirrors "Neuerscheinungen" — show unavailable mocks as a teaser feed
  return (
    <CategoryPage
      title="Neuerscheinungen"
      filter={(g) => g.badge === "NEW" || (!g.available && g.category !== "live")}
    />
  );
}
export function Live() {
  return (
    <CategoryPage title="Live Casino" filter={(g) => g.category === "live"} />
  );
}
