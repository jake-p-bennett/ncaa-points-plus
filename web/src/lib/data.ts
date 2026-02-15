import { LeaderboardPlayer, PlayerDetail, DistributionBin, Metadata } from "./types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export function getLeaderboard(): LeaderboardPlayer[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "leaderboard.json"), "utf-8");
  return JSON.parse(raw);
}

export function getPlayerDetail(id: string): PlayerDetail | null {
  const filePath = path.join(DATA_DIR, "players", `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getDistribution(): DistributionBin[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "distribution.json"), "utf-8");
  return JSON.parse(raw);
}

export function getMetadata(): Metadata {
  const raw = fs.readFileSync(path.join(DATA_DIR, "metadata.json"), "utf-8");
  return JSON.parse(raw);
}
