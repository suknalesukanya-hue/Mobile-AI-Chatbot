import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSATIONS_KEY = '@mobile_ai_chatbot/conversations';
const OLD_CHAT_HISTORY_KEY = '@mobile_ai_chatbot/chat_history';

const createId = () =>
  `conversation_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const createTitle = (messages = []) => {
  const firstUserMessage = messages.find(
    (message) => message.role === 'user'
  );

  if (!firstUserMessage?.content) {
    return 'New Chat';
  }

  const text = firstUserMessage.content.trim();

  if (text.length <= 35) {
    return text;
  }

  return `${text.substring(0, 35).trim()}...`;
};

export const storageService = {
  async loadConversations() {
    try {
      const raw = await AsyncStorage.getItem(
        CONVERSATIONS_KEY
      );

      if (raw) {
        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
      }

      /*
       * Migrate the old single-chat history
       * into the new conversation system.
       */
      const oldRaw = await AsyncStorage.getItem(
        OLD_CHAT_HISTORY_KEY
      );

      if (!oldRaw) {
        return [];
      }

      try {
        const oldMessages = JSON.parse(oldRaw);

        if (
          !Array.isArray(oldMessages) ||
          oldMessages.length === 0
        ) {
          return [];
        }

        const now = Date.now();

        const migratedConversation = {
          id: createId(),
          title: createTitle(oldMessages),
          messages: oldMessages,
          createdAt: now,
          updatedAt: now,
        };

        await AsyncStorage.setItem(
          CONVERSATIONS_KEY,
          JSON.stringify([migratedConversation])
        );

        return [migratedConversation];
      } catch (migrationError) {
        console.warn(
          'storageService: migration failed',
          migrationError
        );

        return [];
      }
    } catch (err) {
      console.warn(
        'storageService: failed to load conversations',
        err
      );

      return [];
    }
  },

  async getConversation(conversationId) {
    try {
      const conversations =
        await this.loadConversations();

      return (
        conversations.find(
          (conversation) =>
            conversation.id === conversationId
        ) || null
      );
    } catch (err) {
      console.warn(
        'storageService: failed to get conversation',
        err
      );

      return null;
    }
  },

  async createConversation(messages = []) {
    try {
      const conversations =
        await this.loadConversations();

      const now = Date.now();

      const conversation = {
        id: createId(),
        title: createTitle(messages),
        messages,
        createdAt: now,
        updatedAt: now,
      };

      const updatedConversations = [
        conversation,
        ...conversations,
      ];

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );

      return conversation;
    } catch (err) {
      console.warn(
        'storageService: failed to create conversation',
        err
      );

      return null;
    }
  },

  async saveConversation(conversation) {
    try {
      if (!conversation?.id) {
        return null;
      }

      const conversations =
        await this.loadConversations();

      const existingIndex =
        conversations.findIndex(
          (item) => item.id === conversation.id
        );

      const updatedConversation = {
        ...conversation,
        title:
          conversation.title &&
          conversation.title !== 'New Chat'
            ? conversation.title
            : createTitle(conversation.messages),
        updatedAt: Date.now(),
      };

      let updatedConversations;

      if (existingIndex === -1) {
        updatedConversations = [
          updatedConversation,
          ...conversations,
        ];
      } else {
        updatedConversations = [
          updatedConversation,
          ...conversations.filter(
            (_, index) => index !== existingIndex
          ),
        ];
      }

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );

      return updatedConversation;
    } catch (err) {
      console.warn(
        'storageService: failed to save conversation',
        err
      );

      return null;
    }
  },

  async saveMessages(conversationId, messages) {
    try {
      const conversation =
        await this.getConversation(
          conversationId
        );

      if (!conversation) {
        return null;
      }

      return await this.saveConversation({
        ...conversation,
        messages,
        title: createTitle(messages),
      });
    } catch (err) {
      console.warn(
        'storageService: failed to save messages',
        err
      );

      return null;
    }
  },

  async renameConversation(
    conversationId,
    newTitle
  ) {
    try {
      const conversation =
        await this.getConversation(
          conversationId
        );

      if (!conversation) {
        return null;
      }

      const cleanTitle = newTitle?.trim();

      if (!cleanTitle) {
        return conversation;
      }

      return await this.saveConversation({
        ...conversation,
        title: cleanTitle,
      });
    } catch (err) {
      console.warn(
        'storageService: failed to rename conversation',
        err
      );

      return null;
    }
  },

  async deleteConversation(conversationId) {
    try {
      const conversations =
        await this.loadConversations();

      const updatedConversations =
        conversations.filter(
          (conversation) =>
            conversation.id !== conversationId
        );

      await AsyncStorage.setItem(
        CONVERSATIONS_KEY,
        JSON.stringify(updatedConversations)
      );

      return true;
    } catch (err) {
      console.warn(
        'storageService: failed to delete conversation',
        err
      );

      return false;
    }
  },

  async clearConversations() {
    try {
      await AsyncStorage.removeItem(
        CONVERSATIONS_KEY
      );

      await AsyncStorage.removeItem(
        OLD_CHAT_HISTORY_KEY
      );

      return true;
    } catch (err) {
      console.warn(
        'storageService: failed to clear conversations',
        err
      );

      return false;
    }
  },

  async searchConversations(query) {
    try {
      const conversations =
        await this.loadConversations();

      const searchText =
        query?.trim().toLowerCase();

      if (!searchText) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const titleMatch =
            conversation.title
              ?.toLowerCase()
              .includes(searchText);

          const messageMatch =
            conversation.messages?.some(
              (message) =>
                message.content
                  ?.toLowerCase()
                  .includes(searchText)
            );

          return titleMatch || messageMatch;
        }
      );
    } catch (err) {
      console.warn(
        'storageService: search failed',
        err
      );

      return [];
    }
  },

  /*
   * Backward compatibility with your old code.
   */
  async loadMessages() {
    try {
      const conversations =
        await this.loadConversations();

      if (conversations.length === 0) {
        return [];
      }

      return conversations[0].messages || [];
    } catch (err) {
      console.warn(
        'storageService: failed to load messages',
        err
      );

      return [];
    }
  },

  async saveMessagesLegacy(messages) {
    try {
      const conversations =
        await this.loadConversations();

      if (conversations.length === 0) {
        return await this.createConversation(
          messages
        );
      }

      return await this.saveMessages(
        conversations[0].id,
        messages
      );
    } catch (err) {
      console.warn(
        'storageService: failed to save legacy messages',
        err
      );

      return null;
    }
  },

  async clearMessages() {
    try {
      await this.clearConversations();
    } catch (err) {
      console.warn(
        'storageService: failed to clear messages',
        err
      );
    }
  },
};