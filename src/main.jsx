import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en.json"


TimeAgo.addDefaultLocale(en)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
