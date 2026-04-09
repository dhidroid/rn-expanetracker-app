import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { EmptyState, Header } from '../components';
import { CATEGORIES, CATEGORY_COLORS } from '../../core/constants';
import { colors, spacing, borderRadius, typography } from '../../core/theme';
import { ExpenseCategory } from '../../domain/entities';

export const AnalyticsScreen: React.FC = () => {
  const { categoryTotals, monthlyTotal, loadMonthlyData, loadExpenses } =
    useExpenseStore();

  useEffect(() => {
    const now = new Date();
    loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
    loadExpenses();
  }, [loadMonthlyData, loadExpenses]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      amount: categoryTotals[cat.value as ExpenseCategory],
      percentage:
        monthlyTotal > 0
          ? (categoryTotals[cat.value as ExpenseCategory] / monthlyTotal) * 100
          : 0,
    })).filter(cat => cat.amount > 0);
  }, [categoryTotals, monthlyTotal]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof categoryData)[0] }) => (
      <View style={styles.categoryItem}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.dot,
              { backgroundColor: CATEGORY_COLORS[item.value] },
            ]}
          />
          <Text style={styles.categoryLabel}>{item.label}</Text>
        </View>
        <View style={styles.categoryValues}>
          <Text style={styles.amount}>
            INR{' '}
            {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.percentage}>{item.percentage.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${item.percentage}%`,
                backgroundColor: CATEGORY_COLORS[item.value],
              },
            ]}
          />
        </View>
      </View>
    ),
    [],
  );

  if (categoryData.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Data Yet"
          message="Add some expenses to see your analytics"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Analytics" />
      <FlatList
        data={categoryData}
        renderItem={renderItem}
        keyExtractor={item => item.value}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  categoryItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  categoryLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  categoryValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  percentage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
