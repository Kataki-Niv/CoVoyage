from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from scripts.seed_destination_data import print_seed_result, seed_destination_data


def seed_iceland_destination() -> dict:
    return seed_destination_data("iceland")


def main():
    result = seed_iceland_destination()
    print_seed_result(result)


if __name__ == "__main__":
    main()
