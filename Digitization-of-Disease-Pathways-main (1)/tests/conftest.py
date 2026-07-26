import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from auth.database import Base as AuthBase, get_auth_db
from main import app
from fastapi.testclient import TestClient

# Use an in-memory SQLite database for testing to protect company data
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

auth_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
AuthTestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=auth_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    AuthBase.metadata.create_all(bind=auth_engine)
    yield
    Base.metadata.drop_all(bind=engine)
    AuthBase.metadata.drop_all(bind=auth_engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def auth_db():
    connection = auth_engine.connect()
    transaction = connection.begin()
    session = AuthTestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db, auth_db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    def override_get_auth_db():
        try:
            yield auth_db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_auth_db] = override_get_auth_db
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()
