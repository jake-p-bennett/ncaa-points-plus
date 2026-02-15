#!/bin/bash
# NCAA Points+ Data Update Script
# Intended to be run by launchd on a daily schedule.

set -e

PROJECT_DIR="/Users/jacobbennett/Desktop/portfolio-projects/ncaa-dashboard"
PYTHON="$PROJECT_DIR/data/venv/bin/python3"
GIT="/opt/homebrew/bin/git"
LOG_FILE="$PROJECT_DIR/scripts/update-data.log"

# Log start
echo "=== Update started at $(date) ===" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Pull latest changes first
$GIT pull --ff-only >> "$LOG_FILE" 2>&1

# Run pipeline
echo "Running data pipeline..." >> "$LOG_FILE"
cd "$PROJECT_DIR/data"
$PYTHON run_pipeline.py >> "$LOG_FILE" 2>&1

# Commit and push if changed
cd "$PROJECT_DIR"
$GIT add web/public/data/ data/output/
if $GIT diff --staged --quiet; then
    echo "No data changes detected." >> "$LOG_FILE"
else
    $GIT commit -m "Update Points+ data ($(date +%Y-%m-%d))" >> "$LOG_FILE" 2>&1
    $GIT push >> "$LOG_FILE" 2>&1
    echo "Data pushed successfully." >> "$LOG_FILE"
fi

echo "=== Update finished at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
