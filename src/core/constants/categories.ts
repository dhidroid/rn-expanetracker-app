import { ExpenseCategory } from '../../domain/entities';
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Heart,
  GraduationCap,
  Package,
} from 'lucide-react-native/icons';

export const CATEGORY_ICON_COMPONENTS: Record<ExpenseCategory, any> = {
  food: UtensilsCrossed,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  bills: Receipt,
  health: Heart,
  education: GraduationCap,
  other: Package,
};

export const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'transport' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Bills', value: 'bills' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' },
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  shopping: '#45B7D1',
  entertainment: '#96CEB4',
  bills: '#FFEAA7',
  health: '#DDA0DD',
  education: '#98D8C8',
  other: '#B8B8B8',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: '🍔',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '📄',
  health: '💊',
  education: '📚',
  other: '📦',
};
