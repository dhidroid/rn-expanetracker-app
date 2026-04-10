import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useIncomeStore } from '../hooks/useIncomeStore';
import { CustomBarChart } from '../components/CustomBarChart';
import {
  ArrowLeft,
  ChevronDown,
  ShoppingBag,
  HeartPulse,
  Tv,
  Car,
  FileText,
  DollarSign,
  Utensils,
  GraduationCap,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { Expense } from '../../domain/entities';

const { width } = Dimensions.get('window');

type Period = 'Week' | 'Month';
type Tab = 'Expenses' | 'Income';

const CATEGORY_ICONS: Record<string, any> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Tv,
  bills: FileText,
  health: HeartPulse,
  education: GraduationCap,
  other: DollarSign,
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B',
  transport: '#3B82F6',
  shopping: '#EC4899',
  entertainment: '#8B5CF6',
  bills: '#EF4444',
  health: '#10B981',
  education: '#06B6D4',
  other: '#6B7280',
};

const buildWeeklyData = (expenses: Expense[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  return days.map((label, i) => {
    const day = startOfWeek.add(i + 1, 'day');
    const total = expenses
      .filter(e => dayjs(e.date).isSame(day, 'day'))
      .reduce((s, e) => s + e.amount, 0);
    return { label, value: total };
  });
};

const buildMonthlyData = (expenses: Expense[]) => {
  const weeks = ['Wk1', 'Wk2', 'Wk3', 'Wk4'];
  const now = dayjs();
  return weeks.map((label, i) => {
    const start = now.startOf('month').add(i * 7, 'day');
    const end = start.add(7, 'day');
    const total = expenses
      .filter(e => {
        const d = dayjs(e.date);
        return d.isAfter(start) && d.isBefore(end);
      })
      .reduce((s, e) => s + e.amount, 0);
    return { label, value: total };
  });
};

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { expenses, categoryTotals, loadExpenses, loadMonthlyData } = useExpenseStore();
  const { incomes, loadIncomes } = useIncomeStore();

  const [activeTab, setActiveTab] = useState<Tab>('Expenses');
  const [period, setPeriod] = useState<Period>('Week');
  const [activeBarIndex, setActiveBarIndex] = useState(5); // Sat default

  useEffect(() => {
    const now = new Date();
    loadExpenses();
    loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
    loadIncomes();
  }, [loadExpenses, loadMonthlyData, loadIncomes]);

  const chartData = period === 'Week' ? buildWeeklyData(expenses) : buildMonthlyData(expenses);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const incomeTotal = incomes.reduce((s, i) => s + i.amount, 0);

  const displayTotal = activeTab === 'Expenses' ? total : incomeTotal;

  const categories = Object.entries(categoryTotals)
    .filter(([, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          {(['Expenses', 'Income'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total + Period */}
        <View style={styles.totalRow}>
          <Text style={styles.totalAmount}>
            ${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <TouchableOpacity
            style={styles.periodButton}
            onPress={() => setPeriod(p => (p === 'Week' ? 'Month' : 'Week'))}
            activeOpacity={0.7}>
            <Text style={styles.periodText}>{period}</Text>
            <ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartCard}>
          <CustomBarChart
            data={chartData}
            activeIndex={activeBarIndex}
            height={160}
            onBarPress={setActiveBarIndex}
          />
        </View>

        {/* Category Breakdown */}
        {activeTab === 'Expenses' && categories.length > 0 && (
          <View>
            <Text style={styles.subTitle}>By Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map(([cat, amount]) => {
                const Icon = CATEGORY_ICONS[cat] || DollarSign;
                const color = CATEGORY_COLORS[cat] || colors.textMuted;
                const percent = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <View key={cat} style={styles.categoryCard}>
                    <View style={styles.categoryTopRow}>
                      <View style={[styles.categoryIcon, { backgroundColor: color + '18' }]}>
                        <Icon size={16} color={color} />
                      </View>
                      <Text style={styles.categoryName}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                    <View style={styles.categoryBar}>
                      <View style={[styles.categoryBarFill, { width: `${percent}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.categoryPercent}>{percent.toFixed(0)}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'Income' && (
          <View style={styles.incomeSection}>
            <Text style={styles.subTitle}>Income Sources</Text>
            {incomes.length === 0
              ? <Text style={styles.emptyNote}>No income recorded yet.</Text>
              : incomes.map(inc => (
                <View key={inc.id} style={styles.incomeRow}>
                  <View>
                    <Text style={styles.incomeSource}>{inc.source.charAt(0).toUpperCase() + inc.source.slice(1)}</Text>
                    <Text style={styles.incomeDate}>{dayjs(inc.date).format('MMM D, YYYY')}</Text>
                  </View>
                  <Text style={styles.incomeAmount}>+${inc.amount.toFixed(2)}</Text>
                </View>
              ))
            }
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const CARD_W = (width - spacing.xl * 2 - spacing.md) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  backButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h4, color: colors.text },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 120 },

  // Tab
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 4, marginBottom: spacing.lg },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.sm },
  tabBtnActive: { backgroundColor: colors.background },
  tabText: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.text },

  // Total
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  totalAmount: { ...typography.h1, color: colors.text },
  periodButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceVariant, paddingHorizontal: 12, paddingVertical: 7, borderRadius: borderRadius.sm },
  periodText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },

  // Chart
  chartCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.xl },

  // Categories
  subTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  categoryCard: { width: CARD_W, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md },
  categoryTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  categoryIcon: { width: 30, height: 30, borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  categoryName: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  categoryAmount: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  categoryBar: { height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  categoryBarFill: { height: '100%', borderRadius: 2 },
  categoryPercent: { ...typography.caption, color: colors.textMuted },

  // Income list
  incomeSection: { marginTop: spacing.sm },
  emptyNote: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  incomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  incomeSource: { ...typography.bodyMedium, color: colors.text, textTransform: 'capitalize' },
  incomeDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  incomeAmount: { ...typography.bodyMedium, color: colors.income, fontWeight: '700' },
});
