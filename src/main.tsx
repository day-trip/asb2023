import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import Data from "./backend/Data";

Data.init();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App/>)
