"use client";

import { useState } from "react";
import { User } from "lucide-react";

export default function PlayerImage({
  playerId,
  name,
  size = 40,
}: {
  playerId: number;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = `https://a.espncdn.com/combiner/i?img=/i/headshots/mens-college-basketball/players/full/${playerId}.png&w=${size * 2}&h=${size * 2}`;

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-slate-700"
        style={{ width: size, height: size }}
      >
        <User className="text-slate-400" size={size * 0.6} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover bg-slate-700"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
