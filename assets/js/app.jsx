import React from 'react'
import { createRoot } from 'react-dom/client'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
