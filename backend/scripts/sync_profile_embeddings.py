from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import get_profiles_collection
from services.profile_embedding_sync import (
    ProfileEmbeddingSynchronizer,
    synchronize_profile_embedding,
)


def get_profile_label(profile: dict) -> str:
    name = str(profile.get("name") or "<unnamed>").strip()
    email = str(profile.get("email") or "<no email>").strip()
    user_id = str(profile.get("user_id") or "<missing user_id>").strip()
    return f"{name} ({email}, user_id={user_id})"


def has_valid_user_id(profile: dict) -> bool:
    return bool(str(profile.get("user_id") or "").strip())


def sync_profile_embeddings() -> dict[str, int]:
    profiles = get_profiles_collection()
    synchronizer = ProfileEmbeddingSynchronizer()
    total_profiles = profiles.count_documents({})
    synchronized_count = 0
    skipped_count = 0
    failed_count = 0

    print("Starting profile embedding synchronization")
    print(f"Total profiles found: {total_profiles}")

    for index, profile in enumerate(profiles.find({}), start=1):
        label = get_profile_label(profile)

        if not has_valid_user_id(profile):
            skipped_count += 1
            print(f"[{index}/{total_profiles}] SKIPPED {label}")
            continue

        print(f"[{index}/{total_profiles}] Syncing {label}")

        if synchronize_profile_embedding(profile, synchronizer=synchronizer):
            synchronized_count += 1
            print(f"[{index}/{total_profiles}] OK {label}")
        else:
            failed_count += 1
            print(f"[{index}/{total_profiles}] FAILED {label}")

    print()
    print(f"Total profiles found: {total_profiles}")
    print(f"Successfully synchronized: {synchronized_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Failed: {failed_count}")

    return {
        "total": total_profiles,
        "synchronized": synchronized_count,
        "skipped": skipped_count,
        "failed": failed_count,
    }


if __name__ == "__main__":
    summary = sync_profile_embeddings()
    raise SystemExit(1 if summary["failed"] else 0)
