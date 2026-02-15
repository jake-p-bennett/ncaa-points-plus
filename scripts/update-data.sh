#!/bin/bash
# NCAA Points+ Data Update Script
# Fetches latest data from ESPN, recalculates Points+, and rebuilds the site.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"
WEB_DIR="$PROJECT_DIR/web"
LOG_FILE="$SCRIPT_DIR/update-data.log"

echo "$(date): Starting NCAA Points+ data update..." | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Pull latest changes
git pull origin main 2>&1 | tee -a "$LOG_FILE"

# Activate venv and run pipeline
cd "$DATA_DIR"
source venv/bin/activate

echo "$(date): Running data pipeline..." | tee -a "$LOG_FILE"
python run_pipeline.py 2>&1 | tee -a "$LOG_FILE"

# Check if data changed
cd "$PROJECT_DIR"
if git diff --quiet web/public/data/; then
    echo "$(date): No data changes detected." | tee -a "$LOG_FILE"
    exit 0
fi

# Commit and push
echo "$(date): Data changed, committing..." | tee -a "$LOG_FILE"
git add web/public/data/ data/output/
git commit -m "Update Points+ data ($(date +%Y-%m-%d))"
git push origin main

echo "$(date): Update complete!" | tee -a "$LOG_FILE"
