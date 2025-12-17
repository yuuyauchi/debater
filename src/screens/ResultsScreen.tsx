import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { CHARACTERS, TOPICS } from '../data/mockData';
import { getEvaluationAndFeedback, EvaluationResult, EvaluationAndFeedbackResult, TurnFeedback } from '../services/MastraApiService';
import { RadarChart } from '../components/RadarChart';
import { useUser } from '../context/UserContext';
import { getScoreCriteria, generateOverallEvaluation, SCORE_CRITERIA } from '../utils/scoringLogic';
import { TurnMessage } from './DebateScreen';

type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Debate: { characterId: string; topicId: string; stance: 'pro' | 'con' };
  Results: { characterId: string; topicId: string; stance: 'pro' | 'con'; messages: TurnMessage[] };
};

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { characterId, topicId, stance, messages } = route.params;
  const { updateUserAfterDebate } = useUser();

  const character = CHARACTERS.find((c) => c.id === characterId);
  const topic = TOPICS.find((t) => t.id === topicId);

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [learningCoachFeedback, setLearningCoachFeedback] = useState<string>('');
  const [turnFeedbacks, setTurnFeedbacks] = useState<TurnFeedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!character) return;

      setIsAnalyzing(true);
      try {
        // 議論全文を構築
        const transcript = messages.map(m => m.text).join('\n\n');

        // Judge Analyst + Learning Coach + Turn-by-Turn Feedback によるディベート評価
        const analysisResult: EvaluationAndFeedbackResult = await getEvaluationAndFeedback(
          transcript,
          characterId,
          messages  // ターンメッセージを渡す
        );
        setResult(analysisResult.scores);
        setLearningCoachFeedback(analysisResult.feedback);
        setTurnFeedbacks(analysisResult.turnFeedbacks || []);

        // ユーザーデータを更新
        updateUserAfterDebate(
          analysisResult.scores.scores,
          characterId,
          topicId,
          stance,
          analysisResult.scores.winner
        );
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    performAnalysis();
  }, [character, messages]);

  // ローディング画面
  if (isAnalyzing || !result || !character || !topic) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingTitle}>AIが分析中...</Text>
          <Text style={styles.loadingText}>
            GPT-5があなたのディベートを{'\n'}評価しています
          </Text>
          <View style={styles.loadingSteps}>
            <Text style={styles.loadingStep}>📊 論理構造を分析中...</Text>
            <Text style={styles.loadingStep}>📚 証拠力を評価中...</Text>
            <Text style={styles.loadingStep}>🤝 話し方を確認中...</Text>
            <Text style={styles.loadingStep}>⚔️ 反論力を計測中...</Text>
            <Text style={styles.loadingStep}>📝 構造化を検証中...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getWinnerText = () => {
    switch (result.winner) {
      case 'user':
        return '🎉 あなたの勝利！';
      case 'ai':
        return '😤 AIの勝利';
      case 'draw':
        return '🤝 引き分け';
    }
  };

  const getWinnerColor = () => {
    switch (result.winner) {
      case 'user':
        return '#4CAF50';
      case 'ai':
        return '#F44336';
      case 'draw':
        return '#FF9800';
    }
  };

  const stanceText = stance === 'pro' ? '賛成' : '反対';

  // フィードバックを低スコアと高スコアに分類
  const lowScoreFeedback = result.feedback.filter((f) => f.score < 60);
  const highScoreFeedback = result.feedback.filter((f) => f.score >= 80);

  // 総合評価基準を取得
  const scoreCriteria = getScoreCriteria(result.overallScore);
  const overallEvaluation = generateOverallEvaluation(result.overallScore);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 結果ヘッダー */}
        <View style={styles.resultHeader}>
          <Text style={[styles.winnerText, { color: getWinnerColor() }]}>
            {getWinnerText()}
          </Text>
          <View style={styles.matchInfo}>
            <Text style={styles.vsText}>
              あなた vs {character.avatar} {character.name}
            </Text>
            <Text style={styles.topicText}>{topic.title}</Text>
            <Text style={styles.stanceText}>あなたの立場: {stanceText}</Text>
          </View>
        </View>

        {/* 総合スコア */}
        <View style={styles.overallScoreContainer}>
          <Text style={styles.overallScoreLabel}>総合スコア</Text>
          <Text style={styles.overallScoreValue}>{result.overallScore}</Text>
          <Text style={styles.overallScoreMax}>/ 100</Text>
        </View>

        {/* 評価レベル表示 */}
        {scoreCriteria && (
          <View style={styles.criteriaContainer}>
            <View style={styles.criteriaHeader}>
              <Text style={styles.criteriaTitle}>📊 あなたのレベル</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{scoreCriteria.title}</Text>
              </View>
            </View>

            <View style={styles.criteriaSection}>
              <Text style={styles.criteriaSectionTitle}>特徴</Text>
              {scoreCriteria.characteristics.map((char, index) => (
                <View key={index} style={styles.criteriaItem}>
                  <Text style={styles.criteriaBullet}>•</Text>
                  <Text style={styles.criteriaText}>{char}</Text>
                </View>
              ))}
            </View>

            {scoreCriteria.improvementAreas && scoreCriteria.improvementAreas.length > 0 && (
              <View style={styles.criteriaSection}>
                <Text style={styles.criteriaSectionTitle}>次のステップ</Text>
                {scoreCriteria.improvementAreas.map((area, index) => (
                  <View key={index} style={styles.criteriaItem}>
                    <Text style={styles.criteriaBullet}>→</Text>
                    <Text style={styles.criteriaText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI分析バッジ */}
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>🤖 Judge Analyst + Learning Coach による分析結果</Text>
        </View>

        {/* Learning Coachからの個別フィードバック */}
        {learningCoachFeedback && (
          <View style={styles.coachFeedbackContainer}>
            <Text style={styles.coachFeedbackTitle}>🎓 ラーニング・コーチからのアドバイス</Text>
            <Text style={styles.coachFeedbackText}>{learningCoachFeedback}</Text>
          </View>
        )}

        {/* レーダーチャート */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>スキル分析</Text>
          <RadarChart scores={result.scores} />
        </View>

        {/* 改善点フィードバック */}
        {lowScoreFeedback.length > 0 && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.sectionTitle}>💡 改善ポイント</Text>
            {lowScoreFeedback.map((item, index) => (
              <View key={index} style={styles.feedbackItemNegative}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackAxisName}>{item.axisName}</Text>
                  <Text style={styles.feedbackScore}>{item.score}点</Text>
                </View>
                <Text style={styles.feedbackMessage}>{item.message}</Text>
                {item.suggestion && (
                  <View style={styles.suggestionContainer}>
                    <Text style={styles.suggestionText}>{item.suggestion}</Text>
                    <TouchableOpacity style={styles.learnButton}>
                      <Text style={styles.learnButtonText}>
                        学習コンテンツを見る →
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 高評価フィードバック */}
        {highScoreFeedback.length > 0 && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.sectionTitle}>✨ 優れている点</Text>
            {highScoreFeedback.map((item, index) => (
              <View key={index} style={styles.feedbackItemPositive}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackAxisName}>{item.axisName}</Text>
                  <Text style={styles.feedbackScoreGood}>{item.score}点</Text>
                </View>
                <Text style={styles.feedbackMessage}>{item.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 各ターンの詳細フィードバック */}
        {turnFeedbacks.length > 0 && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.sectionTitle}>📝 各ターンの詳細フィードバック</Text>
            <Text style={styles.sectionSubtitle}>
              あなたの各発言について、良い点と改善点を具体的に分析しました
            </Text>
            {turnFeedbacks.map((feedback, index) => (
              <View key={index} style={styles.turnFeedbackCard}>
                <View style={styles.turnFeedbackHeader}>
                  <Text style={styles.turnNumber}>ターン {feedback.turn}</Text>
                  <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>{feedback.phase}</Text>
                  </View>
                </View>

                {/* ユーザーの発言 */}
                <View style={styles.userMessageBox}>
                  <Text style={styles.userMessageLabel}>あなたの発言:</Text>
                  <Text style={styles.userMessageText}>{feedback.userMessage}</Text>
                </View>

                {/* 良い点 */}
                {feedback.strengths.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>✨ 良い点</Text>
                    {feedback.strengths.map((strength, idx) => (
                      <View key={idx} style={styles.feedbackPoint}>
                        <Text style={styles.feedbackBullet}>•</Text>
                        <Text style={styles.feedbackPointText}>{strength}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 改善点 */}
                {feedback.improvements.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>💡 改善点</Text>
                    {feedback.improvements.map((improvement, idx) => (
                      <View key={idx} style={styles.feedbackPoint}>
                        <Text style={styles.feedbackBullet}>•</Text>
                        <Text style={styles.feedbackPointText}>{improvement}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 具体例 */}
                {feedback.specificExample && (
                  <View style={styles.specificExampleBox}>
                    <Text style={styles.specificExampleTitle}>📌 具体的な分析</Text>
                    <Text style={styles.specificExampleText}>{feedback.specificExample}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 詳細表示トグル */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? '詳細を隠す ▲' : '詳細を表示 ▼'}
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <>
            {/* 評価基準一覧 */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>📋 評価基準一覧</Text>
              <Text style={styles.detailsSubtitle}>
                各点数帯の詳細な評価基準をご確認いただけます
              </Text>
              {SCORE_CRITERIA.map((criteria, index) => (
                <View
                  key={index}
                  style={[
                    styles.criteriaDetailItem,
                    scoreCriteria?.range === criteria.range && styles.criteriaDetailItemActive,
                  ]}
                >
                  <View style={styles.criteriaDetailHeader}>
                    <Text style={styles.criteriaDetailRange}>{criteria.range}点</Text>
                    <Text
                      style={[
                        styles.criteriaDetailTitle,
                        scoreCriteria?.range === criteria.range && styles.criteriaDetailTitleActive,
                      ]}
                    >
                      {criteria.title}
                    </Text>
                    {scoreCriteria?.range === criteria.range && (
                      <View style={styles.currentLevelBadge}>
                        <Text style={styles.currentLevelBadgeText}>現在</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.criteriaDetailBody}>
                    {criteria.characteristics.map((char, charIndex) => (
                      <View key={charIndex} style={styles.criteriaDetailPoint}>
                        <Text style={styles.criteriaDetailBullet}>•</Text>
                        <Text style={styles.criteriaDetailText}>{char}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* あなたの発言 */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>あなたの発言 ({messages.length}件)</Text>
              {messages.map((msg, index) => (
                <View key={index} style={styles.messageItem}>
                  <Text style={styles.messageNumber}>#{index + 1}</Text>
                  <Text style={styles.messageContent}>{msg}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rematchButton}
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: 'MainTabs' },
                    { name: 'CharacterSelect' },
                  ],
                })
              );
            }}
          >
            <Text style={styles.rematchButtonText}>もう一度挑戦する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                })
              );
            }}
          >
            <Text style={styles.homeButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingSteps: {
    alignSelf: 'stretch',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  loadingStep: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 10,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  matchInfo: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 4,
  },
  stanceText: {
    fontSize: 13,
    color: '#95A5A6',
  },
  overallScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginRight: 10,
  },
  overallScoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  overallScoreMax: {
    fontSize: 20,
    color: '#BDC3C7',
    marginLeft: 5,
  },
  aiBadge: {
    backgroundColor: '#E8F4FF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aiBadgeText: {
    fontSize: 12,
    color: '#4A90D9',
    fontWeight: '600',
  },
  coachFeedbackContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  coachFeedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  coachFeedbackText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 22,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackItemNegative: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  feedbackItemPositive: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackAxisName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  feedbackScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  feedbackScoreGood: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 22,
    marginBottom: 10,
  },
  suggestionContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
  },
  suggestionText: {
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 20,
    marginBottom: 10,
  },
  learnButton: {
    alignSelf: 'flex-start',
  },
  learnButtonText: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: 'bold',
  },
  detailsToggle: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
  },
  detailsToggleText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  messageNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginRight: 10,
    width: 25,
  },
  messageContent: {
    flex: 1,
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
  },
  rematchButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rematchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  homeButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  criteriaContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  criteriaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  criteriaSection: {
    marginBottom: 15,
  },
  criteriaSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D6D7E',
    marginBottom: 10,
  },
  criteriaItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  criteriaBullet: {
    fontSize: 14,
    color: '#4A90D9',
    marginRight: 10,
    fontWeight: 'bold',
  },
  criteriaText: {
    flex: 1,
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  detailsSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 15,
    marginTop: -5,
  },
  criteriaDetailItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  criteriaDetailItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90D9',
  },
  criteriaDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  criteriaDetailRange: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90D9',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  criteriaDetailTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  criteriaDetailTitleActive: {
    color: '#1976D2',
  },
  currentLevelBadge: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentLevelBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  criteriaDetailBody: {
    paddingLeft: 5,
  },
  criteriaDetailPoint: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  criteriaDetailBullet: {
    fontSize: 13,
    color: '#7F8C8D',
    marginRight: 8,
  },
  criteriaDetailText: {
    flex: 1,
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 19,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 15,
    marginTop: -5,
  },
  turnFeedbackCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90D9',
  },
  turnFeedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  turnNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  phaseBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  userMessageBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  userMessageLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 6,
  },
  userMessageText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  feedbackPoint: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 5,
  },
  feedbackBullet: {
    fontSize: 14,
    color: '#4A90D9',
    marginRight: 8,
    fontWeight: 'bold',
  },
  feedbackPointText: {
    flex: 1,
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  specificExampleBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  specificExampleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  specificExampleText: {
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 19,
  },
});

export default ResultsScreen;
