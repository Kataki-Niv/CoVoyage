import re
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.errors import DuplicateKeyError

from database import get_blogs_collection
from dependencies import get_current_user
from models import Blog, BlogCreate, BlogUpdate, JournalMediaUpload, JournalMediaUploadResponse
from services.destination_recommendations import load_destination_records
from services.profile_media import save_journal_media


router = APIRouter(prefix="/blogs", tags=["blogs"])


def get_blogs_or_503():
    try:
        return get_blogs_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def serialize_blog(blog) -> Blog:
    journal_format = blog.get("format")

    if journal_format is None:
        if blog.get("category") == "photos":
            journal_format = "photo"
        elif blog.get("category") == "videos":
            journal_format = "video"
        else:
            journal_format = "text"

    return Blog(
        id=str(blog["_id"]),
        title=blog["title"],
        content=blog["content"],
        excerpt=blog.get("excerpt"),
        tags=blog.get("tags", []),
        category=blog.get("category"),
        format=journal_format,
        destination_slug=blog.get("destination_slug"),
        destination_name=blog.get("destination_name"),
        cover_image_url=blog.get("cover_image_url"),
        media_url=blog.get("media_url"),
        status=blog.get("status", "draft"),
        slug=blog["slug"],
        author_id=blog["author_id"],
        author_name=blog["author_name"],
        author_email=blog["author_email"],
        created_at=blog["created_at"],
        updated_at=blog["updated_at"],
    )


def parse_blog_id(blog_id: str) -> ObjectId:
    if not ObjectId.is_valid(blog_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID",
        )

    return ObjectId(blog_id)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "blog"


def generate_unique_slug(blogs, base_slug: str) -> str:
    slug = slugify(base_slug)
    candidate = slug
    suffix = 2

    while blogs.find_one({"slug": candidate}):
        candidate = f"{slug}-{suffix}"
        suffix += 1

    return candidate


def get_destination_name_or_404(destination_slug: str) -> str:
    countries, _places_by_country, _factors_by_country_place = load_destination_records()
    destination = countries.get(destination_slug)

    if destination is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Destination is not supported",
        )

    return destination.get("name") or destination_slug


def apply_destination_fields(blog_document: dict):
    if "destination_slug" not in blog_document:
        return

    destination_slug = blog_document.get("destination_slug")

    if destination_slug is None:
        blog_document["destination_name"] = None
        return

    blog_document["destination_name"] = get_destination_name_or_404(destination_slug)


def get_blog_or_404(blogs, blog_id: str):
    blog = blogs.find_one({"_id": parse_blog_id(blog_id)})

    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    return blog


def get_published_blog_by_slug_or_404(blogs, slug: str):
    blog = blogs.find_one({"slug": slug, "status": "published"})

    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    return blog


def get_published_blog_by_id_or_404(blogs, blog_id: str):
    blog = blogs.find_one({"_id": parse_blog_id(blog_id), "status": "published"})

    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    return blog


def ensure_author(blog, current_user):
    if blog["author_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own blogs",
        )


@router.post("", response_model=Blog, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_data: BlogCreate,
    current_user=Depends(get_current_user),
):
    blogs = get_blogs_or_503()
    now = datetime.utcnow()
    blog_document = blog_data.model_dump(mode="json", exclude_none=True)
    blog_document["slug"] = generate_unique_slug(
        blogs,
        blog_document.get("slug") or blog_document["title"],
    )
    apply_destination_fields(blog_document)
    blog_document["author_id"] = str(current_user["_id"])
    blog_document["author_name"] = current_user.get("name") or "CoVoyage Traveler"
    blog_document["author_email"] = current_user["email"]
    blog_document["created_at"] = now
    blog_document["updated_at"] = now

    try:
        result = blogs.insert_one(blog_document)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blog slug already exists",
        ) from error

    created_blog = blogs.find_one({"_id": result.inserted_id})
    return serialize_blog(created_blog)


@router.get("", response_model=list[Blog])
def get_blogs():
    blogs = get_blogs_or_503()

    return [
        serialize_blog(blog)
        for blog in blogs.find({"status": "published"}).sort("created_at", -1)
    ]


@router.get("/me", response_model=list[Blog])
def get_my_blogs(current_user=Depends(get_current_user)):
    blogs = get_blogs_or_503()
    return [
        serialize_blog(blog)
        for blog in blogs.find({"author_id": str(current_user["_id"])}).sort(
            "updated_at",
            -1,
        )
    ]


@router.post("/media", response_model=JournalMediaUploadResponse)
def upload_journal_media(
    upload: JournalMediaUpload,
    current_user=Depends(get_current_user),
):
    return {
        "media_url": save_journal_media(
            str(current_user["_id"]),
            upload.media_kind,
            upload.content_type,
            upload.content_base64,
        ),
    }


@router.get("/slug/{slug}", response_model=Blog)
def get_published_blog_by_slug(slug: str):
    blogs = get_blogs_or_503()
    return serialize_blog(get_published_blog_by_slug_or_404(blogs, slug))


@router.get("/{blog_id}", response_model=Blog)
def get_blog(blog_id: str):
    blogs = get_blogs_or_503()
    return serialize_blog(get_published_blog_by_id_or_404(blogs, blog_id))


@router.put("/{blog_id}", response_model=Blog)
def update_blog(
    blog_id: str,
    blog_data: BlogUpdate,
    current_user=Depends(get_current_user),
):
    blogs = get_blogs_or_503()
    existing_blog = get_blog_or_404(blogs, blog_id)
    ensure_author(existing_blog, current_user)

    update_document = blog_data.model_dump(
        mode="json",
        exclude_unset=True,
    )
    apply_destination_fields(update_document)

    if "slug" in update_document:
        update_document["slug"] = slugify(update_document["slug"])
        duplicate_blog = blogs.find_one({
            "slug": update_document["slug"],
            "_id": {"$ne": existing_blog["_id"]},
        })

        if duplicate_blog:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Blog slug already exists",
            )

    update_document["updated_at"] = datetime.utcnow()

    try:
        blogs.update_one(
            {"_id": existing_blog["_id"]},
            {"$set": update_document},
        )
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blog slug already exists",
        ) from error

    updated_blog = blogs.find_one({"_id": existing_blog["_id"]})
    return serialize_blog(updated_blog)


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: str,
    current_user=Depends(get_current_user),
):
    blogs = get_blogs_or_503()
    existing_blog = get_blog_or_404(blogs, blog_id)
    ensure_author(existing_blog, current_user)
    blogs.delete_one({"_id": existing_blog["_id"]})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
