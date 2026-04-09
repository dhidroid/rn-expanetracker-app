import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExpenseStore } from '../hooks/useExpenseStore';
import { Button, Input, CategoryPicker, Header } from '../components';
import { InvoiceScanner } from '../components/InvoiceScanner';
import { expenseSchema, ExpenseFormData } from '../hooks/useExpenseForm';
import { colors, spacing, borderRadius } from '../../core/theme';
import { RootStackParamList } from '../navigation/types';
import dayjs from 'dayjs';

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddExpenseRouteProp>();
  const { addExpense, updateExpense, isLoading } = useExpenseStore();
  const [scannedImage, setScannedImage] = useState<{
    uri: string;
    fileName: string;
  } | null>(null);

  const existingExpense = route.params?.expense;
  const isEditing = !!existingExpense;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: existingExpense?.amount ?? 0,
      category: existingExpense?.category ?? undefined,
      note: existingExpense?.note ?? '',
      date: existingExpense?.date ?? dayjs().format('YYYY-MM-DD'),
    },
  });

  const onSubmit = useCallback(
    async (data: ExpenseFormData) => {
      try {
        if (isEditing && existingExpense) {
          await updateExpense(existingExpense.id, data);
        } else {
          await addExpense(data);
        }
        navigation.goBack();
      } catch {
        Alert.alert('Error', 'Failed to save expense. Please try again.');
      }
    },
    [addExpense, updateExpense, navigation, isEditing, existingExpense],
  );

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        showBack
        onBack={onCancel}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value ? String(value) : ''}
              onChangeText={text => {
                if (text === '') return onChange(undefined);
                const parsed = Number(text);
                if (!isNaN(parsed)) onChange(parsed);
              }}
              onBlur={onBlur}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Date"
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <CategoryPicker
              selected={value}
              onSelect={onChange}
              error={errors.category?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Note (optional)"
              placeholder="Add a note..."
              multiline
              numberOfLines={3}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.note?.message}
            />
          )}
        />

        <View style={styles.scannerContainer}>
          <InvoiceScanner
            onScanComplete={result => {
              setScannedImage(result);
            }}
          />
        </View>

        {scannedImage && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: scannedImage.uri }}
              style={styles.previewImage}
            />
          </View>
        )}

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.button}
          />
          <Button
            title={isEditing ? 'Update' : 'Add Expense'}
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
  scannerContainer: {
    marginTop: spacing.md,
  },
  previewContainer: {
    marginTop: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },
});
