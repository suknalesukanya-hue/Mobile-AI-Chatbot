# Mobile AI Chatbot

A React Native (Expo) mobile app for chatting with an AI assistant. Built for
the technical evaluation with a clean chat interface, multi-provider AI
integration, automatic provider fallback, persisted chat history, loading
states, and robust error handling.

---

## Features

- 🤖 AI-powered conversational chatbot
- 🔄 Automatic multi-provider AI fallback
- 🧠 Google Gemini as the primary AI provider
- ⚡ Groq as the first fallback provider
- 🌐 OpenRouter as the second fallback provider
- 💬 Persistent chat history using AsyncStorage
- 🆕 New conversation support
- 📱 Cross-platform React Native + Expo application
- ⌨️ Typing/loading indicator while waiting for an AI response
- 🔁 Retry support for failed requests
- 🗑️ Clear-chat functionality
- ⚠️ Network, API, quota, and rate-limit error handling
- 🔐 Environment-based API configuration
- 🧩 Clean and modular project architecture

---

# AI Provider Fallback

The application uses multiple AI providers to improve reliability.

If the primary provider fails because of a quota limit, rate limit,
network error, authentication issue, or temporary service problem,
the application automatically attempts the next provider.

```text
                         USER MESSAGE
                              │
                              ▼
                 ┌────────────────────────┐
                 │     GOOGLE GEMINI      │
                 │       PRIMARY AI       │
                 └───────────┬────────────┘
                             │
                       Request fails?
                             │
                             ▼
                 ┌────────────────────────┐
                 │          GROQ          │
                 │      FALLBACK #1       │
                 └───────────┬────────────┘
                             │
                       Request fails?
                             │
                             ▼
                 ┌────────────────────────┐
                 │       OPENROUTER       │
                 │      FALLBACK #2       │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │      AI RESPONSE       │
                 └────────────────────────┘
```

### Provider Priority

```text
Google Gemini
      ↓
     Groq
      ↓
  OpenRouter
```

This approach prevents a temporary provider failure from immediately
interrupting the user's conversation.

---

# Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile application |
| Expo | React Native development and runtime |
| JavaScript | Application development |
| AsyncStorage | Local chat history persistence |
| react-native-dotenv | Environment variable configuration |
| react-native-uuid | Unique message IDs |
| Google Gemini API | Primary AI provider |
| Groq API | First fallback AI provider |
| OpenRouter API | Second fallback AI provider |

---

# Project Structure

```text
mobile-ai-chatbot/
│
├── App.js                      # App root
├── app.json                    # Expo configuration
├── babel.config.js             # Environment configuration
├── package.json                # Project dependencies
├── .env.example                # Environment variable template
├── .gitignore                  # Ignored files and secrets
├── README.md                   # Project documentation
│
└── src/
    │
    ├── screens/
    │   └── ChatScreen.js       # Main chat screen
    │
    ├── components/
    │   ├── MessageBubble.js    # Individual message rendering
    │   ├── ChatInput.js        # Text input and send button
    │   ├── LoadingIndicator.js # Animated typing indicator
    │   └── ErrorBanner.js      # Error display and retry
    │
    ├── hooks/
    │   └── useChat.js          # Chat state and operations
    │
    ├── services/
    │   ├── aiService.js        # AI providers and fallback logic
    │   └── storageService.js   # AsyncStorage persistence
    │
    ├── constants/
    │   └── theme.js            # Colors, spacing and typography
    │
    └── utils/
        └── helpers.js          # Utility/helper functions
```

---

# Architecture

The application follows a modular architecture where the UI, chat state,
AI communication, storage, and utility functions are separated.

## 1. Screen Layer

The screen layer handles the main mobile chat interface.

The main screen is:

```text
src/screens/ChatScreen.js
```

It is responsible for displaying the conversation and connecting the UI
with the chat logic.

---

## 2. Component Layer

Reusable UI components are kept inside:

```text
src/components/
```

Examples include:

```text
MessageBubble.js
ChatInput.js
LoadingIndicator.js
ErrorBanner.js
```

Each component has a focused responsibility, making the interface easier
to maintain and modify.

---

## 3. Chat State Layer

Chat state and message operations are handled through:

```text
src/hooks/useChat.js
```

The chat logic manages:

- Sending messages
- Receiving AI responses
- Maintaining conversation history
- Loading saved messages
- Saving messages
- Clearing messages
- Retrying failed requests
- Loading states
- Error states

This keeps business logic separate from the presentation layer.

---

## 4. AI Service Layer

All AI provider communication is isolated inside:

```text
src/services/aiService.js
```

The application exposes a common function:

```javascript
getAIResponse(history)
```

The UI does not need to know whether the response came from Gemini,
Groq, or OpenRouter.

This makes the AI integration easier to maintain and extend.

---

## 5. Storage Layer

Local persistence is isolated inside:

```text
src/services/storageService.js
```

The storage service provides:

```javascript
loadMessages()
saveMessages(messages)
clearMessages()
```

AsyncStorage is used to persist the conversation locally.

This separation also makes it easier to replace AsyncStorage with a
database or cloud storage solution in the future.

---

# Why This Architecture?

The project is designed around separation of responsibilities.

### Services isolate external communication

`aiService.js` handles AI provider communication.

`storageService.js` handles local persistence.

The UI does not directly communicate with external AI APIs or AsyncStorage.

### Chat logic is separated from UI

The `useChat` hook contains the main chat state and operations, while
components remain focused on presentation.

### Components are reusable

Small components such as `MessageBubble`, `ChatInput`, and
`LoadingIndicator` can be independently modified or reused.

### Easy to scale

A new AI provider can be added inside the AI service without requiring
major changes to the rest of the application.

---

# Chat History

The application persists chat messages locally using AsyncStorage.

This means the conversation can survive an application restart.

The storage layer supports:

```text
┌──────────────────────────────┐
│       Chat History           │
├──────────────────────────────┤
│ Load previous messages       │
│ Save new messages            │
│ Clear conversation           │
└──────────────────────────────┘
```

The current implementation uses local storage. A future version can
synchronize conversations with a backend database.

---

# Error Handling

The application handles common AI service failures including:

- Missing API credentials
- Network connectivity errors
- Invalid API responses
- Authentication/API errors
- Rate limits
- Provider quota exhaustion
- Empty AI responses
- Temporary provider failures

When a provider fails, the fallback system automatically attempts the
next provider.

```text
Provider 1
    │
    ├── Success ──────► Response
    │
    └── Failure
          │
          ▼
Provider 2
    │
    ├── Success ──────► Response
    │
    └── Failure
          │
          ▼
Provider 3
    │
    ├── Success ──────► Response
    │
    └── Failure
          │
          ▼
     Error Message
```

---

# Setup

## Prerequisites

Install the following before running the application:

- Node.js 18+
- npm or yarn
- Expo
- Expo Go for physical-device testing
- Android Studio for Android emulator testing
- iOS simulator for iOS development on macOS

---

## 1. Clone the Repository

```bash
git clone https://github.com/suknalesukanya-hue/Mobile-AI-Chatbot.git
```

---

## 2. Enter the Project Directory

```bash
cd Mobile-AI-Chatbot
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as the template.

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Important

Never commit your real API keys to GitHub.

The `.env` file should remain private.

---

## 5. Start the Application

```bash
npx expo start
```

For a clean cache restart:

```bash
npx expo start -c
```

Then choose one of the following:

```text
┌───────────────────────────────────┐
│       Run Mobile AI Chatbot       │
├───────────────────────────────────┤
│                                   │
│  📱 Scan QR → Expo Go             │
│                                   │
│  🤖 Press A → Android Emulator    │
│                                   │
│  🍎 Press I → iOS Simulator       │
│                                   │
│  🌐 Press W → Web                 │
│                                   │
└───────────────────────────────────┘
```

---

# Environment Variables

The project uses the following environment variables:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini authentication |
| `GROQ_API_KEY` | Groq authentication |
| `OPENROUTER_API_KEY` | OpenRouter authentication |

The repository does not contain the actual API keys.

---

# Third-Party Libraries and AI Services

| Library / Service | Purpose |
|---|---|
| `expo` | React Native development and runtime |
| `@react-native-async-storage/async-storage` | Local chat history |
| `react-native-dotenv` | Environment configuration |
| `react-native-uuid` | Unique message IDs |
| Google Gemini API | Primary AI provider |
| Groq API | First fallback provider |
| OpenRouter API | Second fallback provider |

---

# Security Considerations

API credentials are loaded through environment variables rather than being
hardcoded into the source code.

The following files and folders are excluded from version control:

```text
.env
node_modules/
*.zip
```

For a production application, AI requests should preferably be routed
through a secure backend.

This would prevent provider API credentials from being exposed inside
the mobile application bundle.

---

# Scalability

The application is structured so that individual layers can be extended
without rewriting the entire application.

For example, a new AI provider can be added to:

```text
src/services/aiService.js
```

without changing:

```text
ChatScreen.js
```

or the main chat components.

Similarly, AsyncStorage can later be replaced with a backend database
through the storage layer.

This architecture makes the project easier to maintain and scale.

---

# Known Limitations / Next Steps

- API keys are currently configured through environment variables on the
  client. A production version should use a secure backend.
- AI responses currently wait for the complete response rather than
  streaming tokens in real time.
- Chat history is currently stored locally and is not synchronized between
  multiple devices.
- The current implementation can be extended to support multiple
  independent conversations.
- User authentication can be added for personalized cloud-based history.
- Voice input and output can be added in a future version.
- Image-based AI interaction can be added in a future version.

---

# Future Enhancements

Possible future improvements include:

- User authentication
- Google Sign-In
- Cloud-synchronized chat history
- Multiple conversations
- Chat search
- Rename and delete conversations
- Streaming AI responses
- Voice input
- Voice output
- Image understanding
- Backend API integration
- Secure server-side API key management
- Usage analytics
- Push notifications
- AI model selection

---

# Project Repository

Complete source code:

https://github.com/suknalesukanya-hue/Mobile-AI-Chatbot

---

# Author

**Sukanya**

React Native Mobile AI Chatbot  
Technical Evaluation Project