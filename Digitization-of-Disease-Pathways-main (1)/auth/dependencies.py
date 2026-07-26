from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Union
from .database import get_auth_db, User, Admin
from .utils import verify_token
from .models import UserResponse, AdminResponse, UserMe

# OAuth2 Password Bearer scheme - enhanced security
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login/admin",
    scheme_name="JWT",
    description="Enter JWT token obtained from /auth/login/admin endpoint"
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_auth_db)
) -> UserResponse:
    """
    Get current authenticated user with dual verification
    1. JWT signature validation (prevents tampering)
    2. Database existence check (ensures user validity)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Step 1: Verify JWT token signature
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    # Step 2: Verify user exists in database (stateless + database validation)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return UserResponse.from_orm(user)

async def require_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_auth_db)
) -> AdminResponse:
    """
    Require admin privileges with enhanced security
    Prevents privilege escalation through token manipulation
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin privileges required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Step 1: Verify JWT token signature
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    # Step 2: Verify admin exists in admin table (not just token claim)
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin is None:
        raise credentials_exception
    
    return AdminResponse.from_orm(admin)

async def get_current_user_info(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_auth_db)
) -> UserMe:
    """
    Get current user info with type identification
    Works for both regular users and admins
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    # Check admin first
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin:
        return UserMe(
            id=admin.id,
            email=admin.email,
            full_name=admin.full_name,
            user_type="admin",
            created_at=admin.created_at
        )
    
    # Check regular user
    user = db.query(User).filter(User.email == email).first()
    if user:
        return UserMe(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            user_type="user",
            created_at=user.created_at
        )
    
    raise credentials_exception
