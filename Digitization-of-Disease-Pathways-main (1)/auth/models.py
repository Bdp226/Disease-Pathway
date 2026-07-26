from pydantic import BaseModel, Field, validate_email
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    """User registration request model"""
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., min_length=2, max_length=100, description="User full name")
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")

class UserLogin(BaseModel):
    """User login request model - OAuth2 compatible"""
    username: str = Field(..., description="User email (OAuth2 uses 'username' field)")
    password: str = Field(..., description="User password")

class UserResponse(BaseModel):
    """User response model - no sensitive data"""
    id: int
    email: str
    full_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminResponse(BaseModel):
    """Admin response model - no sensitive data"""
    id: int
    email: str
    full_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """OAuth2 JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: Optional[int] = Field(None, description="Token expiration time in seconds")

class TokenPayload(BaseModel):
    """JWT token payload for internal use"""
    sub: str = Field(..., description="Subject (user email)")
    exp: int = Field(..., description="Expiration timestamp")
    iat: Optional[int] = Field(None, description="Issued at timestamp")

class UserMe(BaseModel):
    """Current user information response"""
    id: int
    email: str
    full_name: str
    user_type: str = Field(..., description="User type: 'user' or 'admin'")
    created_at: datetime
    
    class Config:
        from_attributes = True

# NEW: Pain Point Models
class PainPointSubmit(BaseModel):
    """User pain point submission request model"""
    disease_name: str = Field(..., description="Disease name (free text)")
    pain_point: str = Field(..., description="Pain point description")
    solution: Optional[str] = Field(None, description="Optional solution")
    source: Optional[str] = Field(None, description="Optional source/reference")

class PainPointResponse(BaseModel):
    """Pain point response model for admin dashboard"""
    id: int
    disease_name: str
    pain_point: str
    solution: Optional[str]
    source: Optional[str]
    status: str
    created_at: datetime
    
    # User details (from User table)
    user_id: int
    user_email: str
    user_full_name: str
    
    class Config:
        from_attributes = True

class PaginatedPainPointsResponse(BaseModel):
    """Paginated pain points response for admin dashboard"""
    items: List[PainPointResponse]
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")

class StatusUpdateResponse(BaseModel):
    """Response model for pain point status updates"""
    id: int
    status: str = Field(..., description="Updated status (approved/denied)")
    message: str = Field(..., description="Success message")

class PainPointSubmitResponse(BaseModel):
    """Response model for pain point submission"""
    id: int
    message: str = Field(..., description="Success message")
    status: str = Field(..., description="Current status (pending)")

class ContactUsSubmit(BaseModel):
    """Contact form submission schema"""
    user_name: str = Field(..., min_length=2, max_length=255, description="Full name of the person")
    user_email: str = Field(..., description="Email address")
    subject: str = Field(..., min_length=5, max_length=255, description="Subject of the message")
    description: str = Field(..., min_length=10, description="Detailed message/description")

class ContactUsResponse(BaseModel):
    """Contact form response schema"""
    id: int
    user_name: str
    user_email: str
    subject: str
    description: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContactUsSubmitResponse(BaseModel):
    """Response after successful contact form submission"""
    id: int
    message: str
    submitted_at: datetime

class PaginatedContactUsResponse(BaseModel):
    """Paginated contact form submissions for admin"""
    items: List[ContactUsResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
