# ---- Stage 1: 建置前端 ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: 後端 + 靜態檔 ----
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 後端程式碼
COPY backend/ ./
# 靜態資源（圖片、PDF 等，由 /assets 提供）
COPY assets/ ./assets/
# 前端 build 結果
COPY --from=frontend /app/frontend/dist ./static
# 生產進入點
COPY deploy-single/main_prod.py ./

EXPOSE 8000
CMD ["uvicorn", "main_prod:app", "--host", "0.0.0.0", "--port", "8000"]
