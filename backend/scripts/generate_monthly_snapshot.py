from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from services.destination_snapshot_service import publish_monthly_snapshot


def parse_year_month(arguments: list[str]) -> tuple[int, int]:
    if len(arguments) != 2:
        raise ValueError("Usage: python scripts/generate_monthly_snapshot.py <year> <month>")

    year = int(arguments[0])
    month = int(arguments[1])

    if month < 1 or month > 12:
        raise ValueError("month must be between 1 and 12")

    return year, month


def main():
    year, month = parse_year_month(sys.argv[1:])
    result = publish_monthly_snapshot(year, month)
    snapshot = result["snapshot"]

    print("Monthly snapshot generation completed")
    print(
        f"Snapshot: {snapshot['year']}-{snapshot['month']:02d} "
        f"algorithm={snapshot['algorithm_version']} "
        f"status={snapshot['status']} "
        f"upserted={result['upserted']} modified={result['modified_count']} "
        f"archived={result['archived_count']}"
    )
    print(f"Featured countries: {len(snapshot['featured_countries'])}")

    for country in snapshot["featured_countries"]:
        print(
            f"{country['rank']}. {country.get('country_name') or country['country_slug']} "
            f"score={country['final_score']} places={len(country['selected_places'])}"
        )

        for place in country["selected_places"]:
            print(
                f"   {place['rank']}. {place.get('place_name') or place['place_slug']} "
                f"score={place['score']}"
            )


if __name__ == "__main__":
    main()
