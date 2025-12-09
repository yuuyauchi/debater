import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import { LEARNING_CONTENTS } from '../data/mockData';

type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Debate: { characterId: string; topicId: string; stance: 'pro' | 'con' };
  Results: { characterId: string; topicId: string; stance: 'pro' | 'con'; messages: string[] };
};

type TabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useUser();

  // 学習タブに遷移
  const navigateToLearn = () => {
    navigation.navigate('Learn');
  };

  // フレームワークからランダムにヒントを選択（日付ベースで固定）
  const todaysTip = useMemo(() => {
    const frameworks = LEARNING_CONTENTS.filter(c => c.category === 'framework');
    // 日付をシードとして使用し、1日中同じヒントを表示
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % frameworks.length;
    const selectedFramework = frameworks[index];

    // コンテンツから最初の説明部分を抽出
    const lines = selectedFramework.content.split('\n').filter(line => line.trim());
    const description = lines[0].replace(/\*\*/g, '');

    return {
      title: selectedFramework.title,
      description: description,
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダーエリア */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚔️</Text>
          <Text style={styles.title}>Debate Dojo</Text>
          <Text style={styles.subtitle}>ディベート道場</Text>
        </View>

        {/* ユーザー情報 */}
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>おかえりなさい</Text>
          {user.debatesCount > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.overallScore}</Text>
                <Text style={styles.statLabel}>総合スコア</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.debatesCount}</Text>
                <Text style={styles.statLabel}>対戦回数</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noStatsText}>
              まだディベートをしていません。{'\n'}最初の対戦を始めましょう！
            </Text>
          )}
        </View>

        {/* メインボタン */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('CharacterSelect')}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>AIとディベートを始める</Text>
          <Text style={styles.startButtonSubtext}>対戦相手を選んで議論開始！</Text>
        </TouchableOpacity>

        {/* 今日のヒント */}
        <TouchableOpacity style={styles.tipCard} onPress={navigateToLearn} activeOpacity={0.7}>
          <Text style={styles.tipTitle}>💡 今日のヒント: {todaysTip.title}</Text>
          <Text style={styles.tipText}>
            {todaysTip.description}
          </Text>
          <Text style={styles.tipLearnMore}>学習タブで詳しく見る →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  userInfo: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 18,
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  noStatsText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  startButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  tipLearnMore: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: '600',
    marginTop: 10,
  },
});

export default HomeScreen;
