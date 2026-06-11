import asyncio
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from chat_service import chat_stream
from resume_data import PROJECTS, RESUME

app = FastAPI(title="Resume API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

assets_path = Path("/app/assets")
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")


@app.get("/api/resume")
def get_resume():
    return RESUME


@app.get("/api/projects")
def get_projects():
    return PROJECTS


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@app.post("/api/chat")
async def chat(req: ChatRequest):
    async def event_stream():
        async for chunk in chat_stream(req.message, req.history):
            data = json.dumps({"text": chunk}, ensure_ascii=False)
            yield f"data: {data}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# 同時接受 GET 與 HEAD：UptimeRobot 等監控服務預設用 HEAD 檢查
@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}
