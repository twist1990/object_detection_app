// Импорт необходимых библиотек и компонентов
import React from 'react'; // Основная React библиотека
import ReactDOM from 'react-dom/client'; // ReactDOM для рендеринга в браузер (клиентская версия)
import App from './App'; // Главный компонент приложения

// Создаем корневой рендер-контейнер
// document.getElementById('root') - находим DOM-элемент с id="root" в public/index.html
// createRoot создает корневой узел для рендеринга React-приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендерим приложение в корневой узел
root.render(
  // React.StrictMode - специальный компонент для выявления потенциальных проблем
  <React.StrictMode>
    {/* Оборачиваем главный компонент App в StrictMode */}
    <App />
  </React.StrictMode>
);
