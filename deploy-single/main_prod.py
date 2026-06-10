"""生產整合版進入點：沿用 backend/main.py 的 app，額外掛上前端靜態檔案。

不修改原本的 main.py。API 路由（/api、/assets）在 import 時就已註冊，
最後才把 React build 出來的靜態檔掛在 "/"，所以 API 仍會優先匹配，
其餘路徑都交給 SPA（html=True 會 fallback 回 index.html）。
"""
from pathlib import Path

from fastapi.staticfiles import StaticFiles

from main import app

static_dir = Path("/app/static")
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="spa")
