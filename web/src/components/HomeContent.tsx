"use client";

import { useState, useMemo } from "react";
import { LeaderboardPlayer, DistributionBin, Metadata } from "@/lib/types";
import ConferenceFilter from "./ConferenceFilter";
import SearchBar from "./SearchBar";
import DistributionChart from "./DistributionChart";
import Leaderboard from "./Leaderboard";

export default function HomeContent({
  players,
  distribution,
  metadata,
}: {
  players: LeaderboardPlayer[];
  distribution: DistributionBin[];
  metadata: Metadata;
}) {
  const [conference, setConference] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!conference) return players;
    return players.filter((p) => p.conference === conference);
  }, [players, conference]);

  // Recompute distribution for filtered players
  const filteredDistribution = useMemo(() => {
    if (!conference) return distribution;
    const values = filtered.map((p) => p.pointsPlus);
    if (values.length === 0) return [];

    const min = Math.floor(Math.min(...values) / 10) * 10;
    const max = Math.ceil(Math.max(...values) / 10) * 10;
    const bins: DistributionBin[] = [];
    for (let lo = min; lo < max; lo += 10) {
      const hi = lo + 10;
      const count = values.filter((v) => v >= lo && v < hi).length;
      bins.push({ min: lo, max: hi, label: `${lo}-${hi}`, count });
    }
    return bins;
  }, [filtered, conference, distribution]);

  return (
    <>
      {/* Conference filter */}
      <div className="mb-6">
        <ConferenceFilter selected={conference} onChange={setConference} />
      </div>

      {/* Search */}
      <div className="mb-8 flex justify-center">
        <SearchBar players={filtered} />
      </div>

      {/* Distribution chart */}
      <div className="mb-8">
        <DistributionChart data={filteredDistribution} players={filtered} />
      </div>

      {/* Leaderboard */}
      <Leaderboard players={filtered} />
    </>
  );
}
