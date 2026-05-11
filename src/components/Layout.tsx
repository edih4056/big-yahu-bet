import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { WelcomeModal } from "./WelcomeModal";
import { DemoBanner } from "./DemoBanner";

export function Layout() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <DemoBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
          <Footer />
        </main>
      </div>
      <WelcomeModal />
    </div>
  );
}
