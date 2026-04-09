import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../../domain/entities';
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_COMPONENTS,
} from '../../core/constants';
import { colors, spacing, borderRadius, typography } from '../../core/theme';
import { Trash2 } from 'lucide-react-native/icons';

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  onDelete,
}) => {
  const formattedAmount = expense.amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

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
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: CATEGORY_COLORS[expense.category] + '20' },
        ]}
      >
        {React.createElement(CATEGORY_ICON_COMPONENTS[expense.category], {
          size: 22,
          color: CATEGORY_COLORS[expense.category],
        })}
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{expense.category}</Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {expense.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formattedAmount}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={24} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  category: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
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
    marginTop: 2,
  },
  deleteButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  deleteText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
});
