from datetime import date, datetime
import re
from typing import Any, List, Literal, Optional
from urllib.parse import urlparse

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
    StrictInt,
    field_validator,
    model_validator,
)

from constants.interest_tags import INTEREST_TAGS
from services.account_identity import normalize_email_address


USERNAME_PATTERN = re.compile(r"^[a-z0-9_.]+$")
INSTAGRAM_HANDLE_PATTERN = re.compile(r"^@[A-Za-z0-9._]{1,30}$")

GENDER_VALUES = (
    "Female",
    "Male",
    "Non-binary",
    "Other",
    "Prefer not to say",
)
PREFERRED_TRAVEL_GENDER_VALUES = (
    "Anyone",
    "Female",
    "Male",
    "Non-binary",
)
TRAVEL_STYLE_VALUES = (
    "Adventure Travel",
    "Budget Travel",
    "City Break",
    "Cultural Travel",
    "Digital Nomad Travel",
    "Family Travel",
    "Luxury Travel",
    "Scenic Travel",
    "Slow Travel",
    "Solo Travel",
    "Wellness Travel",
)
BUDGET_RANGE_VALUES = (
    "Budget-friendly",
    "Mid-range",
    "Luxury",
)
TRIP_DURATION_VALUES = (
    "Weekend",
    "1 week",
    "10 days",
    "2 weeks",
    "1 month",
)
PROFILE_ENUM_OPTIONS = {
    "gender": list(GENDER_VALUES),
    "preferred_travel_gender": list(PREFERRED_TRAVEL_GENDER_VALUES),
    "travel_style": list(TRAVEL_STYLE_VALUES),
    "budget_range": list(BUDGET_RANGE_VALUES),
    "preferred_trip_duration": list(TRIP_DURATION_VALUES),
}


def dedupe_clean_text_list(value: Any) -> list[str]:
    if value is None:
        return []

    if not isinstance(value, list):
        raise ValueError("Enter a list of values")

    cleaned_values = []
    seen_values = set()

    for item in value:
        if not isinstance(item, str):
            raise ValueError("List values must be text")

        cleaned_item = item.strip()

        if not cleaned_item:
            continue

        if cleaned_item not in seen_values:
            cleaned_values.append(cleaned_item)
            seen_values.add(cleaned_item)

    return cleaned_values


def blank_string_to_none(value: Any) -> Any:
    if isinstance(value, str) and not value.strip():
        return None

    return value


def normalize_optional_text(value: Any) -> Any:
    if isinstance(value, str) and not value.strip():
        return None

    return value


def validate_supported_value(
    value: Optional[str],
    supported_values: tuple[str, ...],
    field_name: str,
) -> Optional[str]:
    if value is None:
        return None

    if value not in supported_values:
        raise ValueError(
            f"{field_name} must be one of: {', '.join(supported_values)}"
        )

    return value


def validate_name_characters(name: str) -> str:
    if not any(character.isalpha() for character in name):
        raise ValueError("Name must include at least one letter")

    if not all(character.isalpha() or character in " '-" for character in name):
        raise ValueError(
            "Name can only contain letters, spaces, apostrophes, and hyphens"
        )

    return name


def validate_username_format(username: str) -> str:
    normalized_username = username.strip().lower()

    if not normalized_username:
        raise ValueError("Username is required")

    if not USERNAME_PATTERN.fullmatch(normalized_username):
        raise ValueError(
            "Username can only contain lowercase letters, numbers, underscores, and dots"
        )

    if normalized_username[0] in "._" or normalized_username[-1] in "._":
        raise ValueError("Username cannot start or end with a dot or underscore")

    if ".." in normalized_username:
        raise ValueError("Username cannot contain consecutive dots")

    return normalized_username


def validate_https_url(url: HttpUrl, field_name: str) -> HttpUrl:
    if url.scheme != "https":
        raise ValueError(f"{field_name} must be an HTTPS URL")

    return url


def is_supported_host(hostname: Optional[str], allowed_hosts: set[str]) -> bool:
    if not hostname:
        return False

    normalized_hostname = hostname.lower()
    return any(
        normalized_hostname == allowed_host
        or normalized_hostname.endswith(f".{allowed_host}")
        for allowed_host in allowed_hosts
    )


def validate_instagram_value(instagram: Optional[str]) -> Optional[str]:
    if instagram is None:
        return None

    instagram = instagram.strip()

    if INSTAGRAM_HANDLE_PATTERN.fullmatch(instagram):
        return instagram

    parsed_url = urlparse(instagram)

    if parsed_url.scheme != "https" or not is_supported_host(
        parsed_url.hostname,
        {"instagram.com"},
    ):
        raise ValueError("Instagram must be an Instagram URL or @username")

    return instagram


class UserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, email: EmailStr) -> str:
        return normalize_email_address(str(email))


class UserLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_login_email(cls, email: str) -> str:
        normalized_email = normalize_email_address(email)

        if (
            "@" not in normalized_email
            or normalized_email.startswith("@")
            or normalized_email.endswith("@")
        ):
            raise ValueError("Enter the email address for this account")

        return normalized_email


class TravelProfileValidationBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("name", check_fields=False)
    @classmethod
    def validate_name(cls, name: str) -> str:
        return validate_name_characters(name)

    @field_validator("username", mode="before", check_fields=False)
    @classmethod
    def normalize_username(cls, username: str) -> str:
        if not isinstance(username, str):
            raise ValueError("Username is required")

        return validate_username_format(username)

    @field_validator(
        "gender",
        "preferred_travel_gender",
        "bio",
        "travel_style",
        "budget_range",
        "preferred_trip_duration",
        "country",
        "city",
        mode="before",
        check_fields=False,
    )
    @classmethod
    def normalize_optional_profile_text(cls, value: Any) -> Any:
        return normalize_optional_text(value)

    @field_validator("gender", check_fields=False)
    @classmethod
    def validate_gender(cls, gender: Optional[str]) -> Optional[str]:
        return validate_supported_value(gender, GENDER_VALUES, "Gender")

    @field_validator("preferred_travel_gender", check_fields=False)
    @classmethod
    def validate_preferred_travel_gender(
        cls,
        preferred_gender: Optional[str],
    ) -> Optional[str]:
        return validate_supported_value(
            preferred_gender,
            PREFERRED_TRAVEL_GENDER_VALUES,
            "Preferred travel gender",
        )

    @field_validator("travel_style", check_fields=False)
    @classmethod
    def validate_travel_style(cls, travel_style: Optional[str]) -> Optional[str]:
        return validate_supported_value(
            travel_style,
            TRAVEL_STYLE_VALUES,
            "Travel style",
        )

    @field_validator("budget_range", check_fields=False)
    @classmethod
    def validate_budget_range(cls, budget_range: Optional[str]) -> Optional[str]:
        return validate_supported_value(
            budget_range,
            BUDGET_RANGE_VALUES,
            "Budget",
        )

    @field_validator("preferred_trip_duration", check_fields=False)
    @classmethod
    def validate_preferred_trip_duration(
        cls,
        trip_duration: Optional[str],
    ) -> Optional[str]:
        return validate_supported_value(
            trip_duration,
            TRIP_DURATION_VALUES,
            "Trip duration",
        )

    @field_validator(
        "preferred_destinations",
        "interests",
        "languages_spoken",
        "previously_visited_countries",
        mode="before",
        check_fields=False,
    )
    @classmethod
    def normalize_text_list(cls, value: Any) -> list[str]:
        return dedupe_clean_text_list(value)

    @field_validator(
        "profile_picture_url",
        "linkedin",
        "personal_website",
        mode="before",
        check_fields=False,
    )
    @classmethod
    def normalize_optional_urls(cls, value: Any) -> Any:
        return blank_string_to_none(value)

    @field_validator("profile_picture_url", check_fields=False)
    @classmethod
    def validate_profile_picture_url(cls, url: Optional[HttpUrl]) -> Optional[HttpUrl]:
        if url is None:
            return None

        return validate_https_url(url, "Profile picture URL")

    @field_validator("linkedin", check_fields=False)
    @classmethod
    def validate_linkedin(cls, url: Optional[HttpUrl]) -> Optional[HttpUrl]:
        if url is None:
            return None

        validate_https_url(url, "LinkedIn")

        if not is_supported_host(urlparse(str(url)).hostname, {"linkedin.com"}):
            raise ValueError("LinkedIn must be a LinkedIn URL")

        return url

    @field_validator("instagram", mode="before", check_fields=False)
    @classmethod
    def normalize_instagram(cls, value: Any) -> Optional[str]:
        value = blank_string_to_none(value)

        if value is None:
            return None

        if not isinstance(value, str):
            raise ValueError("Instagram must be an Instagram URL or @username")

        return validate_instagram_value(value)

    @field_validator("personal_website", check_fields=False)
    @classmethod
    def validate_personal_website(cls, url: Optional[HttpUrl]) -> Optional[HttpUrl]:
        if url is None:
            return None

        return validate_https_url(url, "Personal website")

    @field_validator("interests", check_fields=False)
    @classmethod
    def validate_interests(cls, interests: List[str]) -> List[str]:
        if interests and len(interests) < 3:
            raise ValueError("Choose at least 3 interests")

        invalid_interests = sorted(set(interests) - set(INTEREST_TAGS))

        if invalid_interests:
            raise ValueError(
                f"Invalid interest tags: {', '.join(invalid_interests)}"
            )

        return interests

    @model_validator(mode="after")
    def validate_available_dates(self):
        if (
            self.available_from is not None
            and self.available_to is not None
            and self.available_to < self.available_from
        ):
            raise ValueError("available_to cannot be before available_from")

        return self


class TravelProfile(TravelProfileValidationBase):
    user_id: str = Field(..., min_length=1)
    tribe_discoverable: bool = False
    name: str = Field(..., min_length=2, max_length=60)
    username: str = Field(..., min_length=3, max_length=30)
    age: Optional[StrictInt] = Field(default=None, ge=18, le=100)
    gender: Optional[str] = Field(default=None, min_length=1, max_length=50)
    preferred_travel_gender: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    bio: Optional[str] = Field(default=None, min_length=20, max_length=500)
    profile_picture_url: Optional[HttpUrl] = None
    travel_style: Optional[str] = Field(default=None, min_length=1, max_length=100)
    preferred_destinations: List[str] = Field(default_factory=list, max_length=10)
    budget_range: Optional[str] = Field(default=None, min_length=1, max_length=100)
    preferred_trip_duration: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    interests: List[str] = Field(default_factory=list, max_length=15)
    languages_spoken: List[str] = Field(default_factory=list, max_length=10)
    country: Optional[str] = Field(default=None, min_length=1, max_length=100)
    city: Optional[str] = Field(default=None, min_length=2, max_length=80)
    previously_visited_countries: List[str] = Field(default_factory=list)
    linkedin: Optional[HttpUrl] = None
    instagram: Optional[str] = Field(default=None, max_length=120)
    personal_website: Optional[HttpUrl] = None


class TravelProfileUpsert(TravelProfileValidationBase):
    tribe_discoverable: bool = False
    name: str = Field(..., min_length=2, max_length=60)
    username: str = Field(..., min_length=3, max_length=30)
    age: Optional[StrictInt] = Field(default=None, ge=18, le=100)
    gender: Optional[str] = Field(default=None, min_length=1, max_length=50)
    preferred_travel_gender: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    bio: Optional[str] = Field(default=None, min_length=20, max_length=500)
    profile_picture_url: Optional[HttpUrl] = None
    travel_style: Optional[str] = Field(default=None, min_length=1, max_length=100)
    preferred_destinations: List[str] = Field(default_factory=list, max_length=10)
    budget_range: Optional[str] = Field(default=None, min_length=1, max_length=100)
    preferred_trip_duration: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    interests: List[str] = Field(default_factory=list, max_length=15)
    languages_spoken: List[str] = Field(default_factory=list, max_length=10)
    country: Optional[str] = Field(default=None, min_length=1, max_length=100)
    city: Optional[str] = Field(default=None, min_length=2, max_length=80)
    previously_visited_countries: List[str] = Field(default_factory=list)
    linkedin: Optional[HttpUrl] = None
    instagram: Optional[str] = Field(default=None, max_length=120)
    personal_website: Optional[HttpUrl] = None


class MatchBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: str = Field(..., min_length=1)
    matched_user_id: str = Field(..., min_length=1)
    status: Literal["pending", "accepted", "dismissed"] = "pending"
    compatibility_score: Optional[float] = Field(default=None, ge=0, le=100)
    reason: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MatchCreate(MatchBase):
    pass


class Match(MatchBase):
    id: Optional[str] = None


class TribeDiscoverabilityUpdate(BaseModel):
    tribe_discoverable: bool


class TripBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1, max_length=150)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_range: Optional[str] = Field(default=None, max_length=100)
    travel_style: Optional[str] = Field(default=None, max_length=100)
    interests: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("interests")
    @classmethod
    def validate_trip_interests(cls, interests: List[str]) -> List[str]:
        invalid_interests = sorted(set(interests) - set(INTEREST_TAGS))

        if invalid_interests:
            raise ValueError(
                f"Invalid interest tags: {', '.join(invalid_interests)}"
            )

        return interests


class TripCreate(TripBase):
    pass


class Trip(TripBase):
    id: Optional[str] = None


class ChatMessage(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    sender_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    participant_ids: List[str] = Field(..., min_length=2)
    match_id: Optional[str] = Field(default=None, min_length=1)
    trip_id: Optional[str] = Field(default=None, min_length=1)
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatCreate(ChatBase):
    pass


class Chat(ChatBase):
    id: Optional[str] = None


DESTINATION_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def validate_destination_slug(value: str, field_name: str = "Slug") -> str:
    normalized_value = value.strip().lower()

    if not DESTINATION_SLUG_PATTERN.fullmatch(normalized_value):
        raise ValueError(
            f"{field_name} must contain lowercase letters, numbers, and hyphens"
        )

    return normalized_value


class DestinationSourceMetadata(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    source_name: str = Field(..., min_length=1, max_length=160)
    source_url: Optional[HttpUrl] = None
    source_type: Optional[str] = Field(default=None, max_length=80)
    retrieved_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    confidence: Optional[float] = Field(default=None, ge=0, le=1)
    verification_status: Literal[
        "unverified",
        "source-recorded",
        "verified",
        "needs-review",
    ] = "unverified"
    notes: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_validity_window(self):
        if (
            self.valid_from is not None
            and self.valid_to is not None
            and self.valid_to < self.valid_from
        ):
            raise ValueError("valid_to cannot be before valid_from")

        return self


class DestinationCurrency(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=3, max_length=3)

    @field_validator("code")
    @classmethod
    def normalize_currency_code(cls, code: str) -> str:
        return code.strip().upper()


class DestinationMedia(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    url: HttpUrl
    alt: Optional[str] = Field(default=None, min_length=1, max_length=240)
    alt_text: Optional[str] = Field(default=None, min_length=1, max_length=240)
    credit: Optional[str] = Field(default=None, max_length=160)
    source: Optional[DestinationSourceMetadata] = None

    @model_validator(mode="after")
    def normalize_alt_text(self):
        if self.alt is None and self.alt_text is None:
            raise ValueError("Media requires alt_text")

        if self.alt_text is None:
            self.alt_text = self.alt

        if self.alt is None:
            self.alt = self.alt_text

        return self


class DestinationTextNote(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=120)
    body: str = Field(..., min_length=1, max_length=2000)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)


class DestinationLocalPhrase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    english: str = Field(..., min_length=1, max_length=80)
    local: str = Field(..., min_length=1, max_length=120)
    pronunciation: Optional[str] = Field(default=None, max_length=120)
    usage_note: Optional[str] = Field(default=None, max_length=300)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)


class DestinationLocalInsight(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1, max_length=1200)
    category: str = Field(..., min_length=1, max_length=80)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)


class DestinationCountryBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    slug: str = Field(..., min_length=2, max_length=80)
    name: str = Field(..., min_length=1, max_length=120)
    country_code: Optional[str] = Field(default=None, min_length=2, max_length=3)
    flag: Optional[str] = Field(default=None, max_length=16)
    region: Optional[str] = Field(default=None, max_length=120)
    currency: Optional[DestinationCurrency] = None
    languages: List[str] = Field(default_factory=list, max_length=20)
    timezone: Optional[str] = Field(default=None, max_length=120)
    emergency_numbers: List[str] = Field(default_factory=list, max_length=12)
    visa_entry_summary: Optional[DestinationTextNote] = None
    travel_styles: List[str] = Field(default_factory=list, max_length=20)
    hero_media: Optional[DestinationMedia] = None
    featured_category: Optional[str] = Field(default=None, max_length=120)
    journey_title: Optional[str] = Field(default=None, max_length=160)
    journey_intro: Optional[str] = Field(default=None, max_length=800)
    overview: Optional[str] = Field(default=None, max_length=3000)
    culture_notes: List[DestinationTextNote] = Field(default_factory=list)
    etiquette_notes: List[DestinationTextNote] = Field(default_factory=list)
    communication_notes: List[DestinationTextNote] = Field(default_factory=list)
    common_visitor_mistakes: List[DestinationTextNote] = Field(default_factory=list)
    local_insights: List[DestinationLocalInsight] = Field(default_factory=list)
    local_phrases: List[DestinationLocalPhrase] = Field(default_factory=list)
    practical_notes: List[DestinationTextNote] = Field(default_factory=list)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, slug: str) -> str:
        return validate_destination_slug(slug)

    @field_validator("country_code")
    @classmethod
    def normalize_country_code(cls, country_code: Optional[str]) -> Optional[str]:
        if country_code is None:
            return None

        return country_code.strip().upper()


class DestinationCountryCreate(DestinationCountryBase):
    pass


class DestinationCountry(DestinationCountryBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DestinationPlaceBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    slug: str = Field(..., min_length=2, max_length=100)
    country_slug: str = Field(..., min_length=2, max_length=80)
    name: str = Field(..., min_length=1, max_length=160)
    region: Optional[str] = Field(default=None, max_length=160)
    type: Optional[str] = Field(default=None, max_length=100)
    story: Optional[str] = Field(default=None, max_length=3000)
    description: Optional[str] = Field(default=None, max_length=3000)
    media: List[DestinationMedia] = Field(default_factory=list)
    highlights: List[str] = Field(default_factory=list, max_length=30)
    tags: List[str] = Field(default_factory=list, max_length=30)
    why_visit: Optional[str] = Field(default=None, max_length=1200)
    time_required: Optional[str] = Field(default=None, max_length=120)
    activities: List[str] = Field(default_factory=list, max_length=30)
    local_experience: Optional[str] = Field(default=None, max_length=1200)
    access_notes: List[DestinationTextNote] = Field(default_factory=list)
    local_vibe_notes: List[str] = Field(default_factory=list, max_length=20)
    safety_warnings: List[DestinationTextNote] = Field(default_factory=list)
    seasonal_warnings: List[DestinationTextNote] = Field(default_factory=list)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)

    @field_validator("slug", "country_slug")
    @classmethod
    def normalize_slugs(cls, slug: str) -> str:
        return validate_destination_slug(slug)


class DestinationPlaceCreate(DestinationPlaceBase):
    pass


class DestinationPlace(DestinationPlaceBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WeatherClimateInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    summary: Optional[str] = Field(default=None, max_length=1200)
    temperature_range: Optional[str] = Field(default=None, max_length=120)
    rainfall_summary: Optional[str] = Field(default=None, max_length=500)
    daylight_summary: Optional[str] = Field(default=None, max_length=500)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)


class DestinationMonthlyFactorsBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    year: StrictInt = Field(..., ge=2000, le=2100)
    month: StrictInt = Field(..., ge=1, le=12)
    country_slug: str = Field(..., min_length=2, max_length=80)
    place_slug: Optional[str] = Field(default=None, min_length=2, max_length=100)
    weather_climate: Optional[WeatherClimateInput] = None
    weather_suitability_input: Optional[str] = Field(default=None, max_length=1200)
    daylight_information: Optional[str] = Field(default=None, max_length=800)
    seasonal_conditions: List[DestinationTextNote] = Field(default_factory=list)
    seasonal_highlights: List[str] = Field(default_factory=list, max_length=30)
    accessibility_information: Optional[str] = Field(default=None, max_length=1200)
    seasonal_activities: List[str] = Field(default_factory=list, max_length=30)
    event_activity_density_input: Optional[str] = Field(default=None, max_length=800)
    affordability_value_input: Optional[str] = Field(default=None, max_length=800)
    travel_conditions: List[DestinationTextNote] = Field(default_factory=list)
    seasonal_warnings: List[DestinationTextNote] = Field(default_factory=list)
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)

    @field_validator("country_slug", "place_slug")
    @classmethod
    def normalize_optional_slugs(cls, slug: Optional[str]) -> Optional[str]:
        if slug is None:
            return None

        return validate_destination_slug(slug)


class DestinationMonthlyFactorsCreate(DestinationMonthlyFactorsBase):
    pass


class DestinationMonthlyFactors(DestinationMonthlyFactorsBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MonthlySnapshotPlace(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    place_slug: str = Field(..., min_length=2, max_length=100)
    place_name: Optional[str] = Field(default=None, max_length=160)
    rank: StrictInt = Field(..., ge=1)
    score: float = Field(..., ge=0, le=100)
    recommendation_reason: str = Field(..., min_length=1, max_length=1200)
    score_breakdown: dict[str, float] = Field(default_factory=dict)

    @field_validator("place_slug")
    @classmethod
    def normalize_place_slug(cls, slug: str) -> str:
        return validate_destination_slug(slug, "Place slug")


class MonthlySnapshotCountry(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    country_slug: str = Field(..., min_length=2, max_length=80)
    country_name: Optional[str] = Field(default=None, max_length=120)
    rank: StrictInt = Field(..., ge=1)
    final_score: float = Field(..., ge=0, le=100)
    recommendation_reason: str = Field(..., min_length=1, max_length=1200)
    score_breakdown: dict[str, float] = Field(default_factory=dict)
    selected_places: List[MonthlySnapshotPlace] = Field(default_factory=list)

    @field_validator("country_slug")
    @classmethod
    def normalize_country_slug(cls, slug: str) -> str:
        return validate_destination_slug(slug, "Country slug")


class MonthlySnapshotBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    year: StrictInt = Field(..., ge=2000, le=2100)
    month: StrictInt = Field(..., ge=1, le=12)
    algorithm_version: str = Field(..., min_length=1, max_length=80)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["draft", "generated", "published", "active", "archived"] = "draft"
    featured_countries: List[MonthlySnapshotCountry] = Field(default_factory=list)


class MonthlySnapshotCreate(MonthlySnapshotBase):
    pass


class MonthlySnapshot(MonthlySnapshotBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MonthlySnapshotGenerateRequest(BaseModel):
    year: StrictInt = Field(..., ge=2000, le=2100)
    month: StrictInt = Field(..., ge=1, le=12)


class CommunityAuthor(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=80)
    role: Optional[str] = Field(default=None, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)


class CommunityTipBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    country_slug: str = Field(..., min_length=2, max_length=80)
    place_slug: str = Field(..., min_length=2, max_length=100)
    text: str = Field(..., min_length=3, max_length=1200)
    author: CommunityAuthor
    rating: Optional[float] = Field(default=None, ge=0, le=5)

    @field_validator("country_slug", "place_slug")
    @classmethod
    def normalize_community_slugs(cls, slug: str) -> str:
        return validate_destination_slug(slug)


class CommunityTipCreate(CommunityTipBase):
    pass


class CommunityTip(CommunityTipBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    moderation_status: Literal["pending", "approved", "rejected"] = "approved"
    helpful_count: StrictInt = Field(default=0, ge=0)


class CommunityReplyBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    text: str = Field(..., min_length=1, max_length=1000)
    author: CommunityAuthor


class CommunityReplyCreate(CommunityReplyBase):
    pass


class CommunityReply(CommunityReplyBase):
    id: Optional[str] = None
    tip_id: str = Field(..., min_length=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DestinationEventBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=160)
    category: str = Field(..., min_length=1, max_length=80)
    country_slug: str = Field(..., min_length=2, max_length=80)
    place_slug: Optional[str] = Field(default=None, min_length=2, max_length=100)
    date_start: date
    date_end: Optional[date] = None
    location: str = Field(..., min_length=1, max_length=160)
    description: str = Field(..., min_length=1, max_length=1200)
    media: Optional[DestinationMedia] = None
    sources: List[DestinationSourceMetadata] = Field(default_factory=list)
    verification_status: Literal[
        "unverified",
        "source-recorded",
        "verified",
        "needs-review",
    ] = "verified"

    @field_validator("country_slug", "place_slug")
    @classmethod
    def normalize_event_slugs(cls, slug: Optional[str]) -> Optional[str]:
        if slug is None:
            return None

        return validate_destination_slug(slug)

    @model_validator(mode="after")
    def validate_event_dates(self):
        if self.date_end is not None and self.date_end < self.date_start:
            raise ValueError("date_end cannot be before date_start")

        return self


class DestinationEventCreate(DestinationEventBase):
    pass


class DestinationEvent(DestinationEventBase):
    id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BlogBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=3, max_length=160)
    content: str = Field(..., min_length=20, max_length=50000)
    excerpt: Optional[str] = Field(default=None, max_length=300)
    tags: List[str] = Field(default_factory=list, max_length=12)
    cover_image_url: Optional[HttpUrl] = None
    status: Literal["draft", "published"] = "draft"

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, tags: List[str]) -> List[str]:
        cleaned_tags = []

        for tag in tags:
            cleaned_tag = tag.strip()

            if not cleaned_tag:
                continue

            if len(cleaned_tag) > 40:
                raise ValueError("Blog tags must be 40 characters or fewer")

            cleaned_tags.append(cleaned_tag)

        return list(dict.fromkeys(cleaned_tags))


class BlogCreate(BlogBase):
    slug: Optional[str] = Field(default=None, min_length=3, max_length=120)


class BlogUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(default=None, min_length=3, max_length=160)
    content: Optional[str] = Field(default=None, min_length=20, max_length=50000)
    excerpt: Optional[str] = Field(default=None, max_length=300)
    tags: Optional[List[str]] = Field(default=None, max_length=12)
    cover_image_url: Optional[HttpUrl] = None
    status: Optional[Literal["draft", "published"]] = None
    slug: Optional[str] = Field(default=None, min_length=3, max_length=120)

    @field_validator("tags")
    @classmethod
    def validate_update_tags(cls, tags: Optional[List[str]]) -> Optional[List[str]]:
        if tags is None:
            return tags

        return BlogBase.validate_tags(tags)

    @model_validator(mode="after")
    def require_update_field(self):
        if not self.model_dump(exclude_none=True):
            raise ValueError("At least one blog field must be provided")

        return self


class Blog(BlogBase):
    id: str
    slug: str
    author_id: str
    author_name: str
    author_email: EmailStr
    created_at: datetime
    updated_at: datetime
