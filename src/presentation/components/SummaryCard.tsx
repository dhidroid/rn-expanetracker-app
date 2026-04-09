import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../core/theme';

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  subtitle,
}) => {
  const formattedAmount = amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{formattedAmount}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
  },
  amount: {
    ...typography.h1,
    color: colors.white,
    marginVertical: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.7,
  },
});
