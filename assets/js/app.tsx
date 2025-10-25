import { createRoot } from 'react-dom/client'
import { useCallback, useEffect, useState } from 'react'
import { Editor, TLEventMapHandler, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function App() {
  const [editor, setEditor] = useState<Editor>()

	const setAppToState = useCallback((editor: Editor) => {
		setEditor(editor)
	}, [])

	const [storeEvents, setStoreEvents] = useState<string[]>([])

	useEffect(() => {
		if (!editor) return

		const handleChangeEvent: TLEventMapHandler<'change'> = (change) => {
		  console.log(change)
		}

		const cleanupFunction = editor.store.listen(handleChangeEvent, { source: 'user', scope: 'all' })

		return () => {
			cleanupFunction()
		}
	}, [editor])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={setAppToState} />
    </div>
  )
}

const container = document.getElementById('app')
if (!container) throw new Error('Failed to find the app element')
const root = createRoot(container)
root.render(<App />)
