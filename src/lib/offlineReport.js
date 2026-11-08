import { parseNotes, stripEndPunctuation } from './notes.js'
import { PRONOUNS, firstName } from './profile.js'

// Offline fallback: builds the parent update in the same layout as the AI version,
// using the teacher's own notes for the progress section and neutral wording elsewhere.
export function generateOfflineReport({ name, notes, pronoun, parentTitle, teacher, language }) {
  const first = firstName(name)
  const p = PRONOUNS[pronoun] || PRONOUNS.they
  const items = parseNotes(notes).map(stripEndPunctuation)
  const taglish = language === 'taglish'
  const po = taglish ? ' po' : ''
  const addr = parentTitle ? `${parentTitle}` : 'Parent'

  const greeting = taglish
    ? `Hello po, ${addr}! 👋😊 Mag-update lang po kami regarding sa classwork progress ni ${first}.`
    : `Hello, ${addr}! 👋😊 We would like to share an update on ${first}'s classwork progress.`

  const progress = items.map((i) => `🌟 ${i}.`).join('\n\n')

  const reminders = [
    `Encourage ${first} to keep practicing the activities done in class.`,
    `Give extra practice to the topics ${first} is still learning.`,
    `Praise ${p.poss} effort and remind ${p.obj} that it is okay to take ${p.poss} time.`,
  ]
  const goals = [
    `To become more confident in the skills covered in class.`,
    `To complete activities with less guidance.`,
    `To keep improving through regular practice.`,
  ]

  const thanks = taglish
    ? `Thank you so much po, ${addr}, for your continuous support at home! Kindly continue practicing the lessons with ${first}. Regular practice will help ${p.obj} remember what ${p.subj} learns. Thank you po for your guidance and support! 🥰🩵`
    : `Thank you so much, ${addr}, for your continuous support at home! Kindly continue practicing the lessons with ${first}. Regular practice will help ${p.obj} remember what ${p.subj} learns. Thank you for your guidance and support! 🥰🩵`

  return [
    greeting,
    '📚 CLASSWORK PROGRESS',
    progress,
    '📌 INSTRUCTIONS / REMINDERS',
    reminders.join('\n\n'),
    '🎯 GOALS',
    goals.join('\n\n'),
    `Keep up the good work, ${first}! It's okay to take your time as you learn. With more practice and guidance, you'll become more confident. Keep trying! 👏`,
    thanks,
    `See you in our next class, ${first}!`,
    `— Teacher${teacher ? ' ' + teacher : ''} 🩵`,
  ].join('\n\n')
}
