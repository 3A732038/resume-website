import asyncio
import json
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from chat_service import chat_stream
from resume_data import PROJECTS, RESUME
from visit_logger import ENABLED as VISIT_LOG_ENABLED
from visit_logger import client_ip, record_visit

app = FastAPI(title="Resume API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# 訪客記錄：只在設定了 Supabase 環境變數時啟用。記錄「打開網頁首頁」這個動作，
# 用背景任務寫入，完全不阻塞、不影響正常回應。
@app.middleware("http")
async def log_visit(request: Request, call_next):
    response = await call_next(request)
    if (
        VISIT_LOG_ENABLED
        and request.method == "GET"
        and request.url.path in ("/", "/index.html")
    ):
        asyncio.create_task(
            record_visit(
                ip=client_ip(request),
                user_agent=request.headers.get("user-agent", ""),
                path=request.url.path,
                referer=request.headers.get("referer", ""),
            )
        )
    return response

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
