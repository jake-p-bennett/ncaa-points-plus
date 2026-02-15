import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMetadata } from "@/lib/data";

export default function AboutPage() {
  const metadata = getMetadata();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          About Points<span className="text-amber-500">+</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Methodology and calculation details for NCAA basketball
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          {/* What is Points+ */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What is Points+?</h2>
            <p>
              Points+ is a context-adjusted scoring metric for NCAA basketball players, inspired by
              stats like <strong className="text-white">OPS+</strong> and{" "}
              <strong className="text-white">wRC+</strong> in baseball. It measures how
              a player&apos;s scoring output compares to the league average after accounting
              for the difficulty of their opponents.
            </p>
            <p className="mt-3">
              A Points+ of <strong className="text-white">100</strong> means a player
              scores exactly at the league average rate. A Points+ of{" "}
              <strong className="text-white">130</strong> means a player scores 30% above
              average, while <strong className="text-white">80</strong> means 20% below.
            </p>
          </section>

          {/* Coverage */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Conference Coverage</h2>
            <p>
              This dashboard covers players from the five major conferences in NCAA Division I
              men&apos;s basketball:
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["ACC", "Big East", "Big Ten", "Big 12", "SEC"].map((conf) => (
                <div key={conf} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-center">
                  <span className="text-sm font-medium text-white">{conf}</span>
                  {metadata.conferenceBreakdown[conf] && (
                    <span className="ml-2 text-xs text-slate-400">
                      ({metadata.conferenceBreakdown[conf]} players)
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              &ldquo;League average&rdquo; is calculated across all qualifying players in these 5 conferences.
            </p>
          </section>

          {/* Why adjust? */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Why adjust raw scoring?</h2>
            <p>
              Raw points per game doesn&apos;t tell the whole story. A player who scores
              25 PPG against elite defenses is arguably more impressive than one who
              scores 25 PPG against weaker opponents. Similarly, a player in a conference
              with faster-paced games will have more possessions (and more
              opportunities to score).
            </p>
            <p className="mt-3">
              Points+ adjusts for both of these factors to give a fairer comparison
              across all players and conferences.
            </p>
          </section>

          {/* The Formula */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">The Formula</h2>
            <p className="mb-4">Points+ is calculated in three steps:</p>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-5">
              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 1: Adjust each game
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  adjusted_pts = raw_pts &times; (league_avg_pts_allowed / opp_avg_pts_allowed) &times; (league_avg_pace / opp_pace)
                </code>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>
                    <strong className="text-slate-300">Opponent Defense:</strong> If the
                    opponent allows fewer points than average (tougher defense),
                    the player&apos;s points are scaled up.
                  </li>
                  <li>
                    <strong className="text-slate-300">Pace:</strong> If the opponent
                    plays at a faster pace than average, points are scaled down since
                    more possessions means more scoring opportunities.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 2: Compute adjusted PPG
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  adjusted_ppg = sum(adjusted_pts) / games_played
                </code>
              </div>

              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 3: Scale to league average = 100
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  Points+ = (player_adjusted_ppg / league_avg_adjusted_ppg) &times; 100
                </code>
              </div>
            </div>
          </section>

          {/* Key Inputs */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Key Inputs</h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Input</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Source</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">Avg Pts Allowed</td>
                    <td className="px-4 py-2.5 text-slate-400">Team Schedules</td>
                    <td className="px-4 py-2.5 text-slate-400">Average points allowed per game. Lower = better defense.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">Total Pts/Game</td>
                    <td className="px-4 py-2.5 text-slate-400">Team Schedules</td>
                    <td className="px-4 py-2.5 text-slate-400">Average combined score (both teams). Proxy for pace.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">PTS</td>
                    <td className="px-4 py-2.5 text-slate-400">Player Game Logs</td>
                    <td className="px-4 py-2.5 text-slate-400">Raw points scored in each individual game.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Qualifying Criteria */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Qualifying Criteria</h2>
            <p>To appear on the leaderboard, a player must meet both thresholds:</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong className="text-white">Minimum {metadata.qualifyingCriteria.minGames} games played</strong> — filters
                  out players with small sample sizes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong className="text-white">Minimum {metadata.qualifyingCriteria.minMpg} minutes per game</strong> — ensures
                  players have meaningful playing time
                </span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-400">
              This yields {metadata.totalQualifyingPlayers} qualifying players for the {metadata.season} season.
            </p>
          </section>

          {/* Color Scale */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Color Scale</h2>
            <p className="mb-4">Points+ values are color-coded for quick visual reference:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ColorScaleItem color="bg-amber-500 text-black" range="150+" label="Elite" />
              <ColorScaleItem color="bg-emerald-500 text-white" range="130-149" label="Excellent" />
              <ColorScaleItem color="bg-teal-500 text-white" range="110-129" label="Above Average" />
              <ColorScaleItem color="bg-slate-500 text-white" range="90-109" label="Average" />
              <ColorScaleItem color="bg-orange-500 text-white" range="70-89" label="Below Average" />
              <ColorScaleItem color="bg-red-500 text-white" range="Below 70" label="Well Below Average" />
            </div>
          </section>

          {/* Scoring Volatility */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Scoring Volatility (Std Dev)</h2>
            <p>
              The <strong className="text-white">Std Dev</strong> column on the leaderboard
              measures how much a player&apos;s game-level Points+ fluctuates from game to game.
            </p>
            <p className="mt-3">
              A <strong className="text-white">low</strong> standard deviation means the player
              puts up similar performances every night — consistent and predictable.
              A <strong className="text-white">high</strong> standard deviation means
              the player swings between big games and quiet ones — streaky and volatile.
            </p>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitations</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  Only covers 5 major conferences. Mid-major conferences and
                  non-conference opponents use league averages as defaults.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  Opponent defensive strength is a season-level average, not
                  per-game. A team&apos;s defense may vary due to injuries or matchups.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  Points+ only measures scoring output. It does not capture playmaking,
                  defense, rebounding, or other contributions.
                </span>
              </li>
            </ul>
          </section>

          {/* Data Source */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Source</h2>
            <p>
              All data is sourced from ESPN&apos;s public API. The data pipeline fetches
              player game logs, team schedules, and roster information for the{" "}
              {metadata.season} season across the ACC, Big East, Big Ten, Big 12, and SEC.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Data last updated: {metadata.asOfDate}
            </p>
          </section>

          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/jacob-peltier-bennett/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-400 transition-colors"
            >
              Jake Bennett
            </a>
            {" "}and{" "}
            <span className="text-white">Claude Code</span>
          </div>
        </div>
      </main>

      <Footer asOfDate={metadata.asOfDate} />
    </div>
  );
}

function ColorScaleItem({ color, range, label }: { color: string; range: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
        {range}
      </span>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}
