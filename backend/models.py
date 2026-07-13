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
