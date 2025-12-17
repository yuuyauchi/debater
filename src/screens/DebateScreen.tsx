import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { CHARACTERS, TOPICS, CHARACTER_IMAGES } from '../data/mockData';
import { getChallengerResponse } from '../services/MastraApiService';
import { VoiceInputBar } from '../components/VoiceInputBar';

export interface TurnMessage {
  text: string;
  turn: number;
  phase: string;
}

type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Debate: { characterId: string; topicId: string; stance: 'pro' | 'con' };
  Results: { characterId: string; topicId: string; stance: 'pro' | 'con'; messages: TurnMessage[] };
};

type DebateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Debate'>;
  route: RouteProp<RootStackParamList, 'Debate'>;
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  turn?: number;
  phase?: string;
}

// ディベートの構造定義（実際のディベート形式）
interface DebateTurn {
  turn: number;
  phase: '導入' | '反論' | '最終まとめ';
  speaker: 'AI' | 'ユーザー';
  role: string;
  time: number; // 推奨時間（秒）
}

const DEBATE_STRUCTURE: DebateTurn[] = [
  { turn: 1, phase: '導入', speaker: 'AI', role: '主張の提示', time: 300 },
  { turn: 2, phase: '導入', speaker: 'ユーザー', role: '主張の提示とAI主張への簡単な言及', time: 300 },
  { turn: 3, phase: '反論', speaker: 'AI', role: 'ユーザー主張への反論', time: 300 },
  { turn: 4, phase: '反論', speaker: 'ユーザー', role: 'AI主張への反論と自らの根拠の補強', time: 300 },
  { turn: 5, phase: '最終まとめ', speaker: 'AI', role: '議論全体の要約と結び', time: 300 },
  { turn: 6, phase: '最終まとめ', speaker: 'ユーザー', role: '議論全体の要約と勝利主張', time: 300 },
];

const TOTAL_TURNS = DEBATE_STRUCTURE.length;

export const DebateScreen: React.FC<DebateScreenProps> = ({ navigation, route }) => {
  const { characterId, topicId, stance } = route.params;

  const character = CHARACTERS.find((c) => c.id === characterId);
  const topic = TOPICS.find((t) => t.id === topicId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0); // 0 = 開始前, 1-6 = 各ターン
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isDebateStarted, setIsDebateStarted] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // キーボード表示/非表示の監視
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        // キーボード表示時にスクロールを最下部に
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // AIの立場を決定（ユーザーの逆）
  const aiStance = stance === 'pro' ? 'con' : 'pro';
  const aiStanceText = aiStance === 'pro' ? '賛成' : '反対';
  const userStanceText = stance === 'pro' ? '賛成' : '反対';

  // 現在のターン情報を取得
  const getCurrentTurnInfo = (): DebateTurn | null => {
    if (currentTurn === 0 || currentTurn > TOTAL_TURNS) return null;
    return DEBATE_STRUCTURE[currentTurn - 1];
  };

  // 現在のターンがユーザーのターンかどうか
  const isUserTurn = (): boolean => {
    const turnInfo = getCurrentTurnInfo();
    return turnInfo?.speaker === 'ユーザー';
  };

  // ターンタイマー
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= TOTAL_TURNS) {
      const turnInfo = getCurrentTurnInfo();
      if (turnInfo) {
        setTurnTimeLeft(turnInfo.time);

        // タイマー開始
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
          setTurnTimeLeft((prev) => {
            if (prev <= 1) {
              return 0; // タイマー切れでも自動終了しない（ターン制のため）
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentTurn]);

  // ディベート開始時にAIの最初の主張を生成
  useEffect(() => {
    if (!isDebateStarted) {
      startDebate();
    }
  }, []);

  // AIターンの処理
  const processAiTurn = async (turnNumber: number) => {
    const turnInfo = DEBATE_STRUCTURE[turnNumber - 1];
    if (!turnInfo || turnInfo.speaker !== 'AI') return;

    setIsAiThinking(true);

    try {
      // 現在までの会話を構築
      const transcript = messages
        .map((m) => `${m.sender === 'user' ? 'ユーザー' : 'AI'}: ${m.text}`)
        .join('\n\n');

      // フェーズに応じたプロンプトを生成
      const phasePrompt = buildPhasePrompt(turnInfo, transcript);

      const aiResponseText = await getChallengerResponse(
        phasePrompt,
        characterId,
        topic?.title,
        aiStance
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        turn: turnNumber,
        phase: turnInfo.phase,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // AIターン完了後、次のターンへ
      if (turnNumber < TOTAL_TURNS) {
        setCurrentTurn(turnNumber + 1);
      } else {
        // ディベート終了
        setTimeout(() => endDebate(), 1500);
      }
    } catch (error) {
      console.error('AI response error:', error);
      Alert.alert('エラー', 'AIの応答取得に失敗しました');
    } finally {
      setIsAiThinking(false);
    }
  };

  // フェーズに応じたプロンプト生成
  const buildPhasePrompt = (turnInfo: DebateTurn, transcript: string): string => {
    const baseContext = transcript || '（まだ議論が始まっていません）';

    switch (turnInfo.turn) {
      case 1: // 導入 - AI主張提示
        return `【ディベート開始】
トピック: ${topic?.title}
あなたの立場: ${aiStanceText}

これからディベートを始めます。まず最初に、あなたの立場（${aiStanceText}）から主張を提示してください。
- 明確な主張（Claim）を述べてください
- 主張を支える理由（Reason）を2-3点挙げてください
- 具体的な根拠や例（Evidence）があれば含めてください

応答は90秒程度で読める長さにしてください。`;

      case 3: // 反論 - AIがユーザー主張に反論
        return `【反論フェーズ】
${baseContext}

ユーザーの主張に対して反論してください。
- ユーザーの主張の弱点や問題点を指摘してください
- 具体的な反証や反例を挙げてください
- 自分の立場（${aiStanceText}）の優位性を示してください

応答は90秒程度で読める長さにしてください。`;

      case 5: // 最終まとめ - AI要約
        return `【最終まとめフェーズ】
${baseContext}

これまでの議論を踏まえて、最終的なまとめを述べてください。
- 議論全体を簡潔に要約してください
- 自分の立場（${aiStanceText}）がなぜ優れているかを改めて主張してください
- 結論として、なぜあなたの主張が正しいか締めくくってください

応答は60秒程度で読める長さにしてください。`;

      default:
        return baseContext;
    }
  };

  // ディベート開始
  const startDebate = async () => {
    setIsDebateStarted(true);
    setCurrentTurn(1);

    // ターン1: AIの導入主張
    await processAiTurn(1);
  };

  // スクロール
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (text: string) => {
    // ユーザーのターンでない場合は無視
    if (!isUserTurn() || isAiThinking || currentTurn > TOTAL_TURNS) return;

    const turnInfo = getCurrentTurnInfo();
    if (!turnInfo) return;

    // ユーザーメッセージを追加
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
      turn: currentTurn,
      phase: turnInfo.phase,
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // 最終ターン（ターン6）の場合はディベート終了
    if (currentTurn >= TOTAL_TURNS) {
      setTimeout(() => endDebate(), 1500);
      return;
    }

    // 次のターン（AIターン）へ進む
    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);

    // 次がAIターンなら処理を開始
    const nextTurnInfo = DEBATE_STRUCTURE[nextTurn - 1];
    if (nextTurnInfo && nextTurnInfo.speaker === 'AI') {
      await processAiTurn(nextTurn);
    }
  };

  const endDebate = () => {
    // タイマーをクリア
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const userMessages: TurnMessage[] = messages
      .filter((m) => m.sender === 'user')
      .map((m) => ({
        text: m.text,
        turn: m.turn || 0,
        phase: m.phase || '',
      }));

    navigation.replace('Results', {
      characterId,
      topicId,
      stance,
      messages: userMessages,
    });
  };

  // 途中終了時はホーム画面に戻る（評価なし）
  // スタックをリセットして最初の画面に戻る
  const cancelDebate = () => {
    // タイマーをクリア
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  const confirmEndDebate = () => {
    Alert.alert(
      'ディベートを終了',
      '本当にディベートを終了しますか？\n途中終了した場合、評価は行われません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '終了する', onPress: cancelDebate, style: 'destructive' },
      ]
    );
  };

  const stanceColor = stance === 'pro' ? '#4CAF50' : '#F44336';
  const currentTurnInfo = getCurrentTurnInfo();
  const isInputDisabled = !isUserTurn() || isAiThinking || currentTurn > TOTAL_TURNS;

  // フェーズに応じた色を取得
  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case '導入': return '#4A90D9';
      case '反論': return '#E67E22';
      case '最終まとめ': return '#9B59B6';
      default: return '#7F8C8D';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      {/* ヘッダー - キーボード表示時は簡略表示 */}
      <View style={[styles.header, isKeyboardVisible && styles.headerCompact]}>
        <View style={styles.headerTop}>
          <View style={styles.opponentInfo}>
            {character && (
              <Image
                source={CHARACTER_IMAGES[character.imageKey]}
                style={styles.opponentImage}
              />
            )}
            <Text style={styles.opponentName}>{character?.name}</Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={[styles.timer, turnTimeLeft < 30 && turnTimeLeft > 0 && styles.timerWarning]}>
              {formatTime(turnTimeLeft)}
            </Text>
          </View>
          <TouchableOpacity onPress={confirmEndDebate} style={styles.endButton}>
            <Text style={styles.endButtonText}>終了</Text>
          </TouchableOpacity>
        </View>

        {/* トピック - キーボード表示時は非表示 */}
        {!isKeyboardVisible && (
          <View style={styles.topicContainer}>
            <Text style={styles.topicLabel}>トピック</Text>
            <Text style={styles.topicText}>{topic?.title}</Text>
            <View style={styles.stanceRow}>
              <View style={styles.stanceInfo}>
                <Text style={styles.stanceLabel}>あなた: </Text>
                <View style={[styles.stanceBadge, { backgroundColor: stanceColor }]}>
                  <Text style={styles.stanceBadgeText}>{userStanceText}</Text>
                </View>
              </View>
              <View style={styles.stanceInfo}>
                <Text style={styles.stanceLabel}>AI: </Text>
                <View style={[styles.stanceBadge, { backgroundColor: aiStance === 'pro' ? '#4CAF50' : '#F44336' }]}>
                  <Text style={styles.stanceBadgeText}>{aiStanceText}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* フェーズとターン表示 */}
        <View style={styles.phaseContainer}>
          {currentTurnInfo && (
            <>
              <View style={[styles.phaseBadge, { backgroundColor: getPhaseColor(currentTurnInfo.phase) }]}>
                <Text style={styles.phaseBadgeText}>{currentTurnInfo.phase}</Text>
              </View>
              <Text style={styles.turnText}>
                ターン {currentTurn} / {TOTAL_TURNS}
              </Text>
            </>
          )}
        </View>

        {/* ターン進行バー - キーボード表示時は非表示 */}
        {!isKeyboardVisible && (
          <View style={styles.turnProgressBar}>
            {DEBATE_STRUCTURE.map((turn) => (
              <View
                key={turn.turn}
                style={[
                  styles.turnProgressSegment,
                  { backgroundColor: getPhaseColor(turn.phase) },
                  currentTurn > turn.turn && styles.turnProgressCompleted,
                  currentTurn === turn.turn && styles.turnProgressCurrent,
                  currentTurn < turn.turn && styles.turnProgressPending,
                ]}
              />
            ))}
          </View>
        )}

        {/* 現在のターンの役割表示 - キーボード表示時は非表示 */}
        {!isKeyboardVisible && currentTurnInfo && (
          <View style={[
            styles.roleContainer,
            currentTurnInfo.speaker === 'ユーザー' ? styles.roleContainerUser : styles.roleContainerAi
          ]}>
            <Text style={styles.roleSpeaker}>
              {currentTurnInfo.speaker === 'ユーザー' ? '🎤 あなたのターン' : '🤖 AIのターン'}
            </Text>
            <Text style={styles.roleText}>{currentTurnInfo.role}</Text>
          </View>
        )}
      </View>

      {/* チャットエリア */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View key={message.id}>
            {/* メッセージにフェーズラベルを表示 */}
            {message.turn && message.phase && (
              <View style={styles.messageTurnLabel}>
                <View style={[styles.messagePhaseBadge, { backgroundColor: getPhaseColor(message.phase) }]}>
                  <Text style={styles.messagePhaseBadgeText}>
                    T{message.turn} {message.phase}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {message.sender === 'ai' && character && (
                <Image
                  source={CHARACTER_IMAGES[character.imageKey]}
                  style={styles.messageAvatarImage}
                />
              )}
              <View
                style={[
                  styles.messageContent,
                  message.sender === 'user'
                    ? styles.userMessageContent
                    : styles.aiMessageContent,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* AI思考中表示 */}
        {isAiThinking && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            {character && (
              <Image
                source={CHARACTER_IMAGES[character.imageKey]}
                style={styles.messageAvatarImage}
              />
            )}
            <View style={[styles.messageContent, styles.aiMessageContent]}>
              <View style={styles.thinkingContainer}>
                <Text style={styles.thinkingEmoji}>🤔</Text>
                <Text style={styles.thinkingText}>
                  {currentTurnInfo ? `${currentTurnInfo.role}...` : 'AIが思考中...'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ディベート終了メッセージ */}
        {currentTurn > TOTAL_TURNS && (
          <View style={styles.endMessage}>
            <Text style={styles.endMessageText}>
              ディベートが終了しました。結果画面に移動します...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 音声入力バー */}
      <VoiceInputBar
        onSend={handleSendMessage}
        disabled={isInputDisabled}
        placeholder={
          currentTurn > TOTAL_TURNS
            ? 'ディベートが終了しました'
            : !isUserTurn()
            ? 'AIのターンです...'
            : isAiThinking
            ? 'AIが思考中です...'
            : currentTurnInfo
            ? `${currentTurnInfo.role}を入力...`
            : '意見を入力してください...'
        }
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCompact: {
    paddingVertical: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  opponentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timerContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timerWarning: {
    color: '#F44336',
  },
  endButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  endButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topicContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  topicLabel: {
    fontSize: 10,
    color: '#95A5A6',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  stanceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  stanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stanceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  stanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stanceBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  turnText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  turnProgressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
    gap: 2,
  },
  turnProgressSegment: {
    flex: 1,
    height: '100%',
  },
  turnProgressCompleted: {
    opacity: 1,
  },
  turnProgressCurrent: {
    opacity: 1,
    borderWidth: 1,
    borderColor: '#2C3E50',
  },
  turnProgressPending: {
    opacity: 0.3,
  },
  roleContainer: {
    borderRadius: 8,
    padding: 10,
  },
  roleContainerUser: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  roleContainerAi: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  roleSpeaker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageTurnLabel: {
    alignItems: 'center',
    marginVertical: 8,
  },
  messagePhaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messagePhaseBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#F0F0F0',
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFF',
  },
  aiMessageText: {
    color: '#2C3E50',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  thinkingText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  endMessage: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  endMessageText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DebateScreen;
