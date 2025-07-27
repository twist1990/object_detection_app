from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import os
import numpy as np

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация модели
model = YOLO("yolov8n.pt")  # Модель скачается автоматически при первом запуске

# Создаем папку для загрузок
os.makedirs("uploads", exist_ok=True)

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    try:
        # Проверка формата файла
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

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
        output_path = f"uploads/detected_{file.filename}"
        annotated_img = results[0].plot()
        cv2.imwrite(output_path, annotated_img)

        return FileResponse(output_path, media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
