# NCAA Points+

An interactive web dashboard tracking **Points+**, a custom scoring efficiency metric for the 2025-26 season. Points+ measures a player's points per game relative to league average, adjusted for opponent defensive rating and pace — similar in concept to OPS+ or wRC+ in baseball.

- **100** = league average scorer
- **120** = 20% better than league average

**Live site:** [https://ncaa-points-plus.vercel.app](https://ncaa-points-plus.vercel.app)

This project mimics the [NBA Points+](https://github.com/jake-p-bennett/nba-points-plus) project, and calculates a 'league average' across qualifying players in the ACC, Big East, Big Ten, Big 12, and SEC.

---

## Features

- **Leaderboard** — Top qualifying players, sortable by rank, PPG, Points+, or volatility
- **Distribution chart** — Interactive histogram of Points+ across the league; click a bin to filter players
- **Player pages** — Per-player stats, game log chart, Points+ histogram, and volatility callout
- **Search** — Real-time player lookup

---

## How Points+ is Calculated

For each game, a player's raw points are adjusted for the opponent's defensive rating and pace:

```
adjusted_pts = raw_pts × (league_avg_def / opponent_def) × (league_avg_pace / opponent_pace)
```

Points+ is then the ratio of a player's adjusted PPG to the league-average adjusted PPG, scaled to 100:

```
Points+ = (adjusted_PPG / league_avg_adjusted_PPG) × 100
```

**Qualifying criteria:** ≥10 games played, ≥12 minutes per game.

Volatility measures the standard deviation of a player's game-by-game Points+ values.

Note that "league average" means we're treating the combination of five conferences as one league.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Data pipeline | Python, pandas, numpy, ESPN API (unofficial), requests |
| Automation | Bash + launchd |

---

## Running Locally

**Prerequisites:** Node.js, Python 3, pip

```bash
# Clone the repo
git clone git@github.com:jake-p-bennett/ncaa-points-plus.git
cd ncaa-points-plus

# Install frontend dependencies
cd web && npm install

# Start the dev server
npm run dev
# Visit http://localhost:3000
```

The `web/public/data/` directory contains pre-generated JSON that the frontend reads. No backend server is required to run the site.

### Updating Data

```bash
# From the project root
python3 data/fetch_data.py
python3 data/run_pipeline.py

# Copy output to the frontend
cp -r data/output/* web/public/data/
```

Data is automatically updated daily via a launchd job that runs `scripts/update-data.sh`, commits the new JSON, and pushes to GitHub.

---

## Project Structure

```
ncaa-points-plus/
├── web/                  # Next.js frontend
│   ├── src/
│   │   ├── app/          # Pages (home, player detail, about)
│   │   ├── components/   # React components
│   │   └── lib/          # Data loading, types, utilities
│   └── public/data/      # Generated JSON (leaderboard, players, metadata)
├── data/                 # Python data pipeline
│   ├── fetch_data.py     # Fetch from ESPN API
│   ├── calculate_points_plus.py  # Core metric calculation
│   └── generate_json.py  # Output JSON files
└── scripts/
    ├── update-data.sh    # Daily update script
    └── update-data-runner  # C executable for launchd
```
