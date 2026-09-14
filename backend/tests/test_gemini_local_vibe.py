import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import routers.assistant as assistant_router
from services.gemini_local_vibe import (
    call_gemini_interaction_with_metadata,
    GeminiConfigurationError,
    GeminiItineraryResponse,
    GeminiResponseError,
    build_chat_prompt,
    build_local_vibe_context,
    extract_output_text,
    validate_itinerary_places,
)
from services.rate_limiter import _requests_by_key


def test_request():
    return SimpleNamespace(client=SimpleNamespace(host="test-client"))


class LocalVibeGeminiTests(unittest.TestCase):
    def setUp(self):
        _requests_by_key.clear()

    def test_prompt_includes_destination_context_and_grounding(self):
        destination_context = {
            "country": {
                "slug": "japan",
                "name": "Japan",
                "culture_notes": [{"title": "Quiet transit", "body": "Keep calls off trains."}],
                "etiquette_notes": [{"title": "Queueing", "body": "Queue carefully."}],
                "local_phrases": [{"english": "Thank you", "local": "Arigato"}],
            },
            "monthly_factor": {
                "weather_suitability_input": "September shoulder-season city walks.",
            },
        }
        places = [
            {
                "place_slug": "tokyo",
                "place_name": "Tokyo",
                "recommendation_reason": "Strong food and neighborhood rhythm.",
            }
        ]

        context = build_local_vibe_context(
            destination_context,
            places,
            year=2026,
            month=9,
            month_label="September",
        )
        prompt = build_chat_prompt(context, "What etiquette should I know?")

        self.assertIn("CoVoyage destination context", prompt)
        self.assertIn("Japan", prompt)
        self.assertIn("Tokyo", prompt)
        self.assertIn("Do not invent destination-specific facts", prompt)

    def test_response_parser_reads_generate_content_candidates(self):
        payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": "Use quiet voices on trains.",
                            }
                        ]
                    }
                }
            ]
        }

        self.assertEqual(
            extract_output_text(payload),
            "Use quiet voices on trains.",
        )

    def test_response_parser_rejects_empty_payload(self):
        with self.assertRaises(GeminiResponseError):
            extract_output_text({"candidates": [{"content": {"parts": []}}]})

    def test_chat_route_marks_success_as_gemini(self):
        request = assistant_router.LocalVibeChatRequest(
            country_slug="japan",
            country="Japan",
            message="One etiquette tip?",
        )

        with patch.object(
            assistant_router,
            "generate_chat_message",
            return_value="Queue carefully and keep train calls quiet.",
        ):
            response = assistant_router.local_vibe_chat(request, test_request())

        self.assertEqual(response["response_source"], "gemini")
        self.assertEqual(response["country_slug"], "japan")
        self.assertEqual(response["country"], "Japan")
        self.assertTrue(response["recommended_places"])

    def test_chat_route_falls_back_when_gemini_fails(self):
        request = assistant_router.LocalVibeChatRequest(
            country_slug="japan",
            country="Japan",
            message="What should I pack?",
        )

        with patch.object(
            assistant_router,
            "generate_chat_message",
            side_effect=GeminiConfigurationError("missing key"),
        ):
            response = assistant_router.local_vibe_chat(request, test_request())

        self.assertEqual(response["response_source"], "fallback")
        self.assertIn("Japan", response["message"])

    def test_invalid_destination_is_rejected(self):
        request = assistant_router.LocalVibeChatRequest(
            country_slug="not-a-country",
            country="Not A Country",
            message="Hello",
        )

        with self.assertRaises(HTTPException) as raised:
            assistant_router.local_vibe_chat(request, test_request())

        self.assertEqual(raised.exception.status_code, 404)

    def test_itinerary_validation_rejects_places_outside_context(self):
        itinerary = GeminiItineraryResponse.model_validate(
            {
                "summary": "A short trip.",
                "itinerary": [
                    {
                        "day": 1,
                        "place": "Tokyo",
                        "focus": "Food",
                        "morning": "Walk around a neighborhood.",
                        "afternoon": "Visit a market.",
                        "evening": "Eat locally.",
                        "local_vibe_note": "Keep the pace calm.",
                    },
                    {
                        "day": 2,
                        "place": "Paris",
                        "focus": "Museums",
                        "morning": "Go somewhere else.",
                        "afternoon": "Keep going.",
                        "evening": "Finish.",
                        "local_vibe_note": "Outside context.",
                    },
                ],
            }
        )

        with self.assertRaises(GeminiResponseError):
            validate_itinerary_places(
                itinerary,
                [{"slug": "tokyo", "name": "Tokyo"}],
                expected_days=2,
            )

    def test_gemini_http_request_parses_json_text(self):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = json.dumps(
            {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": "Grounded Gemini answer."}],
                        }
                    }
                ]
            }
        ).encode("utf-8")

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}), patch(
            "urllib.request.urlopen",
            return_value=response,
        ):
            result = call_gemini_interaction_with_metadata(
                prompt="Test prompt",
            )

        self.assertEqual(result.text, "Grounded Gemini answer.")
        self.assertEqual(result.model, "gemini-2.5-flash")
        self.assertEqual(result.attempts, 1)

    def test_assistant_rate_limit_uses_existing_limiter(self):
        request = assistant_router.LocalVibeDiscoveryChatRequest(message="Where next?")

        with patch.object(
            assistant_router,
            "LOCAL_VIBE_DISCOVERY_CHAT_RATE_LIMIT",
            1,
        ), patch.object(
            assistant_router,
            "generate_discovery_chat_message",
            return_value="Try Italy this month.",
        ):
            assistant_router.local_vibe_discovery_chat(request, test_request())

            with self.assertRaises(HTTPException) as raised:
                assistant_router.local_vibe_discovery_chat(request, test_request())

        self.assertEqual(raised.exception.status_code, 429)


if __name__ == "__main__":
    unittest.main()
