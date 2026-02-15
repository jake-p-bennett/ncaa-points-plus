interface VolatilityCalloutProps {
  pointsPlusStdDev: number;
  volatilityPctile: number;
  name: string;
}

export default function VolatilityCallout({ pointsPlusStdDev, volatilityPctile, name }: VolatilityCalloutProps) {
  const firstName = name.split(" ")[0];
  const isVolatile = volatilityPctile > 50;
  const topPct = isVolatile ? 100 - volatilityPctile : volatilityPctile;

  const borderClass = isVolatile ? "border-amber-500/30" : "border-teal-500/30";
  const bgClass = isVolatile ? "bg-amber-500/5" : "bg-teal-500/5";
  const labelColor = isVolatile ? "text-amber-400" : "text-teal-400";
  const valueColor = isVolatile ? "text-amber-300" : "text-teal-300";
  const dotColor = isVolatile ? "bg-amber-400" : "bg-teal-400";

  const descriptor = isVolatile ? "most volatile" : "most consistent";

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-4 flex items-center gap-4`}>
      <div className="text-center min-w-[80px]">
        <div className={`text-xs uppercase tracking-wider mb-1 ${labelColor}`}>Std Dev</div>
        <div className={`text-2xl font-bold ${valueColor}`}>{pointsPlusStdDev}</div>
      </div>
      <div className="h-8 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-sm text-slate-300">
          {firstName} is a <span className={`font-semibold ${valueColor}`}>top {topPct}% {descriptor}</span> scorer
        </span>
      </div>
    </div>
  );
}
