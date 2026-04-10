import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import { useIncomeStore } from '../hooks/useIncomeStore';
import { IncomeSource } from '../../domain/entities/Income';
import { ArrowLeft, DollarSign, RefreshCw, Save } from 'lucide-react-native';
import { useHaptics } from '../hooks/useHaptics';

const SOURCES: { key: IncomeSource; label: string }[] = [
  { key: 'salary', label: 'Salary' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'investment', label: 'Investment' },
  { key: 'business', label: 'Business' },
  { key: 'other', label: 'Other' },
];

const SOURCE_COLORS: Record<IncomeSource, string> = {
  salary: '#22C55E',
  freelance: '#3B82F6',
  investment: '#8B5CF6',
  business: '#F59E0B',
  other: '#6B7280',
};

export const AddIncomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addIncome } = useIncomeStore();
  const haptics = useHaptics();

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<IncomeSource>('salary');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState('');

  const handleSave = async () => {
    const val = parseFloat(amount.replace(/,/g, ''));
    if (!amount || isNaN(val) || val <= 0) {
      haptics.error();
      setAmountError('Please enter a valid amount');
      return;
    }
    setIsLoading(true);
    try {
      addIncome({ amount: val, source, note: note.trim(), date, isRecurring });
      haptics.success();
      navigation.goBack();
    } catch {
      haptics.error();
      Alert.alert('Error', 'Failed to save income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { haptics.light(); navigation.goBack(); }}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <DollarSign size={28} color={colors.income} />
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={t => { setAmount(t); setAmountError(''); }}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
        </View>

        {/* Source */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>SOURCE</Text>
          <View style={styles.sourceGrid}>
            {SOURCES.map(s => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sourceChip, source === s.key && { backgroundColor: SOURCE_COLORS[s.key] + '20', borderColor: SOURCE_COLORS[s.key] }]}
                onPress={() => { haptics.selection(); setSource(s.key); }}
                activeOpacity={0.7}>
                <Text style={[styles.sourceChipText, source === s.key && { color: SOURCE_COLORS[s.key] }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DATE</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* Note */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a note…"
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Recurring Toggle */}
        <View style={styles.recurringRow}>
          <View style={styles.recurringLeft}>
            <RefreshCw size={18} color={colors.primary} />
            <View>
              <Text style={styles.recurringTitle}>Recurring Income</Text>
              <Text style={styles.recurringSubtitle}>Mark as monthly recurring</Text>
            </View>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={v => { v ? haptics.toggleOn() : haptics.toggleOff(); setIsRecurring(v); }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.border}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.85}>
          <Save size={20} color={colors.white} />
          <Text style={styles.saveText}>{isLoading ? 'Saving…' : 'Save Income'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h4, color: colors.text },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120 },

  // Amount card
  amountCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.xl },
  amountLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  amountInput: { flex: 1, fontSize: 40, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.sm },

  // Fields
  fieldGroup: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 15 : 12, color: colors.text, fontSize: 16 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },

  // Source chips
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceChip: { paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sourceChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },

  // Recurring
  recurringRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  recurringLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  recurringTitle: { ...typography.bodyMedium, color: colors.text },
  recurringSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  // Footer
  footer: { paddingHorizontal: spacing.xl, paddingBottom: 40, paddingTop: spacing.md, backgroundColor: colors.background },
  saveButton: { backgroundColor: colors.income, height: 56, borderRadius: borderRadius.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  saveText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700', fontSize: 16 },
});
