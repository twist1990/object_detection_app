import React, { useState } from 'react';
import './ObjectDetection.css';

// Компонент для детекции объектов на изображениях
const ObjectDetection = () => {
  // Состояния компонента:
  const [file, setFile] = useState(null);          // Выбранный файл изображения
  const [preview, setPreview] = useState(null);    // URL для предпросмотра изображения
  const [result, setResult] = useState(null);      // URL обработанного изображения с детекцией
  const [loading, setLoading] = useState(false);  // Флаг загрузки (показывает процесс обработки)
  const [error, setError] = useState(null);       // Сообщение об ошибке (если возникла)

  // Обработчик изменения выбранного файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];  // Получаем первый выбранный файл
    if (selectedFile) {
      setFile(selectedFile);  // Сохраняем файл в состоянии
      // Создаем временный URL для предпросмотра
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);  // Сбрасываем предыдущий результат
      setError(null);   // Сбрасываем ошибки
    }
  };

  // Обработчик отправки формы (запуск детекции)
  const handleSubmit = async (e) => {
    e.preventDefault();  // Предотвращаем стандартное поведение формы
    if (!file) return;   // Если файл не выбран, ничего не делаем

    setLoading(true);    // Включаем состояние загрузки
    setError(null);     // Сбрасываем ошибки

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', file);  // Добавляем файл в форму

    try {
      // Отправляем запрос к FastAPI бэкенду
      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        body: formData,  // Отправляем FormData с изображением
      });

      // Если ответ не успешный (не 2xx)
      if (!response.ok) {
        const errorData = await response.json();  // Пытаемся получить JSON с ошибкой
        throw new Error(errorData.detail || 'Error processing image');
      }

      // Получаем обработанное изображение как Blob
      const imageBlob = await response.blob();
      // Создаем URL для отображения результата
      const imageUrl = URL.createObjectURL(imageBlob);
      setResult(imageUrl);  // Сохраняем результат
    } catch (err) {
      setError(err.message);  // Сохраняем сообщение об ошибке
    } finally {
      setLoading(false);  // Выключаем состояние загрузки в любом случае
    }
  };

  // Рендер компонента
  return (
    <div className="container">
      <h1>Object Detection with YOLOv8</h1>
      
      {/* Форма для загрузки изображения */}
      <form onSubmit={handleSubmit}>
        <div className="file-input">
          {/* Скрытый input для выбора файла */}
          <input
            type="file"
            id="image-upload"
            accept="image/*"  // Принимаем только изображения
            onChange={handleFileChange}
            disabled={loading}  // Блокируем во время обработки
          />
          {/* Кастомная кнопка для выбора файла */}
          <label htmlFor="image-upload">
            {file ? file.name : 'Choose an image...'}
          </label>
        </div>
        
        {/* Кнопка для запуска детекции */}
        <button 
          type="submit" 
          disabled={!file || loading}  // Блокируем если нет файла или идет обработка
          className="detect-button"
        >
          {loading ? 'Processing...' : 'Detect Objects'}
        </button>
      </form>

      {/* Блок для отображения ошибок */}
      {error && <div className="error">{error}</div>}

      {/* Блок для отображения результатов */}
      <div className="results">
        {/* Предпросмотр оригинального изображения */}
        {preview && (
          <div className="image-container">
            <h3>Original Image</h3>
            <img src={preview} alt="Original" />
          </div>
        )}
        
        {/* Результат детекции объектов */}
        {result && (
          <div className="image-container">
            <h3>Detection Results</h3>
            <img src={result} alt="Detection Result" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetection;
