from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import os
from typing import Optional

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Доступные модели YOLOv8
AVAILABLE_MODELS = {
    "nano": "yolov8n.pt",      # Самая маленькая и быстрая
    "small": "yolov8s.pt",     # Немного больше и точнее
    "medium": "yolov8m.pt",    # Средний вариант
    "large": "yolov8l.pt",     # Большая модель
    "xlarge": "yolov8x.pt",    # Самая большая и точная
}

# Глобальная переменная для хранения загруженных моделей (чтобы не загружать каждый раз)
loaded_models = {}

def get_model(model_key: str) -> YOLO:
    """Загружает модель по ключу (если еще не загружена)"""
    if model_key not in loaded_models:
        if model_key not in AVAILABLE_MODELS:
            raise HTTPException(status_code=400, detail=f"Model {model_key} not available")
        model_path = AVAILABLE_MODELS[model_key]
        loaded_models[model_key] = YOLO(model_path)  # Модель скачается автоматически
    return loaded_models[model_key]

# Создаем папку для загрузок
os.makedirs("uploads", exist_ok=True)

@app.post("/detect")
async def detect_objects(
    file: UploadFile = File(...),
    model_key: str = Query("nano", description="Выбор модели: nano, small, medium, large, xlarge")
):
    try:
        # Проверка формата файла
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # Получаем выбранную модель
        model = get_model(model_key)

        # Сохраняем файл временно
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Читаем изображение
        img = cv2.imread(file_path)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Детекция объектов
        results = model(img)

        # Сохраняем результат с bounding boxes
        output_path = f"uploads/detected_{model_key}_{file.filename}"
        annotated_img = results[0].plot()
        cv2.imwrite(output_path, annotated_img)

        return FileResponse(output_path, media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
