import { createRoot } from 'react-dom/client'
import { Tldraw } from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'

// Generate or retrieve session ID
const SESSION_ID = 'default-session'

function App() {
  const store = useSync({
    uri: `ws://localhost:4000/sync/${SESSION_ID}`,
  })

  if (store.status === 'loading') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Connecting to sync server...
      </div>
    )
  }

  if (store.status === 'error') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Failed to connect: {store.error?.message}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw store={store.store} />
    </div>
  )
}

const container = document.getElementById('app')
if (!container) throw new Error('Failed to find the app element')
const root = createRoot(container)
root.render(<App />)
