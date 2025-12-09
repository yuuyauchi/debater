import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { MOCK_RANKINGS, RankingUser } from '../data/mockData';
import { useUser } from '../context/UserContext';

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

const RankingItem: React.FC<{ item: RankingUser; isCurrentUser: boolean }> = ({
  item,
  isCurrentUser,
}) => {
  const badge = getRankBadge(item.rank);

  return (
    <View style={[styles.rankingItem, isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankColumn}>
        {item.rank <= 3 ? (
          <Text style={styles.rankEmoji}>{badge.emoji}</Text>
        ) : (
          <View style={styles.rankNumber}>
            <Text style={styles.rankNumberText}>{item.rank}</Text>
          </View>
        )}
      </View>
      <View style={styles.userInfoColumn}>
        <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
          {item.name}
          {isCurrentUser && ' (あなた)'}
        </Text>
        <Text style={styles.debatesCount}>{item.debatesCount}回の対戦</Text>
      </View>
      <View style={styles.scoreColumn}>
        <Text style={[styles.score, isCurrentUser && styles.currentUserScore]}>
          {item.overallScore}
        </Text>
        <Text style={styles.scoreLabel}>pts</Text>
      </View>
    </View>
  );
};

export const RankingScreen: React.FC = () => {
  const { user } = useUser();

  // ユーザーのスコアでランキングを更新
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

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>ランキング</Text>
        <Text style={styles.subtitle}>総合ディベート力で競おう</Text>
      </View>

      {/* 自分の順位ハイライト */}
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

      {/* トップ3 */}
      <View style={styles.topThreeContainer}>
        {updatedRankings.slice(0, 3).map((user, index) => {
          const positions = [1, 0, 2]; // 2位、1位、3位の順で表示
          const displayIndex = positions[index];
          const displayUser = updatedRankings[displayIndex];
          const badge = getRankBadge(displayUser.rank);
          const isCenter = displayIndex === 0;

          return (
            <View
              key={displayUser.id}
              style={[
                styles.topThreeItem,
                isCenter && styles.topThreeCenter,
              ]}
            >
              <Text style={styles.topThreeEmoji}>{badge.emoji}</Text>
              <View
                style={[
                  styles.topThreeAvatar,
                  { borderColor: badge.color },
                  isCenter && styles.topThreeAvatarCenter,
                ]}
              >
                <Text style={[styles.topThreeAvatarText, isCenter && styles.topThreeAvatarTextCenter]}>
                  {displayUser.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.topThreeName} numberOfLines={1}>
                {displayUser.name}
              </Text>
              <Text style={styles.topThreeScore}>{displayUser.overallScore} pts</Text>
            </View>
          );
        })}
      </View>

      {/* ランキングリスト */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>全ランキング</Text>
        <FlatList
          data={updatedRankings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RankingItem item={item} isCurrentUser={item.name === 'あなた'} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  myRankCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    padding: 20,
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
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topThreeItem: {
    alignItems: 'center',
    width: 100,
  },
  topThreeCenter: {
    marginBottom: 10,
  },
  topThreeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  topThreeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  topThreeAvatarCenter: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },
  topThreeAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  topThreeAvatarTextCenter: {
    fontSize: 24,
  },
  topThreeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  topThreeScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
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
  userName: {
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
  score: {
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

export default RankingScreen;
