USERNAME_ALREADY_EXISTS_MESSAGE = "Username already exists"
EMAIL_ALREADY_REGISTERED_MESSAGE = "Email already registered."
EMAIL_COLLATION = {"locale": "en", "strength": 2}


def normalize_email_address(email: str) -> str:
    return email.strip().lower()


def find_user_by_email(users_collection, email: str, projection=None):
    return users_collection.find_one(
        {"email": normalize_email_address(email)},
        projection,
        collation=EMAIL_COLLATION,
    )


def is_username_available_for_user(
    profiles_collection,
    username: str,
    user_id: str,
    users_collection=None,
) -> bool:
    existing_profile = profiles_collection.find_one(
        {"username": username},
        {"user_id": 1},
    )

    if existing_profile is not None:
        return str(existing_profile.get("user_id")) == user_id

    if users_collection is None:
        return True

    existing_user = users_collection.find_one(
        {"username": username},
        {"_id": 1},
    )

    if existing_user is None:
        return True

    return str(existing_user.get("_id")) == user_id


def is_username_available_for_registration(
    profiles_collection,
    users_collection,
    username: str,
) -> bool:
    return (
        profiles_collection.find_one({"username": username}, {"_id": 1}) is None
        and users_collection.find_one({"username": username}, {"_id": 1}) is None
    )


def is_email_available_for_user(
    users_collection,
    email: str,
    user_id: str,
) -> bool:
    existing_user = find_user_by_email(users_collection, email, {"_id": 1})

    if existing_user is None:
        return True

    return str(existing_user.get("_id")) == user_id


def is_email_available_for_registration(
    users_collection,
    email: str,
) -> bool:
    return is_email_available_for_user(users_collection, email, "")


def duplicate_key_error_matches(error, field_name: str) -> bool:
    details = error.details or {}
    key_pattern = details.get("keyPattern") or {}
    key_value = details.get("keyValue") or {}

    return (
        field_name in key_pattern
        or field_name in key_value
        or field_name in str(error)
    )
