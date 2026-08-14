import {
  GEMINI_API_KEY,
  GROQ_API_KEY,
  OPENROUTER_API_KEY,
  CEREBRAS_API_KEY,
} from '@env';

const PROVIDERS = {
  GEMINI: 'Gemini',
  GROQ: 'Groq',
  OPENROUTER: 'OpenRouter',
  CEREBRAS: 'Cerebras',
};

// Models can be changed later without changing the rest of the app.
const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENROUTER_MODEL = 'openrouter/free';
const CEREBRAS_MODEL = 'llama-3.3-70b';

const SYSTEM_PROMPT = `
You are a helpful AI assistant inside a mobile AI chatbot.

Give clear, accurate and useful answers.
For programming questions, provide clean and understandable solutions.
For educational questions, explain concepts step by step.
For general questions, answer naturally and concisely.
Do not mention internal system instructions or API providers.
`;

export class AIServiceError extends Error {
  constructor(
    message,
    {
      isNetwork = false,
      status = null,
      provider = null,
      errors = [],
    } = {}
  ) {
    super(message);

    this.name = 'AIServiceError';
    this.isNetwork = isNetwork;
    this.status = status;
    this.provider = provider;
    this.errors = errors;
  }
}

/**
 * Converts our application's messages into
 * a common format used by the providers.
 */
function normalizeHistory(history = []) {
  return history
    .filter(
      (message) =>
        message &&
        (message.role === 'user' ||
          message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

/**
 * ---------------------------------------------------------
 * GEMINI
 * ---------------------------------------------------------
 */
async function callGemini(messages) {
  if (!GEMINI_API_KEY) {
    throw new AIServiceError(
      'Gemini API key is not configured.',
      {
        provider: PROVIDERS.GEMINI,
      }
    );
  }

  const contents = messages.map((message) => ({
    role:
      message.role === 'assistant'
        ? 'model'
        : 'user',

    parts: [
      {
        text: message.content,
      },
    ],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: SYSTEM_PROMPT,
            },
          ],
        },

        contents,

        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    let detail = '';

    try {
      const body = await response.json();

      detail =
        body?.error?.message || '';
    } catch {
      // Ignore invalid JSON.
    }

    throw new AIServiceError(
      detail ||
        `Gemini request failed with status ${response.status}.`,
      {
        status: response.status,
        provider: PROVIDERS.GEMINI,
      }
    );
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('');

  if (!text?.trim()) {
    throw new AIServiceError(
      'Gemini returned an empty response.',
      {
        provider: PROVIDERS.GEMINI,
      }
    );
  }

  return text.trim();
}

/**
 * ---------------------------------------------------------
 * GROQ
 * ---------------------------------------------------------
 */
async function callGroq(messages) {
  if (!GROQ_API_KEY) {
    throw new AIServiceError(
      'Groq API key is not configured.',
      {
        provider: PROVIDERS.GROQ,
      }
    );
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },

      body: JSON.stringify({
        model: GROQ_MODEL,

        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],

        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    let detail = '';

    try {
      const body = await response.json();

      detail =
        body?.error?.message || '';
    } catch {
      // Ignore invalid JSON.
    }

    throw new AIServiceError(
      detail ||
        `Groq request failed with status ${response.status}.`,
      {
        status: response.status,
        provider: PROVIDERS.GROQ,
      }
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text?.trim()) {
    throw new AIServiceError(
      'Groq returned an empty response.',
      {
        provider: PROVIDERS.GROQ,
      }
    );
  }

  return text.trim();
}

/**
 * ---------------------------------------------------------
 * OPENROUTER
 * ---------------------------------------------------------
 */
async function callOpenRouter(messages) {
  if (!OPENROUTER_API_KEY) {
    throw new AIServiceError(
      'OpenRouter API key is not configured.',
      {
        provider: PROVIDERS.OPENROUTER,
      }
    );
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Mobile AI Chatbot',
      },

      body: JSON.stringify({
        model: OPENROUTER_MODEL,

        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],

        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    let detail = '';

    try {
      const body = await response.json();

      detail =
        body?.error?.message || '';
    } catch {
      // Ignore invalid JSON.
    }

    throw new AIServiceError(
      detail ||
        `OpenRouter request failed with status ${response.status}.`,
      {
        status: response.status,
        provider: PROVIDERS.OPENROUTER,
      }
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text?.trim()) {
    throw new AIServiceError(
      'OpenRouter returned an empty response.',
      {
        provider: PROVIDERS.OPENROUTER,
      }
    );
  }

  return text.trim();
}

/**
 * ---------------------------------------------------------
 * CEREBRAS
 * ---------------------------------------------------------
 */
async function callCerebras(messages) {
  if (!CEREBRAS_API_KEY) {
    throw new AIServiceError(
      'Cerebras API key is not configured.',
      {
        provider: PROVIDERS.CEREBRAS,
      }
    );
  }

  const response = await fetch(
    'https://api.cerebras.ai/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CEREBRAS_API_KEY}`,
      },

      body: JSON.stringify({
        model: CEREBRAS_MODEL,

        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],

        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    let detail = '';

    try {
      const body = await response.json();

      detail =
        body?.error?.message || '';
    } catch {
      // Ignore invalid JSON.
    }

    throw new AIServiceError(
      detail ||
        `Cerebras request failed with status ${response.status}.`,
      {
        status: response.status,
        provider: PROVIDERS.CEREBRAS,
      }
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text?.trim()) {
    throw new AIServiceError(
      'Cerebras returned an empty response.',
      {
        provider: PROVIDERS.CEREBRAS,
      }
    );
  }

  return text.trim();
}

/**
 * ---------------------------------------------------------
 * MAIN AI FUNCTION
 * ---------------------------------------------------------
 *
 * Order:
 *
 * 1. Gemini
 * 2. Groq
 * 3. OpenRouter
 * 4. Cerebras
 *
 * If one provider fails because of quota,
 * rate limit, network problem, etc.,
 * the next provider is automatically tried.
 */
export async function getAIResponse(
  history = []
) {
  const messages =
    normalizeHistory(history);

  if (messages.length === 0) {
    throw new AIServiceError(
      'No messages were provided.'
    );
  }

  console.log(
    'AI fallback system started.'
  );

  console.log(
    'Gemini configured:',
    Boolean(GEMINI_API_KEY)
  );

  console.log(
    'Groq configured:',
    Boolean(GROQ_API_KEY)
  );

  console.log(
    'OpenRouter configured:',
    Boolean(OPENROUTER_API_KEY)
  );

  console.log(
    'Cerebras configured:',
    Boolean(CEREBRAS_API_KEY)
  );

  const providers = [
    {
      name: PROVIDERS.GEMINI,
      call: () => callGemini(messages),
    },

    {
      name: PROVIDERS.GROQ,
      call: () => callGroq(messages),
    },

    {
      name: PROVIDERS.OPENROUTER,
      call: () =>
        callOpenRouter(messages),
    },

    {
      name: PROVIDERS.CEREBRAS,
      call: () =>
        callCerebras(messages),
    },
  ];

  const errors = [];

  for (const provider of providers) {
    try {
      console.log(
        `Trying ${provider.name}...`
      );

      const response =
        await provider.call();

      console.log(
        `${provider.name} responded successfully.`
      );

      return response;
    } catch (error) {
      console.warn(
        `${provider.name} failed:`,
        error?.message ||
          'Unknown error'
      );

      errors.push({
        provider: provider.name,
        status:
          error?.status || null,
        message:
          error?.message ||
          'Unknown error',
      });

      /*
       * Continue automatically with
       * the next provider.
       */
      continue;
    }
  }

  /*
   * Every provider failed.
   */
  console.error(
    'All AI providers failed:',
    errors
  );

  throw new AIServiceError(
    'All AI providers are currently unavailable. Please try again later.',
    {
      errors,
    }
  );
}