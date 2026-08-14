# Mobile AI Chatbot

A React Native (Expo) mobile app for chatting with an AI assistant. Built for
the technical evaluation — chat interface, AI integration, persisted history,
loading states, and error handling.

## Features

- Clean, responsive chat UI (message bubbles, timestamps, auto-scroll)
- AI integration via the OpenAI Chat Completions API
- Chat history persisted locally with `AsyncStorage` (survives app restarts)
- Typing/loading indicator while waiting on a response
- Error handling with a dismissible banner and one-tap retry for failed sends
- Clear-chat action

## Tech Stack

- **React Native** + **Expo** (SDK 51) — fastest path to a runnable app on
  iOS, Android, and web without native build tooling
- **@react-native-async-storage/async-storage** — local persistence
- **react-native-dotenv** — loads the API key from `.env` instead of hardcoding it
- **react-native-uuid** — message IDs
- No navigation library is used since the app is single-screen; would add
  `@react-navigation/native` if the scope grew (e.g. a chat list + detail view)

## Project Structure

```
mobile-ai-chatbot/
├── App.js                      # App root
├── app.json                    # Expo config
├── babel.config.js             # Enables @env imports
├── .env.example                # Copy to .env and add your key
├── src/
│   ├── screens/
│   │   └── ChatScreen.js       # Composes the chat UI
│   ├── components/
│   │   ├── MessageBubble.js    # Single message rendering
│   │   ├── ChatInput.js        # Text input + send button
│   │   ├── LoadingIndicator.js # Animated "typing" dots
│   │   └── ErrorBanner.js      # Error display with retry/dismiss
│   ├── hooks/
│   │   └── useChat.js          # Chat state: send, retry, clear, persistence
│   ├── services/
│   │   ├── aiService.js        # OpenAI API call, provider-agnostic call site
│   │   └── storageService.js   # AsyncStorage read/write, isolated interface
│   ├── constants/
│   │   └── theme.js            # Colors, spacing, radius, type scale
│   └── utils/
│       └── helpers.js          # Small formatting/message-shape helpers
```

### Why this shape

- **`services/` isolates I/O.** `aiService.js` is the only file that knows
  about OpenAI's request/response shape; `storageService.js` is the only file
  that touches `AsyncStorage`. Swapping OpenAI for Gemini, or AsyncStorage for
  SQLite, means editing one file each — nothing else changes.
- **`useChat` is the single source of truth for chat state.** The screen and
  components stay presentational; all the logic for sending, retrying,
  persisting, and error state lives in one testable hook.
- **Components are small and single-purpose** so they're easy to reuse or
  restyle independently (e.g. swapping `MessageBubble` styling without
  touching send logic).

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone (easiest way to test), or an iOS/Android
  simulator
- An OpenAI API key: https://platform.openai.com/api-keys

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.example .env
# then edit .env and paste in your OPENAI_API_KEY

# 3. Start the dev server
npx expo start
```

Then either:
- Scan the QR code with the Expo Go app (iOS/Android), or
- Press `i` for the iOS simulator, `a` for the Android emulator, or `w` for web

### Switching AI providers

`src/services/aiService.js` is the only file that talks to the AI provider.
To use Gemini (or another provider) instead of OpenAI, replace the `fetch`
call and response parsing in that file — the rest of the app is unaffected
since `useChat.js` only calls `getAIResponse(history)` and expects a string
back.

## Third-Party Libraries / AI Services Used

| Library | Purpose |
|---|---|
| `expo` | React Native tooling/runtime |
| `@react-native-async-storage/async-storage` | Local chat history persistence |
| `react-native-dotenv` | Loads API key from `.env`, keeps secrets out of source |
| `react-native-uuid` | Generates unique message IDs |
| OpenAI Chat Completions API (`gpt-4o-mini` by default) | AI responses |

## Known Limitations / Next Steps

- API key is loaded client-side via `.env`, which is fine for local
  development but not safe for a production app store build — a real
  deployment should proxy requests through a backend so the key is never
  bundled into the client.
- No streaming responses yet (`fetch` waits for the full completion); could
  switch to SSE streaming for a more responsive feel.
- No multi-conversation support — one continuous history. Adding a
  conversation list would need a navigation library and a change to the
  storage key structure (e.g. `chat_<id>`).
