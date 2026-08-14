import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import uuid from 'react-native-uuid';

import {
  getAIResponse,
  AIServiceError,
} from '../services/aiService';

import { storageService } from '../services/storageService';

import { createMessage } from '../utils/helpers';

export function useChat() {
  const [messages, setMessages] =
    useState([]);

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    currentConversationId,
    setCurrentConversationId,
  ] = useState(null);

  const [
    isHistoryLoaded,
    setIsHistoryLoaded,
  ] = useState(false);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [error, setError] =
    useState(null);

  const hasLoadedRef =
    useRef(false);

  /*
   * Load all conversations when
   * the application starts.
   */
  useEffect(() => {
    const loadChatHistory =
      async () => {
        try {
          const stored =
            await storageService.loadConversations();

          setConversations(stored);

          /*
           * Open the most recently used
           * conversation automatically.
           */
          if (stored.length > 0) {
            const latest =
              stored[0];

            setCurrentConversationId(
              latest.id
            );

            setMessages(
              latest.messages || []
            );
          } else {
            setMessages([]);
            setCurrentConversationId(
              null
            );
          }
        } catch (err) {
          console.warn(
            'useChat: failed to load history',
            err
          );

          setError(
            'Unable to load your chat history.'
          );
        } finally {
          setIsHistoryLoaded(true);
          hasLoadedRef.current = true;
        }
      };

    loadChatHistory();
  }, []);

  /*
   * Refresh the conversation list.
   */
  const refreshConversations =
    useCallback(async () => {
      try {
        const stored =
          await storageService.loadConversations();

        setConversations(stored);

        return stored;
      } catch (err) {
        console.warn(
          'useChat: failed to refresh conversations',
          err
        );

        return [];
      }
    }, []);

  /*
   * Start a completely new chat.
   */
  const newChat =
    useCallback(() => {
      setMessages([]);
      setCurrentConversationId(
        null
      );
      setError(null);
      setIsSending(false);
    }, []);

  /*
   * Open an old conversation.
   */
  const openConversation =
    useCallback(
      async (conversationId) => {
        try {
          setError(null);

          const conversation =
            await storageService.getConversation(
              conversationId
            );

          if (!conversation) {
            setError(
              'Conversation not found.'
            );
            return;
          }

          setCurrentConversationId(
            conversation.id
          );

          setMessages(
            conversation.messages || []
          );
        } catch (err) {
          console.warn(
            'useChat: failed to open conversation',
            err
          );

          setError(
            'Unable to open this conversation.'
          );
        }
      },
      []
    );

  /*
   * Send message to AI.
   */
  const sendMessage =
    useCallback(
      async (text) => {
        const trimmed =
          text?.trim();

        if (
          !trimmed ||
          isSending
        ) {
          return;
        }

        setError(null);
        setIsSending(true);

        const userMessage =
          createMessage({
            id: uuid.v4(),
            role: 'user',
            content: trimmed,
          });

        /*
         * Snapshot current messages.
         */
        const updatedMessages = [
          ...messages,
          userMessage,
        ];

        /*
         * Immediately show user message.
         */
        setMessages(
          updatedMessages
        );

        try {
          /*
           * If this is a new chat,
           * create conversation first.
           */
          let conversationId =
            currentConversationId;

          if (!conversationId) {
            const newConversation =
              await storageService.createConversation(
                updatedMessages
              );

            if (!newConversation) {
              throw new Error(
                'Unable to create conversation.'
              );
            }

            conversationId =
              newConversation.id;

            setCurrentConversationId(
              conversationId
            );
          }

          /*
           * Send conversation history
           * to OpenAI.
           */
          const conversationHistory =
            updatedMessages.map(
              (message) => ({
                role: message.role,
                content: message.content,
              })
            );

          const replyText =
            await getAIResponse(
              conversationHistory
            );

          /*
           * Create AI message.
           */
          const assistantMessage =
            createMessage({
              id: uuid.v4(),
              role: 'assistant',
              content: replyText,
            });

          const finalMessages = [
            ...updatedMessages,
            assistantMessage,
          ];

          /*
           * Update UI.
           */
          setMessages(
            finalMessages
          );

          /*
           * Save entire conversation.
           */
          await storageService.saveMessages(
            conversationId,
            finalMessages
          );

          /*
           * Update history list.
           */
          await refreshConversations();
        } catch (err) {
          const message =
            err instanceof AIServiceError
              ? err.message
              : 'Something went wrong. Please try again.';

          setError(message);

          /*
           * Mark failed user message.
           */
          setMessages(
            (previous) =>
              previous.map(
                (messageItem) =>
                  messageItem.id ===
                  userMessage.id
                    ? {
                        ...messageItem,
                        status: 'error',
                      }
                    : messageItem
              )
          );
        } finally {
          setIsSending(false);
        }
      },
      [
        messages,
        currentConversationId,
        isSending,
        refreshConversations,
      ]
    );

  /*
   * Retry the latest failed message.
   */
  const retryLastMessage =
    useCallback(() => {
      const lastFailed =
        [...messages]
          .reverse()
          .find(
            (message) =>
              message.status ===
              'error'
          );

      if (!lastFailed) {
        return;
      }

      setMessages(
        (previous) =>
          previous.filter(
            (message) =>
              message.id !==
              lastFailed.id
          )
      );

      sendMessage(
        lastFailed.content
      );
    }, [
      messages,
      sendMessage,
    ]);

  /*
   * Delete one conversation.
   */
  const deleteConversation =
    useCallback(
      async (conversationId) => {
        try {
          await storageService.deleteConversation(
            conversationId
          );

          const updated =
            await refreshConversations();

          /*
           * If currently opened chat
           * was deleted, open another one.
           */
          if (
            conversationId ===
            currentConversationId
          ) {
            if (
              updated.length > 0
            ) {
              const next =
                updated[0];

              setCurrentConversationId(
                next.id
              );

              setMessages(
                next.messages || []
              );
            } else {
              setCurrentConversationId(
                null
              );

              setMessages([]);
            }
          }
        } catch (err) {
          console.warn(
            'useChat: failed to delete conversation',
            err
          );

          setError(
            'Unable to delete this conversation.'
          );
        }
      },
      [
        currentConversationId,
        refreshConversations,
      ]
    );

  /*
   * Rename conversation.
   */
  const renameConversation =
    useCallback(
      async (
        conversationId,
        title
      ) => {
        try {
          const updated =
            await storageService.renameConversation(
              conversationId,
              title
            );

          if (updated) {
            await refreshConversations();
          }

          return updated;
        } catch (err) {
          console.warn(
            'useChat: failed to rename conversation',
            err
          );

          setError(
            'Unable to rename this conversation.'
          );

          return null;
        }
      },
      [refreshConversations]
    );

  /*
   * Search history.
   */
  const searchConversations =
    useCallback(
      async (query) => {
        try {
          return await storageService.searchConversations(
            query
          );
        } catch (err) {
          console.warn(
            'useChat: search failed',
            err
          );

          return [];
        }
      },
      []
    );

  /*
   * Delete everything.
   */
  const clearAllConversations =
    useCallback(
      async () => {
        try {
          await storageService.clearConversations();

          setConversations([]);
          setMessages([]);
          setCurrentConversationId(
            null
          );
          setError(null);
        } catch (err) {
          console.warn(
            'useChat: failed to clear all conversations',
            err
          );

          setError(
            'Unable to clear conversations.'
          );
        }
      },
      []
    );

  /*
   * Keep old clearChat() API
   * so the current ChatScreen
   * doesn't break.
   *
   * It now clears the currently
   * active conversation.
   */
  const clearChat =
    useCallback(async () => {
      if (
        currentConversationId
      ) {
        await deleteConversation(
          currentConversationId
        );
      } else {
        setMessages([]);
        setError(null);
      }
    }, [
      currentConversationId,
      deleteConversation,
    ]);

  const dismissError =
    useCallback(() => {
      setError(null);
    }, []);

  return {
    /*
     * Current conversation
     */
    messages,
    currentConversationId,

    /*
     * All history
     */
    conversations,

    /*
     * State
     */
    isHistoryLoaded,
    isSending,
    error,

    /*
     * Chat actions
     */
    sendMessage,
    retryLastMessage,
    clearChat,
    dismissError,

    /*
     * History actions
     */
    newChat,
    openConversation,
    deleteConversation,
    renameConversation,
    searchConversations,
    clearAllConversations,
    refreshConversations,
  };
}