"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BarChart3 className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold text-white">
            NCAA Points<span className="text-amber-500">+</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
            About
          </Link>
          <span className="text-sm text-slate-400">2025-26 Season</span>
        </div>
      </div>
    </header>
  );
}
