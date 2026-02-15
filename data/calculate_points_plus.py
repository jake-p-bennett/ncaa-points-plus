"""Calculate Points+ from raw CSV data for NCAA basketball."""

import os
import pandas as pd
import numpy as np

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")

MIN_GAMES = 10
MIN_MPG = 12.0


def load_data():
    teams = pd.read_csv(os.path.join(RAW_DIR, "teams.csv"))
    rosters = pd.read_csv(os.path.join(RAW_DIR, "rosters.csv"))
    game_logs = pd.read_csv(os.path.join(RAW_DIR, "game_logs.csv"))
    schedules = pd.read_csv(os.path.join(RAW_DIR, "team_schedules.csv"))
    return teams, rosters, game_logs, schedules


def build_opponent_metrics(schedules, teams):
    """Compute defensive strength and pace for each team using schedule data."""
    # Defensive strength: average points allowed per game
    team_def = schedules.groupby("team_id").agg(
        games=("game_id", "count"),
        total_pts_allowed=("opp_score", "sum"),
        total_pts_scored=("team_score", "sum"),
    ).reset_index()

    team_def["avg_pts_allowed"] = team_def["total_pts_allowed"] / team_def["games"]
    # Pace proxy: average total points per game (both teams)
    team_def["avg_total_pts"] = (team_def["total_pts_scored"] + team_def["total_pts_allowed"]) / team_def["games"]

    league_avg_def = team_def["avg_pts_allowed"].mean()
    league_avg_pace = team_def["avg_total_pts"].mean()

    # Build dicts
    def_strength = dict(zip(team_def["team_id"], team_def["avg_pts_allowed"]))
    pace = dict(zip(team_def["team_id"], team_def["avg_total_pts"]))

    print(f"  League avg pts allowed: {league_avg_def:.1f}")
    print(f"  League avg total pts (pace): {league_avg_pace:.1f}")
    print(f"  Teams with schedule data: {len(team_def)}")

    return def_strength, pace, league_avg_def, league_avg_pace


def calculate(teams, rosters, game_logs, schedules):
    """Core Points+ calculation."""
    def_strength, pace, league_avg_def, league_avg_pace = build_opponent_metrics(schedules, teams)

    # Calculate adjusted points per game
    adjusted_pts = []
    for _, row in game_logs.iterrows():
        opp_id = row["opponent_id"]
        raw_pts = row["pts"]

        opp_def = def_strength.get(opp_id, league_avg_def)
        opp_pace = pace.get(opp_id, league_avg_pace)

        # Adjust: harder defense scales up, faster pace scales down
        adj = raw_pts * (league_avg_def / opp_def) * (league_avg_pace / opp_pace)
        adjusted_pts.append(adj)

    game_logs["adjusted_pts"] = adjusted_pts

    # Aggregate by player
    player_agg = game_logs.groupby("player_id").agg(
        games_played=("game_id", "count"),
        total_pts=("pts", "sum"),
        total_adj_pts=("adjusted_pts", "sum"),
        total_min=("min", "sum"),
    ).reset_index()

    player_agg["raw_ppg"] = player_agg["total_pts"] / player_agg["games_played"]
    player_agg["adj_ppg"] = player_agg["total_adj_pts"] / player_agg["games_played"]
    player_agg["mpg"] = player_agg["total_min"] / player_agg["games_played"]

    # Filter qualifying players
    qualifying = player_agg[
        (player_agg["games_played"] >= MIN_GAMES) &
        (player_agg["mpg"] >= MIN_MPG)
    ].copy()

    print(f"  {len(qualifying)} qualifying players (>={MIN_GAMES} GP, >={MIN_MPG} MPG)")

    # Calculate Points+
    league_avg_adj_ppg = qualifying["adj_ppg"].mean()
    qualifying["points_plus"] = (qualifying["adj_ppg"] / league_avg_adj_ppg) * 100

    # Sort by Points+
    qualifying = qualifying.sort_values(
        ["points_plus", "adj_ppg"], ascending=[False, False]
    ).reset_index(drop=True)

    # Round values after sorting
    qualifying["raw_ppg"] = qualifying["raw_ppg"].round(1)
    qualifying["adj_ppg"] = qualifying["adj_ppg"].round(1)
    qualifying["mpg"] = qualifying["mpg"].round(1)
    qualifying["points_plus"] = qualifying["points_plus"].round(0).astype(int)
    qualifying["rank"] = qualifying.index + 1

    # Merge player metadata from rosters
    roster_meta = rosters[["player_id", "player_name", "team_id", "team_name",
                           "team_abbr", "conference", "position", "jersey",
                           "class_year", "class_abbr"]].drop_duplicates(subset=["player_id"])
    qualifying = qualifying.merge(roster_meta, on="player_id", how="left")

    # Build per-player game logs and compute stddev
    player_game_logs = {}
    pp_std_devs = {}
    for pid in qualifying["player_id"].values:
        plogs = game_logs[game_logs["player_id"] == pid].copy()
        plogs = plogs.sort_values("date")

        # Compute per-game Points+
        plogs["game_points_plus"] = (plogs["adjusted_pts"] / league_avg_adj_ppg * 100).round(0).astype(int)

        pp_std_devs[int(pid)] = round(float(np.std(plogs["game_points_plus"].values)), 1)

        player_game_logs[int(pid)] = plogs[[
            "date", "matchup", "result", "min", "pts",
            "adjusted_pts", "game_points_plus"
        ]].to_dict("records")

    # Add stddev and volatility percentile
    qualifying["pp_std_dev"] = qualifying["player_id"].map(
        lambda pid: pp_std_devs.get(int(pid), 0.0)
    )
    qualifying["volatility_pctile"] = qualifying["pp_std_dev"].rank(pct=True).mul(100).round(0).astype(int)

    return qualifying, player_game_logs, league_avg_adj_ppg


def main():
    print("Loading raw data...")
    teams, rosters, game_logs, schedules = load_data()

    print("Calculating Points+...")
    qualifying, game_logs_dict, league_avg = calculate(
        teams, rosters, game_logs, schedules
    )

    print(f"\n  League avg adjusted PPG: {league_avg:.1f}")
    print(f"  Top 5:")
    for _, row in qualifying.head(5).iterrows():
        print(f"    {row['rank']}. {row['player_name']} ({row['team_abbr']}, {row['conference']}) — Points+ {row['points_plus']}, PPG {row['raw_ppg']}")

    return qualifying, game_logs_dict, league_avg


if __name__ == "__main__":
    main()
