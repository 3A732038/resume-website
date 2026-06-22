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


assets_path = Path("/app/assets")
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")


@app.get("/api/resume")
def get_resume():
    return RESUME


@app.get("/api/projects")
def get_projects():
    return PROJECTS


class VisitBeacon(BaseModel):
    # document.referrer：使用者從哪個網站連過來（例如 104、Google）。
    # 只有最初載入頁面的請求才帶得到外部來源，所以交給前端 JS 回報。
    referrer: str = ""
    path: str = "/"


@app.post("/api/visit")
async def log_visit(beacon: VisitBeacon, request: Request):
    """前端載入時呼叫一次，記錄一筆訪問。背景寫入，不阻塞。"""
    if VISIT_LOG_ENABLED:
        asyncio.create_task(
            record_visit(
                ip=client_ip(request),
                user_agent=request.headers.get("user-agent", ""),
                path=beacon.path or "/",
                # 優先用前端送來的 document.referrer；沒有就退回 Referer 標頭
                referer=beacon.referrer or request.headers.get("referer", ""),
            )
        )
    return {"ok": True}


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
