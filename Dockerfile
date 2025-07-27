# Используем официальный образ Python
FROM python:3.9

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем Python-зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем python-multipart для FastAPI
RUN pip install --no-cache-dir python-multipart

# Копируем исходный код
COPY . .

# Создаем папку для загрузок
RUN mkdir -p /app/uploads

# Фикс для PyTorch 2.6+ (разрешаем загрузку весов)
ENV TORCH_FORCE_WEIGHTS_ONLY_LOAD=0

# Предварительная загрузка модели
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
