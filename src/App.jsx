import { useEffect, useRef, useState } from 'react'
import ReportForm from './components/ReportForm.jsx'
import ReportView from './components/ReportView.jsx'
import { generateOfflineReport } from './lib/offlineReport.js'
import { generateAiReport } from './lib/aiReport.js'

const THEME_STORAGE = 'cwp.theme'

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [report, setReport] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('form') // which pane shows on phones
  const [theme, setTheme] = useState(initialTheme)
  const controller = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1420' : '#eef1f8')
    try {
      localStorage.setItem(THEME_STORAGE, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  async function handleGenerate(input) {
    setError('')
    setLoading(true)
    setTab('result') // on phones, jump to the message pane so the loader is visible
    controller.current?.abort()
    controller.current = new AbortController()
    try {
      const text =
        input.mode === 'ai'
          ? await generateAiReport(input, input.apiKey, controller.current.signal)
          : generateOfflineReport(input)
      setStudentName(input.name)
      setReport({ text, source: input.mode === 'ai' ? 'ai' : 'template' })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Please try again.')
        setTab('form') // show the error next to the form
      }
    } finally {
      setLoading(false)
    }
  }

  const dark = theme === 'dark'

  return (
    <div className="app">
      <header>
        <div className="logo" aria-hidden="true">
          📚
        </div>
        <div className="titles">
          <h1>Classwork Progress Updates</h1>
          <p>Name + notes in, parent-ready message out.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        <button role="tab" aria-selected={tab === 'form'} className={tab === 'form' ? 'on' : ''} onClick={() => setTab('form')}>
          1 · Details
        </button>
        <button role="tab" aria-selected={tab === 'result'} className={tab === 'result' ? 'on' : ''} onClick={() => setTab('result')}>
          2 · Message{report ? ' ✓' : ''}
        </button>
      </nav>

      <main data-tab={tab}>
        <ReportForm onGenerate={handleGenerate} loading={loading} error={error} />
        <ReportView report={report} studentName={studentName} loading={loading} />
      </main>

      <footer>© 2026 Nikko Dacara</footer>
    </div>
  )
}
