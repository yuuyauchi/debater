import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import { RadarChart } from '../components/RadarChart';
import { CHARACTERS, TOPICS, MOCK_RANKINGS } from '../data/mockData';

type TabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  Settings: undefined;
};

const getRankBadge = (rank: number): { emoji: string; color: string } => {
  switch (rank) {
    case 1:
      return { emoji: '🥇', color: '#FFD700' };
    case 2:
      return { emoji: '🥈', color: '#C0C0C0' };
    case 3:
      return { emoji: '🥉', color: '#CD7F32' };
    default:
      return { emoji: '', color: '#E0E0E0' };
  }
};

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  // 学習タブに遷移
  const navigateToLearn = () => {
    navigation.navigate('Learn');
  };

  // ランキング計算
  const updatedRankings = MOCK_RANKINGS.map((r) => {
    if (r.name === 'あなた') {
      return {
        ...r,
        overallScore: user.overallScore,
        debatesCount: user.debatesCount,
      };
    }
    return r;
  }).sort((a, b) => b.overallScore - a.overallScore)
    .map((r, index) => ({ ...r, rank: index + 1 }));

  const currentUserRank = updatedRankings.find((r) => r.name === 'あなた');

  const getScoreGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'S', color: '#FFD700' };
    if (score >= 80) return { grade: 'A', color: '#4CAF50' };
    if (score >= 70) return { grade: 'B', color: '#2196F3' };
    if (score >= 60) return { grade: 'C', color: '#FF9800' };
    return { grade: 'D', color: '#F44336' };
  };

  const gradeInfo = getScoreGrade(user.overallScore);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userTitle}>ディベーター</Text>
        </View>

        {/* 総合スコアカード */}
        <View style={styles.overallCard}>
          <View style={styles.overallScoreSection}>
            <Text style={styles.overallLabel}>総合ディベート力</Text>
            <View style={styles.overallScoreRow}>
              <Text style={styles.overallScore}>{user.overallScore}</Text>
              <View style={[styles.gradeBadge, { backgroundColor: gradeInfo.color }]}>
                <Text style={styles.gradeText}>{gradeInfo.grade}</Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.debatesCount}</Text>
              <Text style={styles.statLabel}>対戦数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.debateHistory.filter(h => h.winner === 'user').length}
              </Text>
              <Text style={styles.statLabel}>勝利数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.debatesCount > 0
                  ? Math.round((user.debateHistory.filter(h => h.winner === 'user').length / user.debatesCount) * 100)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>勝率</Text>
            </View>
          </View>
        </View>

        {/* スキル分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>スキル分析</Text>
          <View style={styles.chartCard}>
            <RadarChart scores={user.averageScores} />
          </View>
        </View>

        {/* スキル詳細 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>スキル詳細</Text>
          <View style={styles.skillsCard}>
            {Object.entries(user.averageScores).map(([key, value]) => {
              const skillNames: Record<string, string> = {
                logic: '論理構造',
                evidence: '証拠力',
                tone: '話し方',
                refutation: '反論力',
                clarity: '構造化',
              };
              const skillGrade = getScoreGrade(value);

              return (
                <View key={key} style={styles.skillItem}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skillNames[key]}</Text>
                    <Text style={[styles.skillScore, { color: skillGrade.color }]}>
                      {value}
                    </Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View
                      style={[
                        styles.skillBarFill,
                        { width: `${value}%`, backgroundColor: skillGrade.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 対戦履歴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近の対戦</Text>
          {user.debateHistory.length > 0 ? (
            <View style={styles.historyCard}>
              {user.debateHistory.slice(0, 5).map((history) => {
                const character = CHARACTERS.find((c) => c.id === history.characterId);
                const topic = TOPICS.find((t) => t.id === history.topicId);
                const resultEmoji =
                  history.winner === 'user' ? '🏆' : history.winner === 'ai' ? '😤' : '🤝';

                return (
                  <View key={history.id} style={styles.historyItem}>
                    <Text style={styles.historyEmoji}>{resultEmoji}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyOpponent}>
                        vs {character?.avatar} {character?.name}
                      </Text>
                      <Text style={styles.historyTopic} numberOfLines={1}>
                        {topic?.title}
                      </Text>
                    </View>
                    <Text style={styles.historyScore}>{history.overallScore}pt</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                まだ対戦履歴がありません。{'\n'}ディベートを始めましょう！
              </Text>
            </View>
          )}
        </View>

        {/* ランキング */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ランキング</Text>
          {currentUserRank && (
            <View style={styles.myRankCard}>
              <View style={styles.myRankInfo}>
                <Text style={styles.myRankLabel}>あなたの順位</Text>
                <View style={styles.myRankValue}>
                  <Text style={styles.myRankNumber}>{currentUserRank.rank}</Text>
                  <Text style={styles.myRankSuffix}>位</Text>
                </View>
              </View>
              <View style={styles.myScoreInfo}>
                <Text style={styles.myScoreLabel}>総合スコア</Text>
                <Text style={styles.myScoreValue}>{currentUserRank.overallScore}</Text>
              </View>
            </View>
          )}
          <View style={styles.rankingCard}>
            {updatedRankings.slice(0, 5).map((rankUser) => {
              const badge = getRankBadge(rankUser.rank);
              const isCurrentUser = rankUser.name === 'あなた';
              return (
                <View
                  key={rankUser.id}
                  style={[styles.rankingItem, isCurrentUser && styles.currentUserItem]}
                >
                  <View style={styles.rankColumn}>
                    {rankUser.rank <= 3 ? (
                      <Text style={styles.rankEmoji}>{badge.emoji}</Text>
                    ) : (
                      <View style={styles.rankNumber}>
                        <Text style={styles.rankNumberText}>{rankUser.rank}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfoColumn}>
                    <Text style={[styles.rankUserName, isCurrentUser && styles.currentUserName]}>
                      {rankUser.name}
                      {isCurrentUser && ' (あなた)'}
                    </Text>
                    <Text style={styles.debatesCount}>{rankUser.debatesCount}回の対戦</Text>
                  </View>
                  <View style={styles.scoreColumn}>
                    <Text style={[styles.rankScore, isCurrentUser && styles.currentUserScore]}>
                      {rankUser.overallScore}
                    </Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 改善提案 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>改善のヒント</Text>
          <View style={styles.tipsCard}>
            {(() => {
              const lowestSkill = Object.entries(user.averageScores).reduce(
                (min, [key, value]) =>
                  value < min.value ? { key, value } : min,
                { key: '', value: 100 }
              );
              const skillNames: Record<string, string> = {
                logic: '論理構造',
                evidence: '証拠力',
                tone: '話し方',
                refutation: '反論力',
                clarity: '構造化',
              };
              const tips: Record<string, string> = {
                logic:
                  'C-R-E-E-Pフレームワークを使って、論理的な議論を構築する練習をしましょう。',
                evidence:
                  '具体的なデータや事例を集め、主張を裏付ける習慣をつけましょう。',
                tone:
                  '相手を尊重しながら反対意見を述べる方法を学びましょう。',
                refutation:
                  '相手の主張の弱点を見つけ、建設的に反論する練習をしましょう。',
                clarity:
                  '議論のポイントを明確に整理し、構造的に伝えることを意識しましょう。',
              };

              return (
                <>
                  <Text style={styles.tipTitle}>
                    💡 「{skillNames[lowestSkill.key]}」を強化しましょう
                  </Text>
                  <Text style={styles.tipText}>{tips[lowestSkill.key]}</Text>
                  <TouchableOpacity style={styles.tipButton} onPress={navigateToLearn}>
                    <Text style={styles.tipButtonText}>学習コンテンツを見る →</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#4A90D9',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  overallCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  overallScoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  overallScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gradeBadge: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  skillItem: {
    marginBottom: 15,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  skillScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  skillBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyOpponent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  historyTopic: {
    fontSize: 12,
    color: '#95A5A6',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  emptyHistory: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 22,
    marginBottom: 15,
  },
  tipButton: {
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    fontSize: 14,
    color: '#4A90D9',
    fontWeight: 'bold',
  },
  // ランキングスタイル
  myRankCard: {
    flexDirection: 'row',
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  myRankValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  myRankNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myRankSuffix: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 4,
  },
  myScoreInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  myScoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  myScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rankingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  rankColumn: {
    width: 40,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  userInfoColumn: {
    flex: 1,
    marginLeft: 10,
  },
  rankUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#4A90D9',
  },
  debatesCount: {
    fontSize: 12,
    color: '#95A5A6',
  },
  scoreColumn: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rankScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currentUserScore: {
    color: '#4A90D9',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 2,
  },
});

export default ProfileScreen;
