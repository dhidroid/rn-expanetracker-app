import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../../core/theme';
import { useAuthStore } from '../../hooks/auth/useAuthStore';
import { DollarSign, ArrowRight, Info } from 'lucide-react-native';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Income'>;

export const IncomeScreen: React.FC<{ navigation: NavProp }> = ({ navigation }) => {
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const { completeOnboarding } = useAuthStore();

  const handleContinue = () => {
    const val = parseFloat(income.replace(/,/g, ''));
    if (!income || isNaN(val) || val <= 0) {
      setError('Please enter a valid income amount');
      return;
    }
    completeOnboarding(val);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>STEP 2 OF 3</Text>
            <Text style={styles.title}>Monthly Income</Text>
            <Text style={styles.subtitle}>
              We use this to calculate your budget and send smart spending alerts.
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountCard}>
            <View style={styles.currencyRow}>
              <View style={styles.currencyBadge}>
                <DollarSign size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={income}
                onChangeText={t => { setIncome(t); setError(''); }}
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Info size={16} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>
              You'll get a notification when you've spent 80% of your income or your balance hits zero.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Continue</Text>
            <ArrowRight size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xxl },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  currencyBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.sm },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '12',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700', fontSize: 16 },
});
