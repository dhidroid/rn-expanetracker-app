import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../../domain/entities';
import {
  CATEGORY_ICON_COMPONENTS,
} from '../../core/constants';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../core/theme';

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
}) => {
  // Assuming all are expenses, so adding a negative sign. 
  // If we had incomes, we'd check type.
  const formattedAmount = `-$${expense.amount.toFixed(2)}`;

  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {React.createElement(CATEGORY_ICON_COMPONENTS[expense.category], {
          size: 24,
          color: colors.white,
        })}
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{expense.note || expense.category}</Text>
        <Text style={styles.note} numberOfLines={1}>
          {expense.category}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formattedAmount}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingVertical: 18,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md, // slightly squared
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  category: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
});
