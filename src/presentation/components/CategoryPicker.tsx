import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExpenseCategory } from '../../domain/entities';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICON_COMPONENTS,
} from '../../core/constants';
import { colors, spacing, borderRadius, typography } from '../../core/theme';

interface CategoryPickerProps {
  selected: ExpenseCategory | null;
  onSelect: (category: ExpenseCategory) => void;
  error?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selected,
  onSelect,
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.grid}>
        {CATEGORIES.map(cat => {
          const IconComponent = CATEGORY_ICON_COMPONENTS[cat.value];
          return (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.item,
                selected === cat.value && styles.selected,
                selected === cat.value && {
                  borderColor: CATEGORY_COLORS[cat.value],
                },
              ]}
              onPress={() => onSelect(cat.value)}
            >
              <IconComponent
                size={24}
                color={
                  selected === cat.value
                    ? CATEGORY_COLORS[cat.value]
                    : colors.textSecondary
                }
              />
              <Text style={styles.labelText}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary + '10',
  },
  labelText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
