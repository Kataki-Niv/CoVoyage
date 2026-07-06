from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from database import get_profiles_collection, get_users_collection
from jwt_handler import ALGORITHM, SECRET_KEY


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


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
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
    user = users.find_one({"email": email})

    if user is None:
        raise credentials_exception

    return user
