import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseStore } from '../hooks/useExpenseStore';
import {
  ExpenseCard,
  EmptyState,
  SummaryCard,
  FloatingActionButton,
  Header,
} from '../components';
import { colors, spacing } from '../../core/theme';
import { RootStackParamList } from '../navigation/types';
import { Expense } from '../../domain/entities';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    expenses,
    monthlyTotal,
    loadExpenses,
    loadMonthlyData,
    removeExpense,
  } = useExpenseStore();

  useEffect(() => {
    const now = new Date();
    loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
    loadExpenses();
  }, [loadExpenses, loadMonthlyData]);

  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', {});
  }, [navigation]);

  const handleEditExpense = useCallback(
    (expense: Expense) => {
      navigation.navigate('AddExpense', { expense });
    },
    [navigation],
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Expense',
        'Are you sure you want to delete this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => removeExpense(id),
          },
        ],
      );
    },
    [removeExpense],
  );

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        onPress={() => handleEditExpense(item)}
        onDelete={() => handleDeleteExpense(item.id)}
      />
    ),
    [handleEditExpense, handleDeleteExpense],
  );

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  return (
    <View style={styles.container}>
      <Header title="Expenses" />
      <SummaryCard
        title="This Month"
        amount={monthlyTotal}
        subtitle={`${expenses.length} expenses`}
      />
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No Expenses Yet"
            message="Tap the + button to add your first expense"
          />
        }
      />
      <FloatingActionButton onPress={handleAddExpense} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
});
