import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useIncomeStore } from '../hooks/useIncomeStore';
import {
  ArrowLeft,
  Send,
  Sparkles,
  TrendingDown,
  Lightbulb,
  BarChart2,
  Cpu,
} from 'lucide-react-native';
import {
  ollamaChat,
  checkOllamaHealth,
  OllamaMessage,
} from '../../infrastructure/ai/ollamaClient';
import {
  analyzeSpendingLocally,
  generateSavingTipsLocally,
  generateMonthlySummaryLocally,
  answerFinanceQuestionLocally,
} from '../../infrastructure/ai/localAI';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingDown,
    label: 'Analyze spending',
    prompt:
      'Analyze my current spending patterns and tell me what I should improve.',
  },
  {
    icon: Lightbulb,
    label: 'Saving tips',
    prompt: 'Give me 5 specific money-saving tips based on my expense data.',
  },
  {
    icon: BarChart2,
    label: 'Monthly summary',
    prompt:
      'Summarize my monthly finances and tell me if I am on a good track.',
  },
];

export const AIInsightsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { expenses, loadExpenses } = useExpenseStore();
  const { incomes, loadIncomes } = useIncomeStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadExpenses();
    loadIncomes();
    // Check Ollama but always show welcome message
    checkOllamaHealth().then(online => {
      setOllamaOnline(online);
    });
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "👋 Hi! I'm your personal finance AI assistant.\n\n" +
          'I work offline using smart analysis of your spending data. Tap any quick prompt below or ask me anything about your finances!\n\n' +
          "💡 Try: 'How can I save money?', 'Analyze spending', or 'Monthly summary'",
      },
    ]);
  }, [loadExpenses, loadIncomes]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      let reply: string;

      if (ollamaOnline) {
        // Try Ollama first
        const systemPrompt = `You are an expert personal finance advisor. The user is using the ExpanceTracker app. Be concise, practical and friendly. Use bullet points for tips.`;
        const history: OllamaMessage[] = [
          { role: 'system', content: systemPrompt },
          ...updated.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ];
        reply = await ollamaChat(history);
      } else {
        // Fallback to local AI
        const localResponse = answerFinanceQuestionLocally(
          text,
          expenses,
          incomes,
        );
        reply = localResponse.content;
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback to local AI on error
      const localResponse = answerFinanceQuestionLocally(
        text,
        expenses,
        incomes,
      );
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: localResponse.content,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleQuickPrompt = async (p: (typeof QUICK_PROMPTS)[0]) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: p.prompt,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      let reply: string;

      // Use local AI for all prompts (works offline)
      if (p.label === 'Analyze spending') {
        const result = analyzeSpendingLocally(expenses, incomes);
        reply = result.content;
      } else if (p.label === 'Saving tips') {
        const result = generateSavingTipsLocally(expenses, incomes);
        reply = result.content;
      } else if (p.label === 'Monthly summary') {
        const result = generateMonthlySummaryLocally(expenses, incomes);
        reply = result.content;
      } else {
        // Fallback for other prompts
        const result = answerFinanceQuestionLocally(
          p.prompt,
          expenses,
          incomes,
        );
        reply = result.content;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Unable to analyze. Please add some expenses first.',
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Sparkles size={14} color={colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubbleContent,
            isUser ? styles.bubbleContentUser : styles.bubbleContentBot,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextUser : styles.bubbleTextBot,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Cpu size={18} color={colors.primary} />
          <Text style={styles.headerTitle}>AI Insights</Text>
        </View>
        <View style={styles.statusDot}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: ollamaOnline ? colors.income : colors.warning,
              },
            ]}
          />
        </View>
      </View>

      {/* Status Banner */}
      <View style={styles.offlineBanner}>
        {ollamaOnline ? (
          <>
            <Sparkles size={16} color={colors.income} />
            <Text style={styles.offlineText}>
              Ollama connected - advanced AI enabled
            </Text>
          </>
        ) : (
          <>
            <Cpu size={16} color={colors.warning} />
            <Text style={styles.offlineText}>
              Offline mode - smart local AI always available
            </Text>
          </>
        )}
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingRow}>
                <View style={styles.botAvatar}>
                  <Sparkles size={14} color={colors.primary} />
                </View>
                <View style={styles.thinkingBubble}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.thinkingText}>Thinking…</Text>
                </View>
              </View>
            ) : null
          }
          ListHeaderComponent={
            messages.length === 0 && ollamaOnline !== false ? (
              <View style={styles.emptyState}>
                <View style={styles.aiIcon}>
                  <Sparkles size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Finance AI</Text>
                <Text style={styles.emptySubtitle}>
                  Ask me anything about your spending and savings goals.
                </Text>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts */}
        {messages.length <= 1 && ollamaOnline !== false && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPrompts}
          >
            {QUICK_PROMPTS.map(p => {
              const Icon = p.icon;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={styles.quickChip}
                  onPress={() => handleQuickPrompt(p)}
                  activeOpacity={0.7}
                >
                  <Icon size={14} color={colors.primary} />
                  <Text style={styles.quickChipText}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder={
              ollamaOnline === false ? 'AI offline…' : 'Ask something…'
            }
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={ollamaOnline !== false}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading || ollamaOnline === false) &&
                styles.sendDisabled,
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || ollamaOnline === false}
            activeOpacity={0.8}
          >
            <Send size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.h4, color: colors.text },
  statusDot: { width: 40, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Offline banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '33',
  },
  offlineText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
    lineHeight: 16,
  },

  // Messages
  messageList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  bubble: { flexDirection: 'row', gap: spacing.sm },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleBot: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleContent: {
    maxWidth: '78%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  bubbleContentUser: { backgroundColor: colors.primary },
  bubbleContentBot: { backgroundColor: colors.surface },
  bubbleText: { ...typography.body, lineHeight: 22 },
  bubbleTextUser: { color: colors.white },
  bubbleTextBot: { color: colors.text },
  loadingRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  thinkingText: { ...typography.caption, color: colors.textMuted },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 1.5,
    gap: spacing.md,
  },
  aiIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 24,
  },

  // Quick prompts
  quickPrompts: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '33',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  quickChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: colors.text,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
