"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { LeaderboardPlayer } from "@/lib/types";
import PlayerImage from "./PlayerImage";
import PointsPlusBadge from "./PointsPlusBadge";

export default function SearchBar({ players }: { players: LeaderboardPlayer[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 2
    ? players.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(id: number) {
    setQuery("");
    setIsOpen(false);
    router.push(`/player/${id}`);
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search players..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-10 text-sm text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
          {filtered.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelect(player.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700 transition-colors"
            >
              <PlayerImage playerId={player.id} name={player.name} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{player.name}</div>
                <div className="text-xs text-slate-400">{player.team} &middot; {player.conference} &middot; #{player.rank}</div>
              </div>
              <PointsPlusBadge value={player.pointsPlus} />
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-400">
          No players found
        </div>
      )}
    </div>
  );
}
