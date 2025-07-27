// Импорт необходимых зависимостей
import React from 'react'; // Базовый импорт React
import ObjectDetection from './components/ObjectDetection'; // Импорт компонента ObjectDetection
import './App.css'; // Импорт CSS-стилей для данного компонента

// Основной компонент App - корневой компонент приложения
function App() {
  // Возвращаем JSX-разметку
  return (
    // div с классом App (основной контейнер приложения)
    <div className="App">
      {/* Рендерим компонент ObjectDetection - основной функциональный компонент приложения */}
      <ObjectDetection />
    </div>
  );
}

// Экспортируем компонент App по умолчанию
export default App;
