def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_all_diseases_empty(client):
    response = client.get("/diseases")
    assert response.status_code == 200
    assert response.json() == []

def test_get_disease_not_found(client):
    response = client.get("/diseases/nonexistent")
    assert response.status_code == 404
