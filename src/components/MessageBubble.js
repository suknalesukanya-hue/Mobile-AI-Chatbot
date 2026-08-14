import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';
import { formatTime } from '../utils/helpers';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isUser ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isError && styles.errorBubble,
        ]}
      >
        <Text style={isUser ? styles.userText : styles.aiText}>
          {message.content}
        </Text>
        <View style={styles.metaRow}>
          {isError && <Text style={styles.errorLabel}>Not sent</Text>}
          <Text style={[styles.time, isUser && styles.timeOnUser]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: radius.sm,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  errorBubble: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  userText: {
    color: colors.userText,
    fontSize: typography.body,
  },
  aiText: {
    color: colors.aiText,
    fontSize: typography.body,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: typography.small,
    color: colors.muted,
  },
  timeOnUser: {
    color: 'rgba(255,255,255,0.75)',
  },
  errorLabel: {
    fontSize: typography.small,
    color: colors.error,
    marginRight: spacing.xs,
  },
});
