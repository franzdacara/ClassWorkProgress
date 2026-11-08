import { parseNotes } from './notes.js'
import { PRONOUNS, firstName } from './profile.js'

export const ENV_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim()
// One or more model ids, comma-separated. They are tried in order; if one is busy
// (rate-limited), errors, or returns nothing, the next one is used.
export const MODELS = (import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean)

// The teacher's own sample, used as a style/format reference.
const EXAMPLE = `Hello po, Ma’am! 👋😊 Mag-update lang po kami regarding sa classwork progress ni Caliegh.

📚 CLASSWORK PROGRESS

Caliegh is gradually developing her skills in identifying and saying individual letter sounds with the guidance of the teacher.

🌟 We also noticed that she is still a little confused with some letter sounds, so she needs more practice and repetition to become familiar with each sound. We are continuously guiding her by letting her listen, repeat, and identify the sounds while looking at the letters.

She is also practicing proper letter formation by tracing each letter, using the circle as her starting-point guide. With consistent practice, she is gradually improving her pencil control and becoming more familiar with writing letters.

📌 INSTRUCTIONS / REMINDERS

Encourage Caliegh to listen carefully and repeat each letter sound.

Give extra practice to the letter sounds she still finds confusing.

Remind her to start tracing from the correct starting point.

Encourage her to trace slowly and follow the proper strokes.

🎯 GOALS

To recognize and say individual letter sounds with less guidance.

To become more familiar with the different letter sounds.

To develop proper pencil control and letter formation.

To become more confident in tracing and writing letters independently.

Keep up the good work, Caliegh! It’s okay to take your time as you learn. With more practice and guidance, you’ll become more confident in recognizing letter sounds and writing letters. Keep trying! 👏

Thank you so much po, Ma’am, for your continuous support at home! Kindly continue practicing simple letter sounds and tracing activities with Caliegh. Give extra attention to the sounds she still finds confusing. Regular practice will help her remember the sounds better and improve her writing skills. Thank you po for your guidance and support! 🥰🩵

See you in our next class, Caliegh!

— Teacher Coleen 🩵`

function systemPrompt({ language }) {
  const langRule =
    language === 'taglish'
      ? 'Write in the same warm Filipino-English (Taglish) style as the example: Taglish greeting and thank-you lines with "po", and English for the progress, reminders and goals.'
      : 'Write everything in warm, simple English. Do not use Filipino words or "po".'

  return `You are an expert educational assistant helping a preschool/early-grade teacher write a short progress update message to a student's parent. The message is sent through a chat app, so it is plain text with emojis, no markdown symbols.

You receive: the student's name, pronouns, how to address the parent, the teacher's name, and the teacher's brief notes on what the student did and where the student needs help.

Write the message using EXACTLY this layout, in this order, matching the tone, emojis, spacing (one blank line between every paragraph or line item) and level of detail of the example below:
1. Greeting line that addresses the parent and says this is an update on the student's classwork progress.
2. "📚 CLASSWORK PROGRESS" heading, then 2-3 short paragraphs. Describe progress and mastery positively. If the notes mention difficulties, gently note them, starting that paragraph with 🌟, and say how the teacher is guiding the student.
3. "📌 INSTRUCTIONS / REMINDERS" heading, then 3-5 one-line reminders for the parent, each starting with an action verb (Encourage, Give, Remind...). No bullet symbols.
4. "🎯 GOALS" heading, then 3-5 one-line goals, each starting with "To".
5. A short encouraging paragraph addressed directly to the student, ending with 👏.
6. A thank-you paragraph to the parent asking them to keep practicing at home, ending with 🥰🩵.
7. "See you in our next class, <student first name>!"
8. Sign-off: "— Teacher <teacher name> 🩵"

Rules:
- Base everything ONLY on the teacher's notes. Do not invent scores, events, behaviours or achievements. Reminders and goals must follow from the notes.
- Tone: encouraging, professional, objective, supportive, suitable for parents.
- Use the pronouns given for the student (he/him/his, she/her/her, or they/them/their). Never guess.
- Use the student's first name in the text.
- ${langRule}
- Output ONLY the message text. No preface, no markdown fences, no explanation.

EXAMPLE (for format and tone only; do not copy its content):
"""
${EXAMPLE}
"""`
}

export async function generateAiReport(input, apiKey, signal) {
  const { name, notes, pronoun, parentTitle, teacher } = input
  const p = PRONOUNS[pronoun] || PRONOUNS.they
  const bullets = parseNotes(notes)
  const userMessage = [
    `Student: ${firstName(name)} (full name: ${name.trim()})`,
    `Pronouns: ${p.subj}/${p.obj}/${p.poss}`,
    `Address the parent as: ${parentTitle || 'Parent'}`,
    `Teacher name: ${teacher || '(not given - sign off as "— Teacher 🩵")'}`,
    `Teacher's notes:`,
    ...bullets.map((b) => `- ${b}`),
  ].join('\n')

  // Gemma-family models reject a separate system role, so the instructions are
  // sent at the top of the single user message (works for every OpenRouter model).
  const content = `${systemPrompt(input)}

---

${userMessage}`
  let lastError = null

  for (const model of MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
          'X-Title': 'Classwork Progress Updates',
        },
        body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content }] }),
      })

      if (res.status === 401) {
        throw Object.assign(new Error('The OpenRouter API key was rejected. Please check it and try again.'), { fatal: true })
      }
      if (!res.ok) {
        let detail = ''
        try {
          detail = (await res.json())?.error?.message || ''
        } catch {
          /* ignore */
        }
        throw new Error(
          res.status === 429
            ? 'The free models are busy right now (rate-limited). Please wait a few seconds and try again.'
            : `Request failed (${res.status}). ${detail}`.trim(),
        )
      }

      const data = await res.json()
      const text = (data.choices?.[0]?.message?.content || '').trim()
      if (!text) throw new Error('The AI returned an empty response. Please try again.')
      return text
    } catch (err) {
      if (err.name === 'AbortError' || err.fatal) throw err
      lastError = err // try the next model in the list
    }
  }
  throw lastError || new Error('No AI model is configured.')
}
