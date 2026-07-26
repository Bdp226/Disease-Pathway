from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os, bcrypt
import secrets
import string

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration - Enhanced security
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "!xEn^FFQQan9Rvf@9O312zfehP9=3rkdFb_8^Wk^maa62@MO-llcm#K9NmxzS(UY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict) -> str:
    """
    Create JWT access token with HMAC signature
    Stateless design prevents token tampering
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Enhanced payload with security timestamps
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access_token"
    })
    
    # HMAC-SHA256 signature prevents payload modification
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    Verify JWT token integrity and return email
    HMAC signature validation prevents tampering
    """
    try:
        # Decode and verify signature
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Extract subject (email)
        email: str = payload.get("sub")
        if email is None:
            return None
            
        # Verify token type
        token_type: str = payload.get("type")
        if token_type != "access_token":
            return None
            
        return email
    except JWTError:
        return None

def generate_secure_secret() -> str:
    """Generate cryptographically secure secret for JWT"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    return ''.join(secrets.choice(alphabet) for _ in range(64))
