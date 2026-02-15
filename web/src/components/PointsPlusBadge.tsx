import { getPointsPlusColor } from "@/lib/colors";

export default function PointsPlusBadge({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "lg";
}) {
  const colorClass = getPointsPlusColor(value);
  const sizeClass = size === "lg" ? "px-4 py-2 text-2xl font-bold" : "px-2 py-0.5 text-sm font-semibold";

  return (
    <span className={`inline-block rounded-full ${colorClass} ${sizeClass}`}>
      {value}
    </span>
  );
}
