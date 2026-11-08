// Turn the teacher's free-form notes into a clean list of accomplishments.
export function parseNotes(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•–—]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)

  // A single line with semicolons is treated as a list too.
  if (lines.length === 1 && lines[0].includes(';')) {
    return lines[0]
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return lines
}

export function stripEndPunctuation(s) {
  return s.replace(/[\s.;,]+$/, '')
}

export function lowerFirst(s) {
  // Keep acronyms / proper nouns (e.g. "STEM") intact.
  if (/^[A-Z]{2,}/.test(s)) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}
