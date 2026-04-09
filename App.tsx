import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/presentation/navigation';
import { ErrorBoundary } from './src/presentation/components';
import { useIsDarkMode } from './src/presentation/hooks/useTheme';

function App(): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const isDarkMode = useIsDarkMode();
  const isDark = isDarkMode ?? systemColorScheme === 'dark';

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0F172A' : '#F8FAFC'}
        />
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
