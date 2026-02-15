"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { GameLogEntry } from "@/lib/types";
import { getPointsPlusBarColor } from "@/lib/colors";

export default function GameLogChart({ gameLog }: { gameLog: GameLogEntry[] }) {
  const data = gameLog.map((g, i) => ({
    index: i + 1,
    date: g.date,
    matchup: g.matchup,
    pts: g.pts,
    pointsPlus: g.pointsPlus,
    result: g.result,
  }));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
        Game-by-Game Points+
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="index"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              label={{ value: "Game #", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelStyle={{ color: "#f1f5f9" }}
              itemStyle={{ color: "#cbd5e1" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value}`, "Points+"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(_: any, payload: readonly any[]) => {
                const item = payload?.[0]?.payload;
                return item ? `${item.matchup} (${item.date})` : "";
              }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <ReferenceLine
              y={100}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: "100", fill: "#f59e0b", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="pointsPlus" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getPointsPlusBarColor(entry.pointsPlus)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
