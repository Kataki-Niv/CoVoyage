from datetime import datetime
from typing import List, Literal, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
    field_validator,
    model_validator,
)

from constants.interest_tags import INTEREST_TAGS


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TravelProfile(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    age: Optional[int] = Field(default=None, ge=18, le=120)
    gender: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)
    profile_picture_url: Optional[HttpUrl] = None
    travel_style: Optional[str] = Field(default=None, max_length=100)
    preferred_destinations: List[str] = Field(default_factory=list)
    budget_range: Optional[str] = Field(default=None, max_length=100)
    preferred_trip_duration: Optional[str] = Field(default=None, max_length=100)
    interests: List[str] = Field(default_factory=list)
    languages_spoken: List[str] = Field(default_factory=list)
    country: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    previously_visited_countries: List[str] = Field(default_factory=list)
    linkedin: Optional[HttpUrl] = None
    instagram: Optional[HttpUrl] = None
    personal_website: Optional[HttpUrl] = None


class TravelProfileUpsert(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    age: Optional[int] = Field(default=None, ge=18, le=120)
    gender: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)
    profile_picture_url: Optional[HttpUrl] = None
    travel_style: Optional[str] = Field(default=None, max_length=100)
    preferred_destinations: List[str] = Field(default_factory=list)
    budget_range: Optional[str] = Field(default=None, max_length=100)
    preferred_trip_duration: Optional[str] = Field(default=None, max_length=100)
    interests: List[str] = Field(default_factory=list)
    languages_spoken: List[str] = Field(default_factory=list)
    country: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    previously_visited_countries: List[str] = Field(default_factory=list)
    linkedin: Optional[HttpUrl] = None
    instagram: Optional[HttpUrl] = None
    personal_website: Optional[HttpUrl] = None

    @field_validator("interests")
    @classmethod
    def validate_interests(cls, interests: List[str]) -> List[str]:
        invalid_interests = sorted(set(interests) - set(INTEREST_TAGS))

        if invalid_interests:
            raise ValueError(
                f"Invalid interest tags: {', '.join(invalid_interests)}"
            )

        return interests


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
