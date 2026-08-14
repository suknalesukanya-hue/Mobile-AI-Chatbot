import React, { useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MessageBubble from '../components/MessageBubble';
import LoadingIndicator from '../components/LoadingIndicator';
import ChatInput from '../components/ChatInput';
import ErrorBanner from '../components/ErrorBanner';
import { useChat } from '../hooks/useChat';
import { colors, spacing, typography, radius } from '../constants/theme';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  const {
    messages,
    isHistoryLoaded,
    isSending,
    error,
    sendMessage,
    retryLastMessage,
    clearChat,
    dismissError,
  } = useChat();

  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isSending]);

  const handleClear = () => {
    if (messages.length === 0) return;

    Alert.alert(
      'Clear conversation',
      'Are you sure you want to delete this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearChat,
        },
      ]
    );
  };

  if (!isHistoryLoaded) {
    return (
      <View
        style={[
          styles.loadingScreen,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>✦</Text>
        </View>

        <Text style={styles.loadingTitle}>AI Assistant</Text>

        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>✦</Text>
          </View>

          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>

            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Text style={styles.clearIcon}>⌫</Text>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT AREA */}
      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>✦</Text>
          </View>

          <Text style={styles.welcomeTitle}>
            How can I help you?
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Ask me anything. I'm here to help you learn,
            create and solve problems.
          </Text>

          <View style={styles.suggestions}>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>💡</Text>
              <Text style={styles.suggestionText}>
                Explain something
              </Text>
            </View>

            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>✍️</Text>
              <Text style={styles.suggestionText}>
                Help me write
              </Text>
            </View>

            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>💻</Text>
              <Text style={styles.suggestionText}>
                Help with coding
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        />
      )}

      {/* TYPING INDICATOR */}
      {isSending && <LoadingIndicator />}

      {/* ERROR */}
      <ErrorBanner
        message={error}
        onRetry={retryLastMessage}
        onDismiss={dismissError}
      />

      {/* INPUT */}
      <ChatInput
        onSend={sendMessage}
        disabled={isSending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },

  loadingTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.aiText,
  },

  loadingSpinner: {
    marginTop: spacing.sm,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.aiText,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  statusText: {
    fontSize: 12,
    color: colors.muted,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  clearIcon: {
    fontSize: 15,
    color: colors.muted,
    marginRight: 5,
  },

  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },

  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  welcomeIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  welcomeIconText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.aiText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 330,
  },

  suggestions: {
    width: '100%',
    marginTop: spacing.xl,
  },

  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.sm,
  },

  suggestionIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },

  suggestionText: {
    fontSize: 14,
    color: colors.aiText,
    fontWeight: '500',
  },

  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});