import { useState } from 'react'
import { ENV_KEY } from '../lib/aiReport.js'

const KEY_STORAGE = 'cwp.openrouterKey'
const PREFS_STORAGE = 'cwp.prefs'

function read(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function readPrefs() {
  try {
    return JSON.parse(read(PREFS_STORAGE)) || {}
  } catch {
    return {}
  }
}

export default function ReportForm({ onGenerate, loading, error }) {
  const prefs = readPrefs()
  const [name, setName] = useState('')
  const [pronoun, setPronoun] = useState('she')
  const [notes, setNotes] = useState('')
  const [teacher, setTeacher] = useState(prefs.teacher || '')
  const [parentTitle, setParentTitle] = useState(prefs.parentTitle ?? 'Ma’am')
  const [language, setLanguage] = useState(prefs.language || 'taglish')
  const [mode, setMode] = useState(() => (ENV_KEY || read(KEY_STORAGE) ? 'ai' : 'template'))
  const [apiKey, setApiKey] = useState(() => ENV_KEY || read(KEY_STORAGE))
  const [remember, setRemember] = useState(() => Boolean(read(KEY_STORAGE)))

  const canSubmit = name.trim() && notes.trim() && !loading && (mode === 'template' || apiKey.trim())

  function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      localStorage.setItem(PREFS_STORAGE, JSON.stringify({ teacher, parentTitle, language }))
      if (!ENV_KEY && mode === 'ai' && remember) localStorage.setItem(KEY_STORAGE, apiKey.trim())
      else localStorage.removeItem(KEY_STORAGE)
    } catch {
      /* storage unavailable - continue without remembering */
    }
    onGenerate({ name, pronoun, notes, teacher: teacher.trim(), parentTitle, language, mode, apiKey: apiKey.trim() })
  }

  return (
    <form className="pane form" onSubmit={submit}>
      <div className="row">
        <div className="field grow">
          <label htmlFor="name">Student name</label>
          <input id="name" type="text" placeholder="e.g. Caliegh" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="pronoun">Pronouns</label>
          <select id="pronoun" value={pronoun} onChange={(e) => setPronoun(e.target.value)}>
            <option value="she">she/her</option>
            <option value="he">he/him</option>
            <option value="they">they/them</option>
          </select>
        </div>
      </div>

      <div className="field notes-field">
        <label htmlFor="notes">Accomplishments, tasks &amp; areas to improve</label>
        <textarea
          id="notes"
          placeholder={'One per line, e.g.\n- Saying letter sounds with guidance\n- Still confused with some sounds\n- Tracing letters from the circle'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="row three">
        <div className="field">
          <label htmlFor="teacher">Teacher</label>
          <input id="teacher" type="text" placeholder="e.g. Coleen" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="parent">Parent</label>
          <select id="parent" value={parentTitle} onChange={(e) => setParentTitle(e.target.value)}>
            <option value="Ma’am">Ma’am</option>
            <option value="Sir">Sir</option>
            <option value="Parent">Parent</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lang">Language</label>
          <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="taglish">Taglish</option>
            <option value="english">English</option>
          </select>
        </div>
      </div>

      <div className="segmented" role="radiogroup" aria-label="Writing mode">
        <button type="button" role="radio" aria-checked={mode === 'ai'} className={mode === 'ai' ? 'on' : ''} onClick={() => setMode('ai')}>
          ✨ AI-written
        </button>
        <button type="button" role="radio" aria-checked={mode === 'template'} className={mode === 'template' ? 'on' : ''} onClick={() => setMode('template')}>
          📄 Quick template
        </button>
      </div>

      {mode === 'ai' && ENV_KEY ? (
        <p className="hint">AI is ready (API key loaded from .env).</p>
      ) : mode === 'ai' ? (
        <div className="field key-field">
          <label htmlFor="key">OpenRouter API key</label>
          <div className="key-line">
            <input id="key" type="password" placeholder="sk-or-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember
            </label>
          </div>
          <p className="hint">Add it to .env as VITE_OPENROUTER_API_KEY, or paste it here. Sent directly to OpenRouter.</p>
        </div>
      ) : (
        <p className="hint">Offline. Uses your notes as written with generic reminders and goals.</p>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="primary" disabled={!canSubmit}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" /> Writing…
          </>
        ) : (
          'Generate message'
        )}
      </button>
    </form>
  )
}
