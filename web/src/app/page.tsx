import { getLeaderboard, getDistribution, getMetadata } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/HomeContent";

export default function Home() {
  const players = getLeaderboard();
  const distribution = getDistribution();
  const metadata = getMetadata();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Hero section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Points<span className="text-amber-500">+</span> Leaderboard
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            NCAA basketball scoring relative to league average (100), adjusted for
            opponent defensive strength and game pace. Data as of {metadata.asOfDate}.
          </p>
        </div>

        <HomeContent
          players={players}
          distribution={distribution}
          metadata={metadata}
        />
      </main>

      <Footer asOfDate={metadata.asOfDate} />
    </div>
  );
}
