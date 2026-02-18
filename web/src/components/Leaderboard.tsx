"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { LeaderboardPlayer, SortField, SortDirection } from "@/lib/types";
import { getRankAccent, getStdDevColor, getConferenceColor } from "@/lib/colors";
import PlayerImage from "./PlayerImage";
import PointsPlusBadge from "./PointsPlusBadge";

const DEFAULT_SHOW = 50;

export default function Leaderboard({ players }: { players: LeaderboardPlayer[] }) {
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [showAll, setShowAll] = useState(false);

  const playersWithDiff = players.map((p) => ({
    ...p,
    diff: Math.round((p.adjPpg - p.ppg) * 10) / 10,
  }));

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" || field === "team" || field === "conference" ? "asc" : "desc");
    }
  }

  const sorted = [...playersWithDiff].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    const diff = (aVal as number) - (bVal as number);
    return sortDir === "asc" ? diff : -diff;
  });

  const displayed = showAll ? sorted : sorted.slice(0, DEFAULT_SHOW);

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="inline h-3 w-3" />
    ) : (
      <ChevronDown className="inline h-3 w-3" />
    );
  }

  function ColHeader({ field, label, className = "" }: { field: SortField; label: string; className?: string }) {
    return (
      <th
        className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors ${
          sortField === field ? "text-amber-500" : "text-slate-400"
        } ${className}`}
        onClick={() => handleSort(field)}
      >
        {label} <SortIcon field={field} />
      </th>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <ColHeader field="rank" label="#" className="w-12" />
              <ColHeader field="name" label="Player" />
              <ColHeader field="team" label="Team" className="w-16" />
              <ColHeader field="conference" label="Conf" className="w-24" />
              <ColHeader field="gp" label="GP" className="w-14" />
              <ColHeader field="ppg" label="PPG" className="w-16" />
              <ColHeader field="adjPpg" label="Adj PPG" className="w-20" />
              <ColHeader field="diff" label="Diff" className="w-16" />
              <ColHeader field="pointsPlus" label="Points+" className="w-24" />
              <ColHeader field="pointsPlusStdDev" label="Std Dev" className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {displayed.map((player) => (
              <tr
                key={player.id}
                className={`bg-slate-900/50 hover:bg-slate-800/80 transition-colors ${getRankAccent(player.rank)}`}
              >
                <td className="px-3 py-2.5 text-sm text-slate-400 font-mono">{player.rank}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/player/${player.id}`} className="flex items-center gap-3 group">
                    <PlayerImage playerId={player.id} name={player.name} size={36} />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                        {player.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {player.position || "—"} {player.classYear ? `· ${player.classYear}` : ""}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-300">{player.team}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white ${getConferenceColor(player.conference)}`}>
                    {player.conference}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-300">{player.gp}</td>
                <td className="px-3 py-2.5 text-sm text-slate-300">{player.ppg}</td>
                <td className="px-3 py-2.5 text-sm text-slate-300">{player.adjPpg}</td>
                <td className={`px-3 py-2.5 text-sm font-medium ${player.diff > 0 ? "text-emerald-400" : player.diff < 0 ? "text-red-400" : "text-slate-300"}`}>
                  {player.diff > 0 ? "+" : ""}{player.diff.toFixed(1)}
                </td>
                <td className="px-3 py-2.5">
                  <PointsPlusBadge value={player.pointsPlus} />
                </td>
                <td className={`px-3 py-2.5 text-sm font-medium ${player.pointsPlusStdDev != null ? getStdDevColor(player.pointsPlusStdDev) : "text-slate-300"}`}>
                  {player.pointsPlusStdDev != null ? player.pointsPlusStdDev : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {displayed.map((player) => (
          <Link
            key={player.id}
            href={`/player/${player.id}`}
            className={`block rounded-lg bg-slate-900/50 border border-slate-800 p-3 hover:bg-slate-800/80 transition-colors ${getRankAccent(player.rank)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-mono w-6">{player.rank}</span>
              <PlayerImage playerId={player.id} name={player.name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{player.name}</div>
                <div className="text-xs text-slate-400">
                  {player.team} &middot; {player.conference} &middot; {player.ppg} PPG
                </div>
              </div>
              <PointsPlusBadge value={player.pointsPlus} />
            </div>
          </Link>
        ))}
      </div>

      {!showAll && players.length > DEFAULT_SHOW && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Show All {players.length} Players
          </button>
        </div>
      )}

      {showAll && players.length > DEFAULT_SHOW && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Show Top {DEFAULT_SHOW}
          </button>
        </div>
      )}
    </div>
  );
}
