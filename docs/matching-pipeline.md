# Matching Pipeline

Phase 2 matching is computed on demand by the backend `GET /matches` endpoint.

## Pipeline

1. Filter by overlapping travel dates.
   Travelers must have valid `available_from` and `available_to` values, and their date ranges must overlap. If two travelers have no overlapping dates, they are not eligible for matching, regardless of compatibility score.

2. Filter by preferred travel gender.
   If either traveler has selected a specific preferred gender to travel with, the other traveler must match that preference. A preference of `Anyone` does not filter candidates.

3. Compute compatibility score for the remaining travelers.
   Eligible travelers are scored across destination overlap, shared interests, travel style, budget range, overlapping dates, preferred trip duration, and shared languages.

4. Sort by descending compatibility.
   Higher scoring travelers appear first.

5. Return the top matches.
   The backend returns the top eligible matches above the configured minimum score.

## Refresh Matches

The Refresh Matches button is a manual re-sync control. It sends a new authenticated request to `GET /matches`; the backend then re-runs the matching pipeline against the latest saved profiles and returns a freshly sorted result set.

This is useful after profile changes or future live-data updates. It is not a separate cache clear operation.
