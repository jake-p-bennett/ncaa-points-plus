export interface LeaderboardPlayer {
  id: number;
  name: string;
  team: string;
  teamName: string;
  conference: string;
  rank: number;
  gp: number;
  ppg: number;
  adjPpg: number;
  pointsPlus: number;
  mpg: number;
  position?: string;
  jersey?: string;
  classYear?: string;
  pointsPlusStdDev?: number;
  volatilityPctile?: number;
}

export interface GameLogEntry {
  date: string;
  matchup: string;
  result: string;
  min: number;
  pts: number;
  adjPts: number;
  pointsPlus: number;
}

export interface PlayerDetail extends LeaderboardPlayer {
  gameLog: GameLogEntry[];
}

export interface DistributionBin {
  min: number;
  max: number;
  label: string;
  count: number;
}

export interface Metadata {
  generatedAt: string;
  season: string;
  asOfDate: string;
  qualifyingCriteria: {
    minGames: number;
    minMpg: number;
  };
  totalQualifyingPlayers: number;
  leagueAvgPointsPlus: number;
  conferenceBreakdown: Record<string, number>;
  conferences: string[];
}

export type SortField = "rank" | "name" | "team" | "conference" | "gp" | "ppg" | "adjPpg" | "diff" | "pointsPlus" | "pointsPlusStdDev" | "mpg";
export type SortDirection = "asc" | "desc";

export const CONFERENCES = ["ACC", "Big East", "Big Ten", "Big 12", "SEC"] as const;
export type Conference = typeof CONFERENCES[number];
