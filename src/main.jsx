import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './person1/App.jsx';
import './person1/styles.css';
import './person1/immersive.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
