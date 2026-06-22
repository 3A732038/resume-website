"""訪客記錄：把每次網頁訪問寫進 Supabase。

只有在環境變數 SUPABASE_URL / SUPABASE_SERVICE_KEY 都有設定時才啟用，
沒設定就完全不動作（本地開發、未設定的環境不受任何影響）。

寫入採「背景任務 + 全程靜默吞例外」設計：就算 Supabase 掛了或變慢，
也不會拖慢或弄壞使用者開網頁的請求。
"""
import os

import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# 兩個值都齊備才啟用，否則整個功能靜默關閉
ENABLED = bool(SUPABASE_URL and SUPABASE_KEY)

# 內網 / 本機 IP 不查地理位置（查了也沒意義）
_PRIVATE_PREFIXES = ("127.", "10.", "192.168.", "172.16.", "::1")


def client_ip(request) -> str:
    """取得真實訪客 IP。

    後端前面有反向代理時，request.client.host 只是代理的 IP，真正的訪客 IP
    在標頭裡。不同代理用不同標頭：Render 用 X-Forwarded-For，本專案的
    reverse-proxy 設的是 X-Real-IP，所以兩個都看。
    """
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    xri = request.headers.get("x-real-ip", "")
    if xri:
        return xri
    return request.client.host if request.client else ""


async def _geo_lookup(ip: str) -> dict:
    """用免費的 ip-api.com 查國家/城市；失敗就回空字典，不影響寫入。"""
    if not ip or ip.startswith(_PRIVATE_PREFIXES):
        return {}
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,country,city"},
            )
            data = resp.json()
            if data.get("status") == "success":
                return {"country": data.get("country"), "city": data.get("city")}
    except Exception:
        pass
    return {}


async def _insert(record: dict) -> None:
    """透過 Supabase 的 REST 介面(PostgREST)新增一筆訪問紀錄。"""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/visits",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json=record,
            )
    except Exception:
        pass


async def record_visit(ip: str, user_agent: str, path: str, referer: str) -> None:
    """查地理位置後寫入一筆訪問。設計成丟到背景跑，不阻塞回應。"""
    geo = await _geo_lookup(ip)
    await _insert(
        {
            "ip": ip,
            "country": geo.get("country"),
            "city": geo.get("city"),
            "user_agent": user_agent,
            "path": path,
            "referer": referer,
        }
    )
