import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { useIncomeStore } from '../hooks/useIncomeStore';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import { RootStackParamList } from '../navigation/types';
import { Expense } from '../../domain/entities';
import {
  Bell,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  FileText,
  DollarSign,
} from 'lucide-react-native';
import { storage } from '../../infrastructure/storage/mmkv';
import { useHaptics } from '../hooks/useHaptics';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

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

const ExpenseRow: React.FC<{ expense: Expense; onPress: () => void }> = ({ expense, onPress }) => {
  const Icon = CATEGORY_ICONS[expense.category] || DollarSign;
  const accentColor = CATEGORY_COLORS[expense.category] || colors.textMuted;
  const haptics = useHaptics();
  return (
    <TouchableOpacity style={rowStyles.row} onPress={() => { haptics.light(); onPress(); }} activeOpacity={0.7}>
      <View style={[rowStyles.iconBox, { backgroundColor: accentColor + '1A' }]}>
        <Icon size={20} color={accentColor} />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{expense.note || expense.category}</Text>
        <Text style={rowStyles.category}>{expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</Text>
      </View>
      <Text style={rowStyles.amount}>-${expense.amount.toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { ...typography.bodyMedium, color: colors.text, marginBottom: 2 },
  category: { ...typography.caption, color: colors.textMuted },
  amount: { ...typography.bodyMedium, color: colors.expense, fontWeight: '600' },
});

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { expenses, monthlyTotal, loadExpenses, loadMonthlyData } = useExpenseStore();
  const { monthlyIncome, loadIncomes } = useIncomeStore();
  const [hideBalance, setHideBalance] = useState(false);
  const haptics = useHaptics();

  const displayName = storage.getString('user_display_name') || 'there';
  const avatarUri = storage.getString('user_avatar_uri');

  useEffect(() => {
    const now = new Date();
    loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
    loadExpenses();
    loadIncomes();
  }, [loadExpenses, loadMonthlyData, loadIncomes]);

  const balance = monthlyIncome - monthlyTotal;
  const spentPercent = monthlyIncome > 0 ? Math.min((monthlyTotal / monthlyIncome) * 100, 100) : 0;

  const handleTransactionPress = useCallback(
    (expense: Expense) => {
      navigation.navigate('TransactionDetail', { expense });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseRow expense={item} onPress={() => handleTransactionPress(item)} />
    ),
    [handleTransactionPress],
  );

  const formatCurrency = (val: number) =>
    hideBalance ? '••••••' : `$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses.slice(0, 20)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Top Header */}
            <View style={styles.topHeader}>
              <TouchableOpacity style={styles.avatarButton}>
                {avatarUri
                  ? <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase()}</Text></View>
                }
                <View style={styles.headerText}>
                  <Text style={styles.welcomeLabel}>Welcome back,</Text>
                  <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notifButton} onPress={() => { }}>
                <Bell size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <LinearGradient
              colors={[colors.gradientCard1, colors.gradientCard2, '#1A0A3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.balanceTop}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <TouchableOpacity onPress={() => { haptics.selection(); setHideBalance(!hideBalance); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {hideBalance
                    ? <EyeOff size={18} color="rgba(255,255,255,0.6)" />
                    : <Eye size={18} color="rgba(255,255,255,0.6)" />
                  }
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>
                {balance < 0 ? '-' : ''}{formatCurrency(balance)}
              </Text>

              {/* Spend progress bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${spentPercent}%` as any,
                  backgroundColor: spentPercent >= 80 ? colors.error : colors.income,
                }]} />
              </View>
              <Text style={styles.progressLabel}>{spentPercent.toFixed(0)}% of income spent this month</Text>

              {/* Income / Expense row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <ArrowDownLeft size={14} color={colors.income} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={styles.statValue}>{hideBalance ? '••••' : `$${monthlyIncome.toFixed(2)}`}</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                    <ArrowUpRight size={14} color={colors.expense} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Expenses</Text>
                    <Text style={styles.statValue}>{hideBalance ? '••••' : `$${monthlyTotal.toFixed(2)}`}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.qAction}
                onPress={() => { haptics.impact(); navigation.navigate('AddIncome', {}); }}
                activeOpacity={0.7}>
                <View style={[styles.qIcon, { backgroundColor: colors.income + '15' }]}>
                  <ArrowDownLeft size={22} color={colors.income} />
                </View>
                <Text style={styles.qLabel}>Add Income</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qActionCenter}
                onPress={() => { haptics.heavy(); navigation.navigate('AddExpense'); }}
                activeOpacity={0.85}>
                <View style={styles.qIconCenter}>
                  <Plus size={26} color={colors.white} />
                </View>
                <Text style={[styles.qLabel, { color: colors.primary }]}>Add Expense</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qAction}
                onPress={() => { }}
                activeOpacity={0.7}>
                <View style={[styles.qIcon, { backgroundColor: colors.primary + '15' }]}>
                  <FileText size={22} color={colors.primary} />
                </View>
                <Text style={styles.qLabel}>Report</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DollarSign size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Tap "Add Expense" to get started</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },

  // Top header
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  avatarButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary + '22', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { ...typography.h4, color: colors.primary, fontWeight: '700' },
  headerText: { flex: 1 },
  welcomeLabel: { ...typography.caption, color: colors.textMuted },
  userName: { ...typography.bodyMedium, color: colors.text, fontWeight: '700', marginTop: 1 },
  notifButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },

  // Balance card
  balanceCard: { borderRadius: borderRadius.xl, marginBottom: spacing.xl, },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  balanceLabel: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
  balanceAmount: { fontSize: 42, fontWeight: '700', color: colors.white, letterSpacing: -1, marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginBottom: spacing.xs, overflow: 'hidden', paddingHorizontal: spacing.lg },
  progressFill: { height: '100%', borderRadius: 2, paddingHorizontal: spacing.lg, backgroundColor: colors.primary, width: '50%' },
  progressLabel: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.lg },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: spacing.md },
  statIcon: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.5)' },
  statValue: { ...typography.bodyMedium, color: colors.white, fontWeight: '600', },

  // Quick Actions
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  qAction: { flex: 1, alignItems: 'center', gap: spacing.sm },
  qActionCenter: { flex: 1, alignItems: 'center', gap: spacing.sm },
  qIcon: { width: 52, height: 52, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  qIconCenter: { width: 56, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  qLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text },
  seeAll: { ...typography.bodySmall, color: colors.textMuted },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h4, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodySmall, color: colors.textMuted },
});
