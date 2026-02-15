"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { GameLogEntry } from "@/lib/types";
import { getPointsPlusBarColor } from "@/lib/colors";

const BIN_SIZE = 20;

function buildBins(gameLog: GameLogEntry[]) {
  const values = gameLog.map((g) => g.pointsPlus);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const startBin = Math.floor(minVal / BIN_SIZE) * BIN_SIZE;
  const endBin = Math.ceil((maxVal + 1) / BIN_SIZE) * BIN_SIZE;

  const bins: { label: string; count: number; midpoint: number }[] = [];
  for (let lo = startBin; lo < endBin; lo += BIN_SIZE) {
    const hi = lo + BIN_SIZE;
    bins.push({
      label: `${lo}-${hi}`,
      count: values.filter((v) => v >= lo && v < hi).length,
      midpoint: lo + BIN_SIZE / 2,
    });
  }

  return bins;
}

export default function PointsPlusHistogram({ gameLog }: { gameLog: GameLogEntry[] }) {
  if (gameLog.length === 0) return null;

  const data = buildBins(gameLog);

  const refBin = data.find((b) => b.midpoint >= 100 && b.midpoint < 100 + BIN_SIZE);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
        Points+ Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              label={{ value: "Points+ Range", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              width={35}
              allowDecimals={false}
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
              formatter={(value: any) => [`${value} game${value !== 1 ? "s" : ""}`, "Count"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => `Points+ ${label}`}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            {refBin && (
              <ReferenceLine
                x={refBin.label}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: "Avg (100)", fill: "#f59e0b", fontSize: 10, position: "top" }}
              />
            )}
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getPointsPlusBarColor(entry.midpoint)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
