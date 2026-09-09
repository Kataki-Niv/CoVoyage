from datetime import datetime, timedelta

from jose import jwt
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path(__file__).with_name(".env"))

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"


def create_access_token(data: dict):
    if not SECRET_KEY:
        raise RuntimeError("JWT_SECRET is not set in the environment")

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=30)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt
