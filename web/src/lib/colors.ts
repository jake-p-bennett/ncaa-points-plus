export function getPointsPlusColor(value: number): string {
  if (value >= 150) return "bg-amber-500 text-black";
  if (value >= 130) return "bg-emerald-500 text-white";
  if (value >= 110) return "bg-teal-500 text-white";
  if (value >= 90) return "bg-slate-500 text-white";
  if (value >= 70) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
}

export function getPointsPlusBarColor(value: number): string {
  if (value >= 150) return "#f59e0b";
  if (value >= 130) return "#10b981";
  if (value >= 110) return "#14b8a6";
  if (value >= 90) return "#64748b";
  if (value >= 70) return "#f97316";
  return "#ef4444";
}

export function getStdDevColor(value: number): string {
  if (value >= 60) return "text-amber-400";
  if (value >= 50) return "text-orange-300";
  if (value >= 40) return "text-slate-300";
  if (value >= 30) return "text-sky-300";
  return "text-teal-400";
}

export function getRankAccent(rank: number): string {
  if (rank === 1) return "border-l-4 border-l-amber-400";
  if (rank === 2) return "border-l-4 border-l-slate-300";
  if (rank === 3) return "border-l-4 border-l-amber-700";
  return "";
}

export function getConferenceColor(conference: string): string {
  switch (conference) {
    case "ACC": return "bg-blue-600";
    case "Big East": return "bg-red-600";
    case "Big Ten": return "bg-indigo-600";
    case "Big 12": return "bg-orange-600";
    case "SEC": return "bg-yellow-600";
    default: return "bg-slate-600";
  }
}
