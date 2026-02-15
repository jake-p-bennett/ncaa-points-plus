"""Generate JSON files for the NCAA website from calculated data."""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


def generate_leaderboard(qualifying):
    """Generate leaderboard.json with all qualifying players."""
    players = []
    for _, row in qualifying.iterrows():
        player = {
            "id": int(row["player_id"]),
            "name": row["player_name"],
            "team": row["team_abbr"],
            "teamName": row["team_name"],
            "conference": row["conference"],
            "rank": int(row["rank"]),
            "gp": int(row["games_played"]),
            "ppg": float(row["raw_ppg"]),
            "adjPpg": float(row["adj_ppg"]),
            "pointsPlus": int(row["points_plus"]),
            "mpg": float(row["mpg"]),
        }

        if pd.notna(row.get("position")):
            player["position"] = str(row["position"])
        if pd.notna(row.get("jersey")):
            jersey = str(row["jersey"])
            if jersey.endswith(".0"):
                jersey = jersey[:-2]
            player["jersey"] = jersey
        if pd.notna(row.get("class_year")):
            player["classYear"] = str(row["class_year"])

        if "pp_std_dev" in row.index:
            player["pointsPlusStdDev"] = float(row["pp_std_dev"])
        if "volatility_pctile" in row.index:
            player["volatilityPctile"] = int(row["volatility_pctile"])

        players.append(player)

    path = os.path.join(OUTPUT_DIR, "leaderboard.json")
    with open(path, "w") as f:
        json.dump(players, f, indent=2)

    print(f"  Saved leaderboard.json ({len(players)} players)")
    return players


def generate_player_files(qualifying, game_logs_dict, leaderboard):
    """Generate individual player JSON files."""
    players_dir = os.path.join(OUTPUT_DIR, "players")
    os.makedirs(players_dir, exist_ok=True)

    lb_lookup = {p["id"]: p for p in leaderboard}

    count = 0
    for _, row in qualifying.iterrows():
        pid = int(row["player_id"])
        player_data = lb_lookup.get(pid, {}).copy()

        logs = game_logs_dict.get(pid, [])
        game_log = []
        for g in logs:
            game_log.append({
                "date": g["date"],
                "matchup": g["matchup"],
                "result": g.get("result", ""),
                "min": g["min"],
                "pts": g["pts"],
                "adjPts": round(g["adjusted_pts"], 1),
                "pointsPlus": int(g["game_points_plus"]),
            })

        player_data["gameLog"] = game_log

        path = os.path.join(players_dir, f"{pid}.json")
        with open(path, "w") as f:
            json.dump(player_data, f, indent=2)
        count += 1

    print(f"  Saved {count} player files")


def generate_distribution(qualifying):
    """Generate histogram data for Points+ distribution."""
    values = qualifying["points_plus"].values

    min_val = int(np.floor(values.min() / 10) * 10)
    max_val = int(np.ceil(values.max() / 10) * 10)
    bin_edges = list(range(min_val, max_val + 1, 10))
    counts, edges = np.histogram(values, bins=bin_edges)

    bins = []
    for i in range(len(counts)):
        bins.append({
            "min": int(edges[i]),
            "max": int(edges[i + 1]),
            "label": f"{int(edges[i])}-{int(edges[i + 1])}",
            "count": int(counts[i]),
        })

    path = os.path.join(OUTPUT_DIR, "distribution.json")
    with open(path, "w") as f:
        json.dump(bins, f, indent=2)

    print(f"  Saved distribution.json ({len(bins)} bins)")


def generate_metadata(qualifying):
    """Generate metadata about the data generation."""
    # Conference breakdown
    conf_counts = {}
    if "conference" in qualifying.columns:
        conf_counts = qualifying["conference"].value_counts().to_dict()

    meta = {
        "generatedAt": datetime.now().isoformat(),
        "season": "2025-26",
        "asOfDate": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
        "qualifyingCriteria": {
            "minGames": 10,
            "minMpg": 12.0,
        },
        "totalQualifyingPlayers": len(qualifying),
        "leagueAvgPointsPlus": 100,
        "conferenceBreakdown": conf_counts,
        "conferences": ["ACC", "Big East", "Big Ten", "Big 12", "SEC"],
    }

    path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  Saved metadata.json")


def main(qualifying, game_logs_dict):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Generating JSON files...")
    leaderboard = generate_leaderboard(qualifying)
    generate_player_files(qualifying, game_logs_dict, leaderboard)
    generate_distribution(qualifying)
    generate_metadata(qualifying)
    print("\nAll JSON files generated!")


if __name__ == "__main__":
    from calculate_points_plus import main as calc_main
    qualifying, game_logs_dict, _ = calc_main()
    main(qualifying, game_logs_dict)
