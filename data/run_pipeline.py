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
    dst_tmp = dst + "_tmp"
    dst_old = dst + "_old"

    # Clean up any leftovers from a previous failed run
    for path in (dst_tmp, dst_old):
        if os.path.exists(path):
            shutil.rmtree(path)

    # Copy to a temp location first — live data is untouched until this succeeds
    shutil.copytree(src, dst_tmp)

    # Swap: move live data aside, promote the new copy, then delete the old
    if os.path.exists(dst):
        os.rename(dst, dst_old)
    os.rename(dst_tmp, dst)
    if os.path.exists(dst_old):
        shutil.rmtree(dst_old)

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
    copy_to_web()

    print("\n" + "=" * 50)
    print("Pipeline complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
