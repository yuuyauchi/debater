import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CharacterSelectScreen from '../screens/CharacterSelectScreen';
import DebateScreen from '../screens/DebateScreen';
import ResultsScreen from '../screens/ResultsScreen';
import PurchaseScreen from '../screens/PurchaseScreen';

// タイプ定義
export type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Debate: { characterId: string; topicId: string; stance: 'pro' | 'con' };
  Results: { characterId: string; topicId: string; stance: 'pro' | 'con'; messages: string[] };
  Purchase: undefined;
};

export type TabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// タブアイコンコンポーネント
const TabIcon: React.FC<{ emoji: string; focused: boolean }> = ({ emoji, focused }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={styles.icon}>{emoji}</Text>
  </View>
);

// タブナビゲーター
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#4A90D9',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: '学習',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '成績',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '設定',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// メインナビゲーター
export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: '戻る',
        headerTintColor: '#4A90D9',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#2C3E50',
        },
        headerStyle: {
          backgroundColor: '#FFF',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CharacterSelect"
        component={CharacterSelectScreen}
        options={{
          title: 'キャラクター選択',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Debate"
        component={DebateScreen}
        options={{
          title: 'ディベート',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: '結果',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{
          title: '課金',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    paddingBottom: 20,
    height: 80,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 5,
  },
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  iconContainerFocused: {
    backgroundColor: '#E8F4FF',
  },
  icon: {
    fontSize: 22,
  },
});

export default MainNavigator;
