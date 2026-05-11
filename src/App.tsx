import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import { Casino, Slots, TableGames } from "@/pages/CategoryPage";
import Promotions from "@/pages/Promotions";
import Profile from "@/pages/Profile";
import SizzlingFruits from "@/pages/SizzlingFruits";
import BookOfYahu from "@/pages/BookOfYahu";
import Blackjack from "@/pages/Blackjack";
import Roulette from "@/pages/Roulette";
import Towers from "@/pages/Towers";
import { StubPage, NotFound } from "@/pages/Stub";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/casino" element={<Casino />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="/table-games" element={<TableGames />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/leaderboard"
          element={
            <StubPage
              title="Leaderboard"
              message="Mock leaderboard — coming soon in the demo."
            />
          }
        />
        <Route
          path="/affiliates"
          element={
            <StubPage
              title="Affiliates"
              message="Affiliate program is mocked for the demo. No real payouts."
            />
          }
        />

        <Route path="/play/sizzling-fruits" element={<SizzlingFruits />} />
        <Route path="/play/book-of-yahu" element={<BookOfYahu />} />
        <Route path="/play/blackjack" element={<Blackjack />} />
        <Route path="/play/roulette" element={<Roulette />} />
        <Route path="/play/towers" element={<Towers />} />
        {/* Coming-soon mocked games redirect back to casino */}
        <Route path="/play/cs-:slug" element={<Navigate to="/casino" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
