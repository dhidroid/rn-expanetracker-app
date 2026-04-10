import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useIncomeStore } from '../hooks/useIncomeStore';
import { ArrowLeft, Download, TrendingDown, TrendingUp, PieChart } from 'lucide-react-native';
import { Expense, ExpenseCategory } from '../../domain/entities';
import dayjs from 'dayjs';

type FilterPeriod = 'This Month' | 'Last 3 Months' | 'This Year';

const PERIODS: FilterPeriod[] = ['This Month', 'Last 3 Months', 'This Year'];

const filterExpenses = (expenses: Expense[], period: FilterPeriod): Expense[] => {
  const now = dayjs();
  return expenses.filter(e => {
    const d = dayjs(e.date);
    if (period === 'This Month') return d.isSame(now, 'month');
    if (period === 'Last 3 Months') return d.isAfter(now.subtract(3, 'month'));
    if (period === 'This Year') return d.isSame(now, 'year');
    return true;
  });
};

const buildCSV = (expenses: Expense[]): string => {
  const header = 'Date,Category,Amount,Note\n';
  const rows = expenses
    .map(e => `${e.date},${e.category},${e.amount.toFixed(2)},"${(e.note || '').replace(/"/g, '""')}"`)
    .join('\n');
  return header + rows;
};

const CATEGORY_ORDER: ExpenseCategory[] = [
  'food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other',
];

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B', transport: '#3B82F6', shopping: '#EC4899',
  entertainment: '#8B5CF6', bills: '#EF4444', health: '#10B981',
  education: '#06B6D4', other: '#6B7280',
};

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { expenses, loadExpenses } = useExpenseStore();
  const { incomes, loadIncomes } = useIncomeStore();
  const [period, setPeriod] = useState<FilterPeriod>('This Month');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadIncomes();
  }, [loadExpenses, loadIncomes]);

  const filtered = filterExpenses(expenses, period);
  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes
    .filter(i => {
      const d = dayjs(i.date);
      if (period === 'This Month') return d.isSame(dayjs(), 'month');
      if (period === 'Last 3 Months') return d.isAfter(dayjs().subtract(3, 'month'));
      return d.isSame(dayjs(), 'year');
    })
    .reduce((s, i) => s + i.amount, 0);
  const net = totalIncome - totalExpenses;
  const savingRate = totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(0) : '0';

  const categoryBreakdown = CATEGORY_ORDER.map(cat => ({
    cat,
    amount: filtered.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.amount > 0);

  const handleExport = async () => {
    if (filtered.length === 0) {
      Alert.alert('No Data', 'No transactions to export for this period.');
      return;
    }
    setIsExporting(true);
    try {
      const csv = buildCSV(filtered);
      await Share.share({
        title: `ExpanceTracker — ${period} Report`,
        message: csv,
      });
    } catch {
      Alert.alert('Export Failed', 'Could not share the report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity
          style={[styles.exportButton, isExporting && { opacity: 0.6 }]}
          onPress={handleExport}
          disabled={isExporting}
          activeOpacity={0.8}>
          <Download size={18} color={colors.primary} />
          <Text style={styles.exportText}>{isExporting ? '…' : 'Export'}</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}>
            <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderColor: colors.income + '44' }]}>
            <TrendingUp size={18} color={colors.income} />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: colors.income }]}>${totalIncome.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.expense + '44' }]}>
            <TrendingDown size={18} color={colors.expense} />
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: colors.expense }]}>${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>

        {/* Net + Saving Rate */}
        <View style={styles.netCard}>
          <View>
            <Text style={styles.netLabel}>Net Balance</Text>
            <Text style={[styles.netAmount, { color: net >= 0 ? colors.income : colors.expense }]}>
              {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
            </Text>
          </View>
          <View style={styles.savingRateBox}>
            <PieChart size={30} color={net >= 0 ? colors.income : colors.expense} />
            <Text style={styles.savingRateLabel}>Saving Rate</Text>
            <Text style={[styles.savingRateValue, { color: net >= 0 ? colors.income : colors.expense }]}>{savingRate}%</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryBreakdown.map(({ cat, amount }) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const color = CATEGORY_COLORS[cat] || colors.textMuted;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <View style={[styles.catDot, { backgroundColor: color }]} />
                    <Text style={styles.catName}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                  </View>
                  <View style={styles.catBarContainer}>
                    <View style={styles.catBarTrack}>
                      <View style={[styles.catBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <Text style={styles.catAmount}>${amount.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <PieChart size={44} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No data for this period</Text>
            <Text style={styles.emptySubtitle}>Add some transactions to see your report</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  backButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h4, color: colors.text },
  exportButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.primary + '33' },
  exportText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  // Period
  periodRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.lg },
  periodChip: { paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  periodChipTextActive: { color: colors.white },

  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 120 },

  // Summary
  summaryGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, gap: spacing.sm },
  summaryLabel: { ...typography.caption, color: colors.textMuted },
  summaryAmount: { ...typography.h4, fontWeight: '700' },

  // Net
  netCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  netLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  netAmount: { ...typography.h2, fontWeight: '700', letterSpacing: -1 },
  savingRateBox: { alignItems: 'center', gap: 4 },
  savingRateLabel: { ...typography.caption, color: colors.textMuted },
  savingRateValue: { ...typography.h4, fontWeight: '700' },

  // Categories
  sectionTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: 100 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { ...typography.bodySmall, color: colors.textSecondary, textTransform: 'capitalize', flex: 1 },
  catBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catBarTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  catPct: { ...typography.caption, color: colors.textMuted, width: 30, textAlign: 'right' },
  catAmount: { ...typography.bodySmall, color: colors.text, fontWeight: '600', width: 70, textAlign: 'right' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});
