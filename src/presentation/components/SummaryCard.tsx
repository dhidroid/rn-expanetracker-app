import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  glassShadow,
} from '../../core/theme';

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
      <View style={styles.glassOverlay}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{formattedAmount}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.md,
    ...glassShadow.medium,
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  amount: {
    ...typography.h1,
    color: colors.white,
    marginVertical: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.7,
  },
});
