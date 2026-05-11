import { HeroCarousel } from "@/components/HeroCarousel";
import { WinsTicker } from "@/components/WinsTicker";
import { GameRow } from "@/components/GameRow";
import { PromoCards } from "@/components/PromoCards";
import { GAMES } from "@/lib/games";

export default function Home() {
  const featured = GAMES.filter((g) => g.available);
  const slots = GAMES.filter((g) => g.category === "slots");
  const tables = GAMES.filter((g) => g.category === "table");
  const live = GAMES.filter((g) => g.category === "live");
  const fresh = [...GAMES].slice(2, 8);

  return (
    <div className="pb-12">
      <HeroCarousel />
      <WinsTicker />
      <GameRow title="Featured Games" viewAllTo="/casino" games={featured} />
      <GameRow title="Popular Slots" viewAllTo="/slots" games={slots} />
      <GameRow title="Table Games" viewAllTo="/table-games" games={tables} />
      <GameRow title="New Releases" games={fresh} />
      <GameRow title="Live Casino" games={live} />
      <PromoCards />
    </div>
  );
}
