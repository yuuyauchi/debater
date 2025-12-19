import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainNavigator } from './src/navigation/TabNavigator';
import { UserProvider } from './src/context/UserContext';
import { PurchaseProvider } from './src/context/PurchaseContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PurchaseProvider>
        <UserProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <MainNavigator />
          </NavigationContainer>
        </UserProvider>
      </PurchaseProvider>
    </SafeAreaProvider>
  );
}
