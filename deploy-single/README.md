# 整合單一容器版（給 Koyeb 等免費平台用）

把前端 + 後端打包成**單一服務**：FastAPI 同時提供 API、靜態資源、以及 React build 出來的網頁。
因為同源，前端的 `/api/...`、`/assets/...` 直接可用，**前端程式碼不需任何修改**。

這個資料夾完全獨立，不影響你原本的前後端分離開發架構。

## 架構

```
單一容器 (FastAPI, port 8000)
├── /api/*     → 後端 API（沿用 backend/main.py）
├── /assets/*  → 靜態資源（圖片 / PDF / 影片）
└── /*         → React SPA（static/）
```

## 本機測試

從**專案根目錄**執行：

```bash
docker compose -f deploy-single/docker-compose.yml up --build
```

開 http://localhost:8080 確認一切正常。

## 部署到 Koyeb

1. 把整個專案推到 GitHub
2. Koyeb → Create Service → GitHub repo
3. 設定：
   - **Builder**：Dockerfile
   - **Dockerfile location**：`deploy-single/Dockerfile`
   - **Work directory / build context**：專案根目錄（留空）
   - **Port**：`8000`
   - **Environment variables**：`OPENROUTER_API_KEY=你的key`
4. Deploy，等 build 完會給你一個 `https://xxx.koyeb.app` 網址

> 注意：`backend/.env` 不會（也不該）推上 GitHub，
> 所以 API key 一定要在 Koyeb 的環境變數裡設定。
