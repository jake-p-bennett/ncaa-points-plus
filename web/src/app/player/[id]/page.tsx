import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPlayerDetail, getLeaderboard, getMetadata } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PointsPlusBadge from "@/components/PointsPlusBadge";
import PlayerImage from "@/components/PlayerImage";
import GameLogChart from "@/components/GameLogChart";
import PointsPlusHistogram from "@/components/PointsPlusHistogram";
import VolatilityCallout from "@/components/VolatilityCallout";
import { getConferenceColor } from "@/lib/colors";

export function generateStaticParams() {
  const players = getLeaderboard();
  return players.map((p) => ({ id: String(p.id) }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayerDetail(id);
  const metadata = getMetadata();

  if (!player) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboard
        </Link>

        {/* Player header */}
        <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <PlayerImage playerId={player.id} name={player.name} size={120} />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{player.name}</h1>
              <PointsPlusBadge value={player.pointsPlus} size="lg" />
            </div>
            <div className="text-slate-400 text-sm space-x-2">
              <span>{player.teamName}</span>
              <span>&middot;</span>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${getConferenceColor(player.conference)}`}>
                {player.conference}
              </span>
              <span>&middot;</span>
              <span>{player.position || "—"}</span>
              {player.jersey && (
                <>
                  <span>&middot;</span>
                  <span>#{player.jersey}</span>
                </>
              )}
              {player.classYear && (
                <>
                  <span>&middot;</span>
                  <span>{player.classYear}</span>
                </>
              )}
              <span>&middot;</span>
              <span>Rank #{player.rank}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard label="Points+" value={player.pointsPlus} />
          <StatCard label="PPG" value={player.ppg} />
          <StatCard label="Adj PPG" value={player.adjPpg} />
          <StatCard label="GP" value={player.gp} />
          <StatCard label="MPG" value={player.mpg} />
        </div>

        {/* Game log chart */}
        <div className="mb-8">
          <GameLogChart gameLog={player.gameLog} />
        </div>

        {/* Points+ distribution histogram */}
        <div className="mb-8">
          <PointsPlusHistogram gameLog={player.gameLog} />
        </div>

        {/* Volatility callout */}
        {player.pointsPlusStdDev != null && player.volatilityPctile != null && (
          <div className="mb-8">
            <VolatilityCallout
              pointsPlusStdDev={player.pointsPlusStdDev}
              volatilityPctile={player.volatilityPctile}
              name={player.name}
            />
          </div>
        )}

        {/* Game log table */}
        <div className="rounded-lg border border-slate-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Date</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Matchup</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Result</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">MIN</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">PTS</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Adj PTS</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Points+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[...player.gameLog].reverse().map((game, i) => (
                <tr key={i} className="bg-slate-900/50 hover:bg-slate-800/80 transition-colors">
                  <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{game.date}</td>
                  <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{game.matchup}</td>
                  <td className="px-3 py-2">
                    <span className={game.result === "W" ? "text-emerald-400" : "text-red-400"}>
                      {game.result}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-300">{game.min}</td>
                  <td className="px-3 py-2 text-slate-300">{game.pts}</td>
                  <td className="px-3 py-2 text-slate-300">{game.adjPts}</td>
                  <td className="px-3 py-2">
                    <PointsPlusBadge value={game.pointsPlus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer asOfDate={metadata.asOfDate} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-center">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}
