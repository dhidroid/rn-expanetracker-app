import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  ShoppingBag,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  AlignLeft,
  Clock,
} from 'lucide-react-native';
import { useExpenseStore } from '../hooks/useExpenseStore';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'TransactionDetail'>;

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

export const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { expense } = route.params;
  const { removeExpense } = useExpenseStore();

  const Icon = CATEGORY_ICONS[expense.category] || DollarSign;
  const accentColor = CATEGORY_COLORS[expense.category] || colors.textMuted;

  const handleEdit = () => {
    navigation.navigate('AddExpense', { expense });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeExpense(expense.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Amount Card (Gradient) */}
      <LinearGradient
        colors={[accentColor + 'AA', accentColor + '33', colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.amountGradient}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Transaction</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={[styles.amountIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Icon size={32} color={colors.white} />
          </View>
          <Text style={styles.amountValue}>-${expense.amount.toFixed(2)}</Text>
          <View style={styles.changeAmountRow}>
            <TouchableOpacity style={styles.changeAmountBtn} onPress={handleEdit} activeOpacity={0.7}>
              <Edit2 size={14} color={colors.white} />
              <Text style={styles.changeAmountText}>Change amount</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Details */}
      <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent}>
        {/* Category */}
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Tag size={16} color={colors.textMuted} />
            <Text style={styles.detailLabel}>Category</Text>
          </View>
          <View style={styles.detailValueRow}>
            <View style={[styles.categoryPill, { backgroundColor: accentColor + '18' }]}>
              <Text style={[styles.categoryText, { color: accentColor }]}>
                {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date */}
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Calendar size={16} color={colors.textMuted} />
            <Text style={styles.detailLabel}>Date</Text>
          </View>
          <Text style={styles.detailValue}>
            {dayjs(expense.date).format('MMMM D, YYYY')}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Created at */}
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Clock size={16} color={colors.textMuted} />
            <Text style={styles.detailLabel}>Added</Text>
          </View>
          <Text style={styles.detailValue}>
            {dayjs(expense.createdAt).format('MMM D, YYYY h:mm A')}
          </Text>
        </View>

        {expense.note && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <AlignLeft size={16} color={colors.textMuted} />
                <Text style={styles.detailLabel}>Description</Text>
              </View>
            </View>
            <Text style={styles.noteText}>{expense.note}</Text>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Trash2 size={20} color={colors.error} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={handleEdit} activeOpacity={0.85}>
          <Edit2 size={20} color={colors.white} />
          <Text style={styles.editText}>Edit Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Gradient header
  amountGradient: { paddingBottom: spacing.xxl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 52, marginBottom: spacing.xl },
  backButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { ...typography.h4, color: colors.white },
  amountSection: { alignItems: 'center', paddingHorizontal: spacing.xl },
  amountIcon: { width: 72, height: 72, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  amountValue: { fontSize: 46, fontWeight: '700', color: colors.white, letterSpacing: -1, marginBottom: spacing.md },
  changeAmountRow: { flexDirection: 'row', justifyContent: 'center' },
  changeAmountBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 4 },
  changeAmountText: { ...typography.caption, color: colors.white },

  // Detail cards
  detailScroll: { flex: 1, marginTop: -spacing.xl },
  detailContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 120 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: { ...typography.bodySmall, color: colors.textMuted },
  detailValue: { ...typography.bodyMedium, color: colors.text },
  detailValueRow: {},
  categoryPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.sm },
  categoryText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: colors.border },
  noteText: { ...typography.body, color: colors.textSecondary, lineHeight: 22, paddingBottom: spacing.md },

  // Action bar
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: spacing.xl, paddingBottom: 40, paddingTop: spacing.md, backgroundColor: colors.background, gap: spacing.md },
  deleteButton: { flex: 1, height: 52, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.error + '44', backgroundColor: colors.error + '12', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  deleteText: { ...typography.bodyMedium, color: colors.error, fontWeight: '600' },
  editButton: { flex: 2, height: 52, borderRadius: borderRadius.md, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  editText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
});
