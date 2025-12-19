import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CHARACTERS, TOPICS, Character, CHARACTER_IMAGES } from '../data/mockData';
import { usePurchase } from '../context/PurchaseContext';

type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Debate: { characterId: string; topicId: string; stance: 'pro' | 'con' };
  Results: { characterId: string; topicId: string; stance: 'pro' | 'con'; messages: string[] };
  Purchase: undefined;
};

type CharacterSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterSelect'>;
};

const getLevelLabel = (level: number): string => {
  if (level <= 3) return '初級';
  if (level <= 6) return '中級';
  return '上級';
};

const getLevelColor = (level: number): string => {
  if (level <= 3) return '#4CAF50';
  if (level <= 6) return '#FF9800';
  return '#F44336';
};

// キャラクター画像コンポーネント（ローディング状態付き）
const CharacterImage: React.FC<{ imageKey: string; avatar: string }> = ({ imageKey, avatar }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <View style={[styles.characterImage, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{avatar}</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      {isLoading && (
        <View style={[styles.characterImage, styles.imagePlaceholder]}>
          <ActivityIndicator size="small" color="#4A90D9" />
        </View>
      )}
      <Image
        source={CHARACTER_IMAGES[imageKey]}
        style={[styles.characterImage, isLoading && styles.hiddenImage]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        fadeDuration={200}
      />
    </View>
  );
};

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ navigation }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const { isPurchased } = usePurchase();

  const handleCharacterSelect = (character: Character) => {
    // プレミアムキャラクターで課金していない場合、課金画面に誘導
    if (character.isPremium && !isPurchased) {
      Alert.alert(
        'キャラクター解放',
        `${character.name}は課金限定キャラクターです。\n全キャラクター解放（¥1,000）を購入しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '購入する', onPress: () => navigation.navigate('Purchase') },
        ]
      );
      return;
    }
    setSelectedCharacter(character);
  };

  const startDebate = () => {
    if (!selectedCharacter) {
      Alert.alert('エラー', '対戦相手を選択してください');
      return;
    }

    // プレミアムキャラクターで課金していない場合、再確認
    if (selectedCharacter.isPremium && !isPurchased) {
      Alert.alert('エラー', 'このキャラクターは課金が必要です');
      return;
    }

    // ランダムにトピックと立場を選択
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const randomStance = Math.random() > 0.5 ? 'pro' : 'con';

    // 立場の説明を表示
    const stanceText = randomStance === 'pro' ? '賛成' : '反対';
    Alert.alert(
      'ディベート開始',
      `トピック: ${randomTopic.title}\n\nあなたの立場: ${stanceText}\n\n準備はよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '開始する',
          onPress: () => {
            navigation.navigate('Debate', {
              characterId: selectedCharacter.id,
              topicId: randomTopic.id,
              stance: randomStance,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>対戦相手を選択</Text>
        <Text style={styles.subtitle}>AIキャラクターを選んでディベートを開始しましょう</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {CHARACTERS.map((character) => {
          const isLocked = character.isPremium && !isPurchased;
          return (
            <TouchableOpacity
              key={character.id}
              style={[
                styles.characterCard,
                selectedCharacter?.id === character.id && styles.selectedCard,
                isLocked && styles.lockedCard,
              ]}
              onPress={() => handleCharacterSelect(character)}
              activeOpacity={0.7}
            >
            <View style={styles.cardHeader}>
              <View style={styles.imageContainer}>
                <CharacterImage imageKey={character.imageKey} avatar={character.avatar} />
                {isLocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardTitleSection}>
                <View style={styles.nameRow}>
                  <Text style={[styles.characterName, isLocked && styles.lockedText]}>
                    {character.name}
                  </Text>
                  {isLocked && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>課金限定</Text>
                    </View>
                  )}
                </View>
                <View style={styles.levelBadge}>
                  <View
                    style={[
                      styles.levelIndicator,
                      { backgroundColor: getLevelColor(character.level) },
                    ]}
                  />
                  <Text style={styles.levelText}>
                    Lv.{character.level} {getLevelLabel(character.level)}
                  </Text>
                </View>
              </View>
              {selectedCharacter?.id === character.id && !isLocked && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.description, isLocked && styles.lockedText]}>
              {isLocked ? 'このキャラクターを使用するには課金が必要です' : character.description}
            </Text>

            {/* 特徴バー */}
            <View style={styles.biasContainer}>
              <View style={styles.biasItem}>
                <Text style={styles.biasLabel}>論理</Text>
                <View style={styles.biasBar}>
                  <View
                    style={[
                      styles.biasFill,
                      { width: `${character.logic_bias * 80}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.biasItem}>
                <Text style={styles.biasLabel}>証拠</Text>
                <View style={styles.biasBar}>
                  <View
                    style={[
                      styles.biasFill,
                      { width: `${character.evidence_bias * 80}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.biasItem}>
                <Text style={styles.biasLabel}>反論</Text>
                <View style={styles.biasBar}>
                  <View
                    style={[
                      styles.biasFill,
                      { width: `${character.refutation_bias * 80}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedCharacter && styles.disabledButton]}
          onPress={startDebate}
          disabled={!selectedCharacter}
        >
          <Text style={styles.startButtonText}>
            {selectedCharacter
              ? `${selectedCharacter.name}と対戦する`
              : '対戦相手を選択してください'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingTop: 5,
  },
  characterCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  lockedCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
  characterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholder: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  hiddenImage: {
    opacity: 0,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
  },
  avatarFallbackText: {
    fontSize: 28,
  },
  cardTitleSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  lockedText: {
    color: '#95A5A6',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  levelText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
    marginBottom: 12,
  },
  biasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  biasItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  biasLabel: {
    fontSize: 10,
    color: '#95A5A6',
    marginBottom: 4,
    textAlign: 'center',
  },
  biasBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  biasFill: {
    height: '100%',
    backgroundColor: '#4A90D9',
    borderRadius: 2,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  startButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CharacterSelectScreen;
