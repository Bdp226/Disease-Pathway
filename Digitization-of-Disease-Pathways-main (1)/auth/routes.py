from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from math import ceil

from .database import get_auth_db, User, Admin, UserPainPoint, contactUs
from .models import (
    UserRegister, UserResponse, Token, UserMe,
    PainPointSubmit, PainPointResponse, PaginatedPainPointsResponse, 
    StatusUpdateResponse, PainPointSubmitResponse,
    ContactUsSubmit, ContactUsResponse, ContactUsSubmitResponse, PaginatedContactUsResponse
)
from .utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_HOURS
from .dependencies import get_current_user_info, get_current_user, require_admin
from .mail import EmailService

auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"}
    }
)

# Existing authentication endpoints remain unchanged
@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_auth_db)
):
    """Register new user - no admin intervention required"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as user"
        )
    
    # Check if admin exists with same email
    existing_admin = db.query(Admin).filter(Admin.email == user_data.email).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as admin"
        )
    
    try:
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return UserResponse.from_orm(new_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

@auth_router.post("/login/user", response_model=Token)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_auth_db)
):
    """User login endpoint - OAuth2 compatible - Only checks regular users table"""
    email = form_data.username
    password = form_data.password
    
    # Check only user table
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found with this email",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600
    )

@auth_router.post("/login/admin", response_model=Token)
async def login_admin(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_auth_db)
):
    """Admin login endpoint - OAuth2 compatible - Only checks admin table"""
    email = form_data.username
    password = form_data.password
    
    # Check only admin table
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found with this email",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = create_access_token(data={"sub": admin.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600
    )

@auth_router.get("/me", response_model=UserMe)
async def get_user_profile(
    current_user: UserMe = Depends(get_current_user_info)
):
    """Get current user profile information"""
    return current_user

@auth_router.get("/health")
async def auth_health_check(db: Session = Depends(get_auth_db)):
    """Authentication system health check"""
    try:
        user_count = db.query(User).count()
        admin_count = db.query(Admin).count()
        pain_points_count = db.query(UserPainPoint).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "users": user_count,
            "admins": admin_count,
            "pain_points": pain_points_count,
            "jwt_expiration_hours": ACCESS_TOKEN_EXPIRE_HOURS,
            "endpoints": {
                "user_login": "/auth/login/user",
                "admin_login": "/auth/login/admin",
                "register": "/auth/register",
                "profile": "/auth/me",
                "pain_points_submit": "/auth/pain-points/submit",
                "admin_pain_points": "/auth/admin/pain-points"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication system unavailable"
        )

# NEW: User Pain Point Endpoints
@auth_router.post("/pain-points/submit", response_model=PainPointSubmitResponse, status_code=status.HTTP_201_CREATED)
async def submit_pain_point(
    pain_point_data: PainPointSubmit,
    background_tasks: BackgroundTasks,  # ✅ ADD THIS
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_auth_db)
):
    """Submit a new pain point (requires user login - admins cannot submit)"""
    try:
        # Create new pain point
        new_pain_point = UserPainPoint(
            user_id=current_user.id,
            disease_name=pain_point_data.disease_name,
            pain_point=pain_point_data.pain_point,
            solution=pain_point_data.solution,
            source=pain_point_data.source,
            status="pending"
        )
        
        db.add(new_pain_point)
        db.commit()
        db.refresh(new_pain_point)
        
        # ✅ ADD THIS: Send notification in background via Celery Message Queue
        from tasks import send_webhook_notification_task
        send_webhook_notification_task.delay(
            user_name=current_user.full_name,
            user_email=current_user.email,
            disease_name=pain_point_data.disease_name,
            pain_point=pain_point_data.pain_point,
            solution=pain_point_data.solution,
            source=pain_point_data.source
        )
        
        return PainPointSubmitResponse(
            id=new_pain_point.id,
            message="Pain point submitted successfully. Notification sent to admin.",
            status=new_pain_point.status
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit pain point"
        )

# NEW: Admin Pain Point Management Endpoints
@auth_router.get("/admin/pain-points", response_model=PaginatedPainPointsResponse)
async def get_pain_points_admin(
    status: str = Query("pending", description="Filter by status: all, pending, approved, denied"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(200, ge=1, le=100, description="Items per page"),
    current_admin = Depends(require_admin),  # Only admins
    db: Session = Depends(get_auth_db)
):
    """Get paginated pain points filtered by status (admin only)"""
    
    # Validate status parameter
    valid_statuses = ["all", "pending", "approved", "denied"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        # Build query with user join
        query = db.query(UserPainPoint).join(User)
        
        # Filter by status if not 'all'
        if status != "all":
            query = query.filter(UserPainPoint.status == status)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        pain_points = query.order_by(UserPainPoint.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Convert to response format
        items = []
        for pp in pain_points:
            items.append(PainPointResponse(
                id=pp.id,
                disease_name=pp.disease_name,
                pain_point=pp.pain_point,
                solution=pp.solution,
                source=pp.source,
                status=pp.status,
                created_at=pp.created_at,
                user_id=pp.user_id,
                user_email=pp.user.email,
                user_full_name=pp.user.full_name
            ))
        
        total_pages = ceil(total / per_page) if total > 0 else 1
        
        return PaginatedPainPointsResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch pain points"
        )

@auth_router.put("/admin/pain-points/{pain_point_id}/approve", response_model=StatusUpdateResponse)
async def approve_pain_point(
    pain_point_id: int,
    current_admin = Depends(require_admin),  # Only admins
    db: Session = Depends(get_auth_db)
):
    """Approve a pain point (admin only)"""
    
    # Find pain point
    pain_point = db.query(UserPainPoint).filter(UserPainPoint.id == pain_point_id).first()
    
    if not pain_point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pain point not found"
        )
    
    try:
        # Update status
        pain_point.status = "approved"
        db.commit()
        db.refresh(pain_point)
        
        return StatusUpdateResponse(
            id=pain_point.id,
            status=pain_point.status,
            message="Pain point approved successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve pain point"
        )

@auth_router.put("/admin/pain-points/{pain_point_id}/deny", response_model=StatusUpdateResponse)
async def deny_pain_point(
    pain_point_id: int,
    current_admin = Depends(require_admin),  # Only admins
    db: Session = Depends(get_auth_db)
):
    """Deny a pain point (admin only)"""
    
    # Find pain point
    pain_point = db.query(UserPainPoint).filter(UserPainPoint.id == pain_point_id).first()
    
    if not pain_point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pain point not found"
        )
    
    try:
        # Update status
        pain_point.status = "denied"
        db.commit()
        db.refresh(pain_point)
        
        return StatusUpdateResponse(
            id=pain_point.id,
            status=pain_point.status,
            message="Pain point denied successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deny pain point"
        )


@auth_router.post("/contact-us/submit", response_model=ContactUsSubmitResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    contact_data: ContactUsSubmit,
    db: Session = Depends(get_auth_db)
):
    """Submit contact form - No authentication required"""
    try:
        # Create new contact submission
        new_contact = contactUs(
            user_name=contact_data.user_name,
            user_email=contact_data.user_email,
            subject=contact_data.subject,
            description=contact_data.description
        )
        
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        
        return ContactUsSubmitResponse(
            id=new_contact.id,
            message="Contact form submitted successfully. We'll get back to you soon!",
            submitted_at=new_contact.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form. Please try again."
        )

@auth_router.get("/admin/contact-us", response_model=PaginatedContactUsResponse)
async def get_contact_submissions_admin(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or subject"),
    current_admin = Depends(require_admin),  # Only admins can view
    db: Session = Depends(get_auth_db)
):
    """Get paginated contact form submissions (admin only)"""
    try:
        # Build base query
        query = db.query(contactUs)
        
        # Add search filter if provided
        if search and search.strip():
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (contactUs.user_name.ilike(search_term)) |
                (contactUs.user_email.ilike(search_term)) |
                (contactUs.subject.ilike(search_term))
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        contact_submissions = query.order_by(contactUs.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Convert to response format
        items = []
        for contact in contact_submissions:
            items.append(ContactUsResponse(
                id=contact.id,
                user_name=contact.user_name,
                user_email=contact.user_email,
                subject=contact.subject,
                description=contact.description,
                created_at=contact.created_at
            ))
        
        total_pages = ceil(total / per_page) if total > 0 else 1
        
        return PaginatedContactUsResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch contact submissions"
        )

@auth_router.get("/admin/contact-us/{contact_id}", response_model=ContactUsResponse)
async def get_contact_submission_detail(
    contact_id: int,
    current_admin = Depends(require_admin),  # Only admins can view
    db: Session = Depends(get_auth_db)
):
    """Get specific contact submission details (admin only)"""
    
    contact = db.query(contactUs).filter(contactUs.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    return ContactUsResponse(
        id=contact.id,
        user_name=contact.user_name,
        user_email=contact.user_email,
        subject=contact.subject,
        description=contact.description,
        created_at=contact.created_at
    )

@auth_router.delete("/admin/contact-us/{contact_id}")
async def delete_contact_submission(
    contact_id: int,
    current_admin = Depends(require_admin),  # Only admins can delete
    db: Session = Depends(get_auth_db)
):
    """Delete contact submission (admin only)"""
    
    contact = db.query(contactUs).filter(contactUs.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    try:
        db.delete(contact)
        db.commit()
        
        return {"message": "Contact submission deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contact submission"
        )
