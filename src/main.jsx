
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import Provider and your Redux store
import { Provider } from 'react-redux';
import store from './store/index.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap your entire application with the Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);