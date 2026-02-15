"use client";

import { CONFERENCES, Conference } from "@/lib/types";
import { getConferenceColor } from "@/lib/colors";

interface ConferenceFilterProps {
  selected: string | null;
  onChange: (conference: string | null) => void;
}

export default function ConferenceFilter({ selected, onChange }: ConferenceFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          selected === null
            ? "bg-amber-500 text-black"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        }`}
      >
        All
      </button>
      {CONFERENCES.map((conf) => (
        <button
          key={conf}
          onClick={() => onChange(selected === conf ? null : conf)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === conf
              ? `${getConferenceColor(conf)} text-white`
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          {conf}
        </button>
      ))}
    </div>
  );
}
