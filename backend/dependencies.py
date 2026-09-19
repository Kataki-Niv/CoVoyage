from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from database import (
    get_account_tokens_collection,
    get_backpack_items_collection,
    get_connection_requests_collection,
    get_profiles_collection,
    get_tribe_blocks_collection,
    get_users_collection,
)
from jwt_handler import ALGORITHM, SECRET_KEY
from services.account_identity import find_user_by_email


bearer_scheme = HTTPBearer(auto_error=False)


def get_users_or_503():
    try:
        return get_users_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_profiles_or_503():
    try:
        return get_profiles_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_connection_requests_or_503():
    try:
        return get_connection_requests_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_tribe_blocks_or_503():
    try:
        return get_tribe_blocks_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_account_tokens_or_503():
    try:
        return get_account_tokens_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_backpack_items_or_503():
    try:
        return get_backpack_items_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication configuration is unavailable",
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise credentials_exception

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        email = payload.get("sub")

        if email is None:
            raise credentials_exception
    except JWTError as error:
        raise credentials_exception from error

    users = get_users_or_503()
    user = find_user_by_email(users, email)

    if user is None:
        raise credentials_exception

    return user


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if credentials is None:
        return None

    return get_current_user(credentials)
