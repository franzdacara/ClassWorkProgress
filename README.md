# Classwork Progress Updates

A one-page React app that helps teachers turn a student's name and a few quick notes into a warm, parent-ready progress message (emojis, goals, reminders and sign-off), ready to paste into Messenger, Viber or any chat app.

Built with React 18 and Vite. Works on desktop and phones, in light or dark mode.

## Features

- **Two inputs, one message:** student name and your notes (accomplishments, tasks, areas to improve).
- **Message layout:** greeting, 📚 Classwork Progress, 📌 Instructions / Reminders, 🎯 Goals, a note to the student, a thank-you to the parent, and the teacher's sign-off.
- **Settings:** pronouns (she / he / they), teacher name, how to address the parent (Ma'am / Sir / Parent), and language (Taglish or English).
- **Two writing modes:**
  - **AI-written** uses [OpenRouter](https://openrouter.ai) free models and writes natural, personalised wording. It tries several models in order, so a busy one doesn't block you.
  - **Quick template** works offline. It uses your notes as written with generic reminders and goals.
- **Editable result:** tweak the message, then **Copy** or download it as `.txt`.
- **One-page layout:** fills the screen with no page scroll. On phones it switches to two tabs (Details / Message).
- **Light and dark mode:** follows your device and remembers your choice.

## Getting started

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
cp .env.example .env     # then add your OpenRouter key (see below)
npm run dev
```

Open the local address Vite prints (usually http://localhost:5173).

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |

## Configuration (`.env`)

| Variable | Description |
|---|---|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key. Create one at https://openrouter.ai/keys |
| `VITE_OPENROUTER_MODEL` | One or more model ids, comma-separated. They are tried in order. If one is busy, errors, or returns nothing, the next is used. |

Default model list:

```
google/gemma-4-31b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-a4b-it:free,openrouter/free
```

Notes:

- Restart `npm run dev` after editing `.env`. Vite only reads it at startup.
- If no key is set in `.env`, the app shows a key field instead. A pasted key can be remembered in the browser's local storage.
- `.env` is git-ignored. Only `.env.example` is committed.
- Free models share rate limits (roughly 20 requests per minute and 50 per day, higher with OpenRouter credit). Very small models can invent details, so the default list uses larger ones. Always read the message before sending it.
- Use only the child's first name in notes where possible. Free models may log prompts.

## Security note

Variables starting with `VITE_` are bundled into the browser code, so anyone who can open a deployed copy of the site can read the API key. That is fine when running on your own computer. Before hosting this publicly, move the OpenRouter call to a small server (or serverless function) and keep the key there.

## Project structure

```
src/
  App.jsx                  Layout, theme, tabs, generate flow
  components/
    ReportForm.jsx         Inputs, settings and mode switch
    ReportView.jsx         Loader, editable message, copy / download
  lib/
    aiReport.js            OpenRouter call with model fallback + prompt
    offlineReport.js       Offline template generator
    notes.js               Parses the teacher's notes
    profile.js             Pronouns and name helpers
  styles.css               Theme tokens and responsive layout
```

## How the AI prompt works

The prompt in `src/lib/aiReport.js` tells the model to follow the exact message layout above, using a sample message as a style reference. It must base everything only on the teacher's notes, use the chosen pronouns, and not invent scores, events or achievements. To change the tone or layout, edit `systemPrompt()` and the `EXAMPLE` text in that file.

## Credits

© 2026 Nikko Dacara
