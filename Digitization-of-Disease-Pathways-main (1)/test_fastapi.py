from fastapi import FastAPI, APIRouter
from fastapi.testclient import TestClient

app = FastAPI()
router = APIRouter(prefix="/chat")

@router.post("")
def chat1(): return "chat1"

app.include_router(router)

@app.post("/chat")
def chat2(): return "chat2"

client = TestClient(app)
print(client.post("/chat").json())
