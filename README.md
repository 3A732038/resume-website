# 巫宇哲個人履歷網站

React + FastAPI + Docker 架構的個人履歷網站。

## 快速開始

### 1. 複製資產檔案

先將 `resume_demo/履歷資料/` 裡的所有檔案複製到 `assets/` 資料夾：

```powershell
Copy-Item -Recurse ..\resume_demo\履歷資料\* .\assets\
```

### 2. 設定 AI 助手（選填）

若要啟用高品質 AI 回答，在 `resume-website/` 目錄下建立 `.env` 檔：

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

不設定的話，AI 助手仍會運作，但會直接回傳檢索到的文字而不經過 LLM 潤飾。

### 3. 啟動

```powershell
docker compose up --build
```

- 前端：http://localhost:3000
- 後端 API 文件：http://localhost:8000/docs

## 開發說明

- 前端改動會即時熱更新（Vite HMR）
- 後端改動會即時重啟（uvicorn --reload）
- 資產檔案掛載為唯讀 volume，不需重建容器

## 專案結構

```
resume-website/
├── assets/          ← 放圖片、PDF、影片（從 resume_demo 複製）
├── backend/
│   ├── main.py      ← FastAPI 主程式
│   ├── resume_data.py  ← 履歷資料
│   ├── chat_service.py ← RAG + AI 對話邏輯
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── ResumeSection.jsx
│           ├── ProjectsSection.jsx
│           └── AIAssistant.jsx
└── docker-compose.yml
```
