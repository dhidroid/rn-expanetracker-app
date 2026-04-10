import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet as RNStyleSheet,
  Text,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  AddExpenseScreen,
  AnalyticsScreen,
  SettingsScreen,
  ServiceDetailScreen,
  TransactionDetailScreen,
  AddIncomeScreen,
  ReportsScreen,
  AIInsightsScreen,
} from '../screens';
import {
  WelcomeScreen,
  OnboardingProfileScreen,
  IncomeScreen,
  LoginScreen,
  SignupScreen,
} from '../screens/Auth';
import { colors } from '../../core/theme';
import { RootStackParamList, TabParamList, AuthStackParamList } from './types';
import {
  LayoutGrid,
  BarChart2,
  FileText,
  Sparkles,
  User,
} from 'lucide-react-native';
import { useAuthStore } from '../hooks/auth/useAuthStore';
import { NotificationService } from '../../infrastructure/notifications/notificationService';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Tab Icon ───────────────────────────────────────────────────────────────
const TabIcon = ({
  focused,
  Icon,
  label,
}: {
  focused: boolean;
  Icon: any;
  label: string;
}) => (
  <View style={tabStyles.iconWrapper}>
    <Icon
      size={22}
      color={focused ? colors.primary : colors.textMuted}
      strokeWidth={focused ? 2 : 1.5}
    />
    <Text
      style={[
        tabStyles.tabLabel,
        { color: focused ? colors.primary : colors.textMuted },
      ]}>
      {label}
    </Text>
    {focused && <View style={tabStyles.indicator} />}
  </View>
);

const tabStyles = RNStyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    position: 'relative',
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});

// ─── Tab Navigator ──────────────────────────────────────────────────────────
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={LayoutGrid} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={BarChart2} label="Analytics" />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={FileText} label="Reports" />
          ),
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIInsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={Sparkles} label="AI" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={User} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Auth Navigator ──────────────────────────────────────────────────────────
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <AuthStack.Screen name="Income" component={IncomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// ─── Main navigator (tabs + modal screens) ───────────────────────────────────
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
      />
    </Stack.Navigator>
  );
};

// ─── Root Navigator ──────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, isOnboardingComplete, initialize } =
    useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitialize = useCallback(async () => {
    await initialize();
    await NotificationService.setup();
    await NotificationService.requestPermission();
    setIsInitialized(true);
  }, [initialize]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated || !isOnboardingComplete ? (
        <AuthNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = RNStyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    elevation: 0,
    shadowOpacity: 0,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
