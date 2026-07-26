import pytest

def test_user_registration(client):
    payload = {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
    # Ensure password is not returned in response
    assert "password" not in response.json()
    assert "password_hash" not in response.json()

def test_user_login(client):
    # Register first
    payload = {
        "email": "login@example.com",
        "full_name": "Login User",
        "password": "securepassword123"
    }
    client.post("/auth/register", json=payload)
    
    # Attempt login
    login_data = {
        "username": "login@example.com",
        "password": "securepassword123"
    }
    response = client.post("/auth/login/user", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_unauthorized_access(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
