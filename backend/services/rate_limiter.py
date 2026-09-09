from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import HTTPException, status


_requests_by_key: dict[str, Deque[float]] = defaultdict(deque)


def enforce_rate_limit(
    bucket: str,
    actor_key: str,
    *,
    limit: int,
    window_seconds: int,
) -> None:
    if limit <= 0 or window_seconds <= 0:
        return

    now = time.monotonic()
    rate_limit_key = f"{bucket}:{actor_key}"
    timestamps = _requests_by_key[rate_limit_key]
    window_start = now - window_seconds

    while timestamps and timestamps[0] <= window_start:
        timestamps.popleft()

    if len(timestamps) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait before trying again.",
        )

    timestamps.append(now)
