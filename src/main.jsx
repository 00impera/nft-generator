import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import FarcasterNFT from './FarcasterNFT.jsx'
import './index.css'

// Simple routing based on URL path
const getComponent = () => {
  const path = window.location.pathname
  
  // Check if we're in Farcaster context
  if (path.includes('/farcaster') || window.location.search.includes('farcaster')) {
    return <FarcasterNFT />
  }
  
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {getComponent()}
  </React.StrictMode>,
)
