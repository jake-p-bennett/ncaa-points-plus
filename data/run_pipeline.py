"""Run the full data pipeline: fetch -> calculate -> generate JSON."""

import os
import shutil

from fetch_data import main as fetch_main
from calculate_points_plus import main as calc_main
from generate_json import main as gen_main


def copy_to_web():
    """Copy output data to web/public/data/."""
    src = os.path.join(os.path.dirname(__file__), "output")
    dst = os.path.join(os.path.dirname(__file__), "..", "web", "public", "data")

    if os.path.exists(dst):
        shutil.rmtree(dst)

    shutil.copytree(src, dst)
    print(f"\nCopied output to {dst}")


def main():
    print("=" * 50)
    print("NCAA Points+ Data Pipeline")
    print("=" * 50 + "\n")

    # Step 1: Fetch data
    fetch_main()
    print()

    # Step 2: Calculate Points+
    qualifying, game_logs_dict, league_avg = calc_main()
    print()

    # Step 3: Generate JSON
    gen_main(qualifying, game_logs_dict)

    # Step 4: Copy to web
    try:
        copy_to_web()
    except Exception as e:
        print(f"\nNote: Could not copy to web/ (may not exist yet): {e}")

    print("\n" + "=" * 50)
    print("Pipeline complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
