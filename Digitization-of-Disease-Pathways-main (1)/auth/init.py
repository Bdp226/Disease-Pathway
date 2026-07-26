"""
Authentication module for Disease Pathway API
Provides OAuth2 password bearer authentication with JWT tokens
Includes user pain point submission and admin management system
"""

from .database import User, Admin, UserPainPoint, create_auth_tables, get_auth_db
from .models import (
    UserRegister, UserResponse, AdminResponse, Token, UserMe,
    PainPointSubmit, PainPointResponse, PaginatedPainPointsResponse, 
    StatusUpdateResponse, PainPointSubmitResponse
)
from .utils import verify_password, get_password_hash, create_access_token, verify_token
from .dependencies import get_current_user, require_admin, oauth2_scheme, get_current_user_info
from .routes import auth_router

__all__ = [
    # Database models and functions
    "User", "Admin", "UserPainPoint", "create_auth_tables", "get_auth_db",
    
    # Authentication models
    "UserRegister", "UserResponse", "AdminResponse", "Token", "UserMe",
    
    # Pain point models
    "PainPointSubmit", "PainPointResponse", "PaginatedPainPointsResponse", 
    "StatusUpdateResponse", "PainPointSubmitResponse",
    
    # Utility functions
    "verify_password", "get_password_hash", "create_access_token", "verify_token",
    
    # Dependencies
    "get_current_user", "require_admin", "oauth2_scheme", "get_current_user_info",
    
    # Router
    "auth_router"
]
