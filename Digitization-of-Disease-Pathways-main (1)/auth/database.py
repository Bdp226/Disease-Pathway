from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from datetime import datetime
import urllib,pydoc
import os
SQLITE_DATABASE_URL = "sqlite:///./auth.db"
server ='a0057-ittdatabase2024-dev.database.windows.net'  
database = 'a0057-isedasqldb01-dev'               
username = 'isedasqldbuser'                    
password = 'N6eWkET@WiUYA>[/>Nh!14BiKe(f(k28'                    
driver = 'ODBC Driver 17 for SQL Server'
password_encoded = urllib.parse.quote_plus(password)
connection_string = (
        f"mssql+pyodbc://{username}:{password_encoded}@{server}/"
        f"{database}?driver={urllib.parse.quote_plus(driver)}"
        f"&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"
    )
auth_engine = create_engine(
    SQLITE_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

AuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=auth_engine)
AuthBase = declarative_base()

class User(AuthBase):
    """Regular users table for standard user registration"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now(), nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

class Admin(AuthBase):
    """Administrators table - separate from users for enhanced security"""
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now(), nullable=False)
    
    def __repr__(self):
        return f"<Admin(id={self.id}, email={self.email})>"

class UserPainPoint(AuthBase):
    """User-submitted pain points for disease pathways"""
    __tablename__ = "user_pain_points"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    disease_name = Column(String(255), nullable=False)  
    pain_point = Column(Text, nullable=False)  
    solution = Column(Text, nullable=True)  
    source = Column(Text, nullable=True)  
    status = Column(String(20), default="pending", nullable=False) 
    created_at = Column(DateTime, default=datetime.now(), nullable=False)
    
    # Relationship to user (only User table, not Admin)
    user = relationship("User", backref="pain_points")
    
    def __repr__(self):
        return f"<UserPainPoint(id={self.id}, user_id={self.user_id}, disease={self.disease_name}, status={self.status})>"

class contactUs(AuthBase):
    __tablename__ = "contact_us"
    id = Column(Integer, primary_key=True, index=True)
    user_name=Column(String(255), nullable=False)
    user_email=Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now(), nullable=False)
    

    def __repr__(self):
        return f"<contactUs(id={self.id}, user_name={self.user_name}, subject={self.subject})>"
 
def create_auth_tables():
    """Create authentication database tables"""
    try:
        AuthBase.metadata.create_all(bind=auth_engine)
    except Exception as e:
        print(f"❌ Error creating auth tables: {e}")
        raise

def get_auth_db():
    """Dependency to get authentication database session"""
    db = AuthSessionLocal()
    try:
        yield db
    finally:
        db.close()
