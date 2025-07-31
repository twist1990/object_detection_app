import React, { useState } from 'react';
import './ObjectDetection.css';

const ObjectDetection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState('nano'); // Добавляем состояние для выбранной модели

  // Доступные модели с описанием
  const MODEL_OPTIONS = [
    { value: 'nano', label: 'YOLOv8 Nano (fastest)' },
    { value: 'small', label: 'YOLOv8 Small' },
    { value: 'medium', label: 'YOLOv8 Medium' },
    { value: 'large', label: 'YOLOv8 Large' },
    { value: 'xlarge', label: 'YOLOv8 XLarge (most accurate)' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value); // Обновляем выбранную модель
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Добавляем выбранную модель в URL запроса
      const response = await fetch(`http://localhost:8000/detect?model_key=${model}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error processing image');
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setResult(imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Object Detection with YOLOv8</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Добавляем выбор модели */}
        <div className="form-group">
          <label htmlFor="model-select">Select Model:</label>
          <select
            id="model-select"
            value={model}
            onChange={handleModelChange}
            disabled={loading}
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="file-input">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="image-upload">
            {file ? file.name : 'Choose an image...'}
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={!file || loading}
          className="detect-button"
        >
          {loading ? 'Processing...' : 'Detect Objects'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {preview && (
          <div className="image-container">
            <h3>Original Image</h3>
            <img src={preview} alt="Original" />
          </div>
        )}
        
        {result && (
          <div className="image-container">
            <h3>Detection Results ({MODEL_OPTIONS.find(m => m.value === model).label})</h3>
            <img src={result} alt="Detection Result" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetection;
