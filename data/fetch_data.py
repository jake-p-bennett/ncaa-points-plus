"""Fetch NCAA basketball data from ESPN API and save as CSVs."""

import os
import time
import json
import requests
import pandas as pd

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")
SEASON = 2026
DELAY = 0.35

# Conference group IDs
CONFERENCES = {
    2: "ACC",
    4: "Big East",
    7: "Big Ten",
    8: "Big 12",
    23: "SEC",
}

BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball"
STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/basketball/mens-college-basketball/standings"
GAMELOG_URL = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/mens-college-basketball/athletes"


def fetch_with_retry(url, retries=3, params=None):
    for attempt in range(retries):
        try:
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            time.sleep(DELAY)
            return resp.json()
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                raise


def fetch_teams():
    """Fetch all teams from the 5 target conferences via standings API."""
    print("Fetching teams from conferences...")
    teams = []

    for group_id, conf_name in CONFERENCES.items():
        print(f"  Fetching {conf_name} (group {group_id})...")
        data = fetch_with_retry(STANDINGS_URL, params={"group": group_id, "season": SEASON})

        entries = data.get("standings", {}).get("entries", [])
        for entry in entries:
            team = entry["team"]
            # Extract overall stats
            stats = {}
            for s in entry.get("stats", []):
                stats[s["name"]] = s.get("value")

            teams.append({
                "team_id": int(team["id"]),
                "team_name": team["displayName"],
                "abbreviation": team["abbreviation"],
                "conference": conf_name,
                "group_id": group_id,
                "avg_pts_for": stats.get("avgPointsFor"),
                "avg_pts_against": stats.get("avgPointsAgainst"),
                "wins": int(stats.get("wins", 0)),
                "losses": int(stats.get("losses", 0)),
            })

    df = pd.DataFrame(teams)
    df.to_csv(os.path.join(RAW_DIR, "teams.csv"), index=False)
    print(f"  Saved {len(df)} teams across {len(CONFERENCES)} conferences")
    return df


def fetch_rosters(teams_df):
    """Fetch rosters for all teams."""
    print("\nFetching rosters...")
    all_players = []
    total = len(teams_df)

    for i, (_, team) in enumerate(teams_df.iterrows()):
        tid = team["team_id"]
        print(f"  [{i+1}/{total}] {team['team_name']}...")
        try:
            data = fetch_with_retry(f"{BASE_URL}/teams/{tid}/roster")
            athletes = data.get("athletes", [])
            for a in athletes:
                exp = a.get("experience", {})
                all_players.append({
                    "player_id": int(a["id"]),
                    "player_name": a.get("displayName", a.get("fullName", "")),
                    "team_id": tid,
                    "team_name": team["team_name"],
                    "team_abbr": team["abbreviation"],
                    "conference": team["conference"],
                    "position": a.get("position", {}).get("abbreviation", ""),
                    "jersey": a.get("jersey", ""),
                    "class_year": exp.get("displayValue", ""),
                    "class_abbr": exp.get("abbreviation", ""),
                })
        except Exception as e:
            print(f"    Error: {e}")

    df = pd.DataFrame(all_players)
    df.to_csv(os.path.join(RAW_DIR, "rosters.csv"), index=False)
    print(f"  Saved {len(df)} players from {total} teams")
    return df


def fetch_game_logs(rosters_df):
    """Fetch game logs for all players."""
    print("\nFetching player game logs...")
    all_games = []
    player_ids = rosters_df["player_id"].unique()
    total = len(player_ids)
    skipped = 0
    errors = 0

    for i, pid in enumerate(player_ids):
        if (i + 1) % 50 == 0 or i == 0:
            print(f"  [{i+1}/{total}] Processing...")

        try:
            data = fetch_with_retry(
                f"{GAMELOG_URL}/{pid}/gamelog",
                params={"season": SEASON}
            )

            labels = data.get("labels", [])
            events_dict = data.get("events", {})
            season_types = data.get("seasonTypes", [])

            if not season_types:
                skipped += 1
                continue

            # Find PTS and MIN indices
            pts_idx = labels.index("PTS") if "PTS" in labels else None
            min_idx = labels.index("MIN") if "MIN" in labels else None
            fg_idx = labels.index("FG") if "FG" in labels else None
            tpt_idx = labels.index("3PT") if "3PT" in labels else None
            ft_idx = labels.index("FT") if "FT" in labels else None
            reb_idx = labels.index("REB") if "REB" in labels else None
            ast_idx = labels.index("AST") if "AST" in labels else None

            if pts_idx is None or min_idx is None:
                skipped += 1
                continue

            # Get regular season stats
            for st in season_types:
                if "Regular" not in st.get("displayName", ""):
                    # Only first category tends to be regular season anyway
                    pass
                for cat in st.get("categories", []):
                    for evt in cat.get("events", []):
                        event_id = evt["eventId"]
                        stats = evt["stats"]
                        event_info = events_dict.get(event_id, {})

                        # Parse minutes (could be "34" or "34:22")
                        min_val = stats[min_idx] if min_idx < len(stats) else "0"
                        try:
                            minutes = int(min_val.split(":")[0]) if ":" in str(min_val) else int(float(min_val))
                        except (ValueError, TypeError):
                            minutes = 0

                        pts_val = stats[pts_idx] if pts_idx < len(stats) else "0"
                        try:
                            points = int(float(pts_val))
                        except (ValueError, TypeError):
                            points = 0

                        opp = event_info.get("opponent", {})
                        game_date = event_info.get("gameDate", "")[:10]

                        # Build matchup string
                        at_vs = event_info.get("atVs", "vs")
                        opp_abbr = opp.get("abbreviation", "UNK")
                        player_info = rosters_df[rosters_df["player_id"] == pid].iloc[0]
                        team_abbr = player_info["team_abbr"]
                        matchup = f"{team_abbr} {at_vs} {opp_abbr}"

                        all_games.append({
                            "player_id": pid,
                            "game_id": event_id,
                            "date": game_date,
                            "opponent_id": int(opp.get("id", 0)),
                            "opponent_abbr": opp_abbr,
                            "matchup": matchup,
                            "result": event_info.get("gameResult", ""),
                            "min": minutes,
                            "pts": points,
                            "score": event_info.get("score", ""),
                        })

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"    Error for player {pid}: {e}")

    df = pd.DataFrame(all_games)
    df.to_csv(os.path.join(RAW_DIR, "game_logs.csv"), index=False)
    print(f"  Saved {len(df)} game log entries")
    print(f"  Skipped {skipped} players (no stats), {errors} errors")
    return df


def fetch_team_schedules(teams_df):
    """Fetch schedule/results for all teams to compute opponent strength."""
    print("\nFetching team schedules...")
    all_games = []
    total = len(teams_df)

    for i, (_, team) in enumerate(teams_df.iterrows()):
        tid = team["team_id"]
        if (i + 1) % 20 == 0 or i == 0:
            print(f"  [{i+1}/{total}] {team['team_name']}...")

        try:
            data = fetch_with_retry(
                f"{BASE_URL}/teams/{tid}/schedule",
                params={"season": SEASON}
            )

            for event in data.get("events", []):
                comps = event.get("competitions", [{}])
                if not comps:
                    continue
                comp = comps[0]
                competitors = comp.get("competitors", [])

                # Only completed games
                status = comp.get("status", {}).get("type", {}).get("name", "")
                if status != "STATUS_FINAL":
                    continue

                team_score = None
                opp_score = None
                opp_id = None

                for c in competitors:
                    c_id = int(c.get("team", {}).get("id", 0))
                    score = c.get("score", {})
                    score_val = score.get("value") if isinstance(score, dict) else score
                    try:
                        score_val = float(score_val)
                    except (TypeError, ValueError):
                        score_val = 0

                    if c_id == tid:
                        team_score = score_val
                    else:
                        opp_score = score_val
                        opp_id = c_id

                if team_score is not None and opp_score is not None:
                    all_games.append({
                        "team_id": tid,
                        "game_id": event["id"],
                        "date": event.get("date", "")[:10],
                        "opponent_id": opp_id,
                        "team_score": team_score,
                        "opp_score": opp_score,
                        "result": "W" if team_score > opp_score else "L",
                    })

        except Exception as e:
            print(f"    Error for {team['team_name']}: {e}")

    df = pd.DataFrame(all_games)
    df.to_csv(os.path.join(RAW_DIR, "team_schedules.csv"), index=False)
    print(f"  Saved {len(df)} team game entries")
    return df


def main():
    os.makedirs(RAW_DIR, exist_ok=True)
    print(f"Fetching NCAA data for {SEASON} season...\n")

    teams_df = fetch_teams()
    rosters_df = fetch_rosters(teams_df)
    fetch_game_logs(rosters_df)
    fetch_team_schedules(teams_df)

    print("\nAll data fetched successfully!")


if __name__ == "__main__":
    main()
