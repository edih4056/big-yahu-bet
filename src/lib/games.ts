export type GameDef = {
  slug: string;
  title: string;
  provider: string;
  category: "slots" | "table" | "live" | "games" | "originals";
  badge?: "HOT" | "NEW" | "POPULAR" | "ORIGINAL";
  available: boolean;
  /** Approx live-player count for the lobby card chip */
  livePlayers?: number;
  cover: {
    gradient: string;
    accent: string;
    icon: string;
  };
};

/** ------------------------------------------------------------------------
 *  Playable games
 *  -----------------------------------------------------------------------*/

const PLAYABLE: GameDef[] = [
  {
    slug: "sizzling-fruits",
    title: "Sizzling Fruits",
    provider: "YahuPlay",
    category: "slots",
    badge: "HOT",
    available: true,
    livePlayers: 1247,
    cover: {
      gradient:
        "linear-gradient(140deg, #FF3B6B 0%, #FF8A00 60%, #FFD600 100%)",
      accent: "#FFE15A",
      icon: "🍒",
    },
  },
  {
    slug: "book-of-yahu",
    title: "Book of Yahu",
    provider: "OracleSlots",
    category: "slots",
    badge: "POPULAR",
    available: true,
    livePlayers: 982,
    cover: {
      gradient:
        "linear-gradient(140deg, #5B2D14 0%, #C58F2A 60%, #FFD978 100%)",
      accent: "#FFD978",
      icon: "📖",
    },
  },
  {
    slug: "blackjack",
    title: "Blackjack",
    provider: "VioletGames",
    category: "table",
    badge: "POPULAR",
    available: true,
    livePlayers: 1769,
    cover: {
      gradient: "linear-gradient(140deg, #B22340 0%, #7F1D1D 100%)",
      accent: "#FF5C82",
      icon: "🂡",
    },
  },
  {
    slug: "roulette",
    title: "Roulette",
    provider: "GoldChip",
    category: "table",
    badge: "POPULAR",
    available: true,
    livePlayers: 645,
    cover: {
      gradient: "linear-gradient(140deg, #0E5A36 0%, #064E3B 100%)",
      accent: "#10B981",
      icon: "🎯",
    },
  },
  {
    slug: "mines",
    title: "Mines",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 3632,
    cover: {
      gradient: "linear-gradient(140deg, #0EA5E9 0%, #1E40AF 100%)",
      accent: "#67E8F9",
      icon: "💣",
    },
  },
  {
    slug: "limbo",
    title: "Limbo",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 2709,
    cover: {
      gradient: "linear-gradient(140deg, #F59E0B 0%, #EAB308 60%, #FFD600 100%)",
      accent: "#FDE68A",
      icon: "🚀",
    },
  },
  {
    slug: "dice",
    title: "Dice",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 3029,
    cover: {
      gradient: "linear-gradient(140deg, #7C3AED 0%, #4C1D95 100%)",
      accent: "#C4B5FD",
      icon: "🎲",
    },
  },
  {
    slug: "towers",
    title: "Dragon Tower",
    provider: "Yahu Originals",
    category: "originals",
    badge: "ORIGINAL",
    available: true,
    livePlayers: 788,
    cover: {
      gradient: "linear-gradient(140deg, #DC2626 0%, #7C1D1D 100%)",
      accent: "#FCA5A5",
      icon: "🗼",
    },
  },
  {
    slug: "crash",
    title: "Crash",
    provider: "Yahu Originals",
    category: "originals",
    badge: "NEW",
    available: true,
    livePlayers: 1667,
    cover: {
      gradient: "linear-gradient(140deg, #38BDF8 0%, #1E40AF 100%)",
      accent: "#7DD3FC",
      icon: "🚀",
    },
  },
  {
    slug: "coin-flip",
    title: "Coin Flip",
    provider: "Yahu Originals",
    category: "originals",
    badge: "NEW",
    available: true,
    livePlayers: 422,
    cover: {
      gradient: "linear-gradient(140deg, #FBBF24 0%, #92400E 100%)",
      accent: "#FDE68A",
      icon: "🪙",
    },
  },
  {
    slug: "wheel",
    title: "Wheel",
    provider: "Yahu Originals",
    category: "originals",
    badge: "NEW",
    available: true,
    livePlayers: 320,
    cover: {
      gradient: "linear-gradient(140deg, #F97316 0%, #B45309 100%)",
      accent: "#FDBA74",
      icon: "🎡",
    },
  },
  {
    slug: "hilo",
    title: "Hilo",
    provider: "Yahu Originals",
    category: "originals",
    badge: "NEW",
    available: true,
    livePlayers: 652,
    cover: {
      gradient: "linear-gradient(140deg, #22C55E 0%, #14532D 100%)",
      accent: "#86EFAC",
      icon: "🃏",
    },
  },
];

/** ------------------------------------------------------------------------
 *  Coming-soon mocks — trimmed to the most recognisable names so the lobby
 *  doesn't feel padded.
 *  -----------------------------------------------------------------------*/

type CSDef = readonly [
  title: string,
  provider: string,
  category: GameDef["category"],
  gradient: string,
  icon: string,
  livePlayers?: number,
];

const COMING_SOON: CSDef[] = [
  /* ----- Originals (the games we haven't built yet) ----- */
  ["Plinko",        "Yahu Originals",   "originals", "linear-gradient(140deg, #EC4899 0%, #BE185D 100%)", "🟣", 2084],
  ["Keno",          "Yahu Originals",   "originals", "linear-gradient(140deg, #06B6D4 0%, #155E75 100%)", "🎱", 2054],
  ["Chicken",       "Yahu Originals",   "originals", "linear-gradient(140deg, #38BDF8 0%, #0369A1 100%)", "🐔", 706],
  ["Aviator",       "Yahu Originals",   "originals", "linear-gradient(140deg, #DC2626 0%, #7F1D1D 100%)", "✈️", 1248],
  ["Diamonds",      "Yahu Originals",   "originals", "linear-gradient(140deg, #C084FC 0%, #6B21A8 100%)", "💎", 130],
  ["Zoo",           "Yahu Originals",   "originals", "linear-gradient(140deg, #FB923C 0%, #9A3412 100%)", "🦁", 378],
  ["Video Poker",   "Yahu Originals",   "originals", "linear-gradient(140deg, #1E40AF 0%, #1E1B4B 100%)", "🂠", 198],
  ["Texas Hold'em", "Yahu Originals",   "originals", "linear-gradient(140deg, #0E5A36 0%, #052e1a 100%)", "♠", 305],
  ["Three Card Poker","Yahu Originals", "originals", "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "♥", 117],

  /* ----- Slots (curated favourites) ----- */
  ["Gates of Olympus 1000", "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #1E3A8A 0%, #312E81 100%)", "⚡", 1072],
  ["Sugar Rush 1000",       "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F472B6 0%, #BE185D 100%)", "🍭", 945],
  ["Sweet Bonanza 1000",    "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FB7185 0%, #9F1239 100%)", "🍓", 559],
  ["Wanted Dead or A Wild", "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #B91C1C 0%, #450A0A 100%)", "🤠", 458],
  ["Duck Hunters",          "Nolimit Yahu",   "slots",  "linear-gradient(140deg, #22C55E 0%, #14532D 100%)", "🦆", 332],
  ["Super Scatter",         "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F59E0B 0%, #B45309 100%)", "✨", 768],
  ["Mystic Reels",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #6366F1 0%, #312E81 100%)", "🔮", 412],
  ["Lucky Lions",           "YahuPlay",       "slots",  "linear-gradient(140deg, #F97316 0%, #7C2D12 100%)", "🦁", 281],
  ["Dragon Riches",         "VioletGames",    "slots",  "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🐉", 522],
  ["Pharaoh's Gold",        "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #F59E0B 0%, #78350F 100%)", "👑", 678],
  ["Cosmic Spins",          "VioletGames",    "slots",  "linear-gradient(140deg, #7C3AED 0%, #1E1B4B 100%)", "🪐", 244],
  ["Bonanza Billions",      "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FBBF24 0%, #92400E 100%)", "💰", 837],
  ["Big Bass Run",          "Hacksaw Yahu",   "slots",  "linear-gradient(140deg, #0EA5E9 0%, #14532D 100%)", "🎣", 654],
  ["Dog House Megaways",    "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #EF4444 0%, #1E40AF 100%)", "🐕", 502],
  ["Razor Shark",           "Push Yahu",      "slots",  "linear-gradient(140deg, #0EA5E9 0%, #0C4A6E 100%)", "🦈", 412],
  ["Money Train Express",   "Relax Yahu",     "slots",  "linear-gradient(140deg, #F97316 0%, #1E40AF 100%)", "🚂", 388],
  ["Eye of Horus",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #F59E0B 0%, #1E3A8A 100%)", "👁️", 421],
  ["Wolf Gold",             "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #FBBF24 0%, #1E40AF 100%)", "🌕", 547],
  ["Madame Destiny",        "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #A855F7 0%, #6B21A8 100%)", "🔮", 305],
  ["Power of Thor",         "Pragmatic Yahu", "slots",  "linear-gradient(140deg, #1E40AF 0%, #475569 100%)", "⚡", 366],
  ["Pyramid King",          "Midnight Yahu",  "slots",  "linear-gradient(140deg, #F59E0B 0%, #713F12 100%)", "🏛️", 248],
  ["Knight Quest",          "VioletGames",    "slots",  "linear-gradient(140deg, #4B5563 0%, #1E1B4B 100%)", "🛡️", 154],

  /* ----- Table ----- */
  ["Baccarat Royale",  "GoldChip",       "table",   "linear-gradient(140deg, #16A34A 0%, #14532D 100%)", "🃏", 138],
  ["Poker Pro",        "VioletGames",    "table",   "linear-gradient(140deg, #1D4ED8 0%, #1E3A8A 100%)", "♠", 222],
  ["Caribbean Stud",   "GoldChip",       "table",   "linear-gradient(140deg, #BE123C 0%, #4C0519 100%)", "♣", 77],
  ["Sic Bo",           "OracleSlots",    "table",   "linear-gradient(140deg, #F59E0B 0%, #92400E 100%)", "🎴", 51],
  ["Casino Hold'em",   "GoldChip",       "table",   "linear-gradient(140deg, #0E5A36 0%, #0F172A 100%)", "♠", 88],

  /* ----- Live ----- */
  ["Live Roulette HD",   "Yahu Live", "live", "linear-gradient(140deg, #DC2626 0%, #450A0A 100%)", "🎯", 0],
  ["Live Blackjack",     "Yahu Live", "live", "linear-gradient(140deg, #0E5A36 0%, #064E3B 100%)", "♠", 0],
  ["Live Crazy Time",    "Yahu Live", "live", "linear-gradient(140deg, #EC4899 0%, #831843 100%)", "🎡", 0],
  ["Live Baccarat",      "Yahu Live", "live", "linear-gradient(140deg, #F59E0B 0%, #78350F 100%)", "🃏", 0],
  ["Lightning Roulette", "Yahu Live", "live", "linear-gradient(140deg, #FBBF24 0%, #B45309 100%)", "⚡", 0],
  ["Mega Wheel",         "Yahu Live", "live", "linear-gradient(140deg, #1E40AF 0%, #DC2626 100%)", "🎡", 0],
  ["Monopoly Live",      "Yahu Live", "live", "linear-gradient(140deg, #DC2626 0%, #1E40AF 100%)", "🎲", 0],
];

export const GAMES: GameDef[] = [
  ...PLAYABLE,
  ...COMING_SOON.map((c, i): GameDef => {
    const [title, provider, category, gradient, icon, livePlayers] = c;
    return {
      slug: `cs-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
      title,
      provider,
      category,
      available: false,
      livePlayers,
      cover: { gradient, accent: "#9B7CFF", icon },
    };
  }),
];

export function gameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}

export const PLAYABLE_SLUGS = PLAYABLE.map((g) => g.slug);
