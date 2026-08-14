from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from data.iceland import get_iceland_seed_dataset, validate_iceland_seed_dataset


SCORING_FIELDS = {
    "final_score",
    "rank",
    "score",
    "score_breakdown",
    "recommendation_reason",
    "algorithm_version",
    "featured_countries",
}


def find_forbidden_fields(value, path="dataset"):
    matches = []

    if isinstance(value, dict):
        for key, nested_value in value.items():
            nested_path = f"{path}.{key}"

            if key in SCORING_FIELDS:
                matches.append(nested_path)

            matches.extend(find_forbidden_fields(nested_value, nested_path))

    if isinstance(value, list):
        for index, nested_value in enumerate(value):
            matches.extend(find_forbidden_fields(nested_value, f"{path}[{index}]"))

    return matches


def main():
    dataset = get_iceland_seed_dataset()
    summary = validate_iceland_seed_dataset()
    forbidden_fields = find_forbidden_fields(dataset)

    if forbidden_fields:
        raise ValueError(f"Scoring/recommendation fields found: {forbidden_fields}")

    print("Iceland destination dataset validation passed")
    print(f"Country: {summary['country_slug']}")
    print(f"Places: {', '.join(summary['place_slugs'])}")
    print(
        "Monthly factors: "
        + ", ".join(
            f"{monthly_factor['year']}-{monthly_factor['month']:02d}"
            for monthly_factor in summary["monthly_factors"]
        )
    )


if __name__ == "__main__":
    main()
