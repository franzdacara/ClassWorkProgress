import { useEffect, useState } from 'react'

// The generated message is shown in an editable box so the teacher can tweak it before sending.
export default function ReportView({ report, studentName, loading }) {
  const [text, setText] = useState(report?.text || '')
  const [copied, setCopied] = useState(false)

  useEffect(() => setText(report?.text || ''), [report])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy automatically. Please select the text and copy it manually.')
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studentName.replace(/[^\w-]+/g, '_')}_progress_update.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <section className="pane result empty" aria-live="polite" aria-busy="true">
        <div className="loading-box">
          <span className="spinner lg" aria-hidden="true" />
          <p>
            <strong>Writing your message…</strong>
            <br />
            This can take a few seconds.
          </p>
          <div className="skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="pane result empty" aria-live="polite">
        <div className="placeholder">
          <div className="big">💬</div>
          <p>Your parent update will appear here.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="pane result" aria-live="polite">
      <div className="toolbar">
        <span className="badge">{report.source === 'ai' ? 'Written by AI' : 'Quick template'}</span>
        <div className="actions">
          <button type="button" className="accent" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button type="button" onClick={download}>
            .txt
          </button>
        </div>
      </div>
      <textarea
        className="message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Generated message (editable)"
        spellCheck
      />
    </section>
  )
}
