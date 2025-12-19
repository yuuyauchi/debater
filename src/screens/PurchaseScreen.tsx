import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePurchase } from '../context/PurchaseContext';
import { CHARACTERS } from '../data/mockData';

type RootStackParamList = {
  MainTabs: undefined;
  CharacterSelect: undefined;
  Purchase: undefined;
};

type PurchaseScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Purchase'>;
};

export const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ navigation }) => {
  const { isPurchased, isLoading, purchaseAllCharacters, restorePurchases } = usePurchase();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const premiumCharacters = CHARACTERS.filter((c) => c.isPremium);

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      await purchaseAllCharacters();
      Alert.alert(
        '購入完了',
        '全キャラクター解放が完了しました！',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('エラー', '購入に失敗しました。もう一度お試しください。');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      await restorePurchases();
      Alert.alert(
        '復元完了',
        '購入履歴を復元しました。',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('エラー', '復元できる購入履歴がありませんでした。');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isPurchased) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.purchasedContainer}>
          <Text style={styles.purchasedIcon}>✓</Text>
          <Text style={styles.purchasedTitle}>購入済み</Text>
          <Text style={styles.purchasedText}>
            全てのキャラクターが利用可能です
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>全キャラクター解放</Text>
          <Text style={styles.subtitle}>4人のプレミアムキャラクターを解放</Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>買い切り価格</Text>
          <Text style={styles.price}>¥1,000</Text>
          <Text style={styles.priceNote}>一度の購入で永久に利用可能</Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>解放されるキャラクター</Text>
          {premiumCharacters.map((character) => (
            <View key={character.id} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{character.avatar}</Text>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureName}>{character.name}</Text>
                <Text style={styles.featureDescription}>
                  Lv.{character.level} - {character.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>特典</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>初級から上級まで幅広い難易度に対応</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>それぞれ異なる戦略と特徴を持つキャラクター</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>ディベートスキルを効果的に向上</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>追加料金なし、買い切りで永久利用</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, (isPurchasing || isLoading) && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={isPurchasing || isLoading}
        >
          {isPurchasing || isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.purchaseButtonText}>¥1,000で購入する</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isPurchasing || isLoading}
        >
          <Text style={styles.restoreButtonText}>購入履歴を復元</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  priceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 12,
    color: '#95A5A6',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 18,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    fontSize: 15,
    color: '#5D6D7E',
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  purchaseButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#4A90D9',
    fontSize: 14,
    fontWeight: '600',
  },
  purchasedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  purchasedIcon: {
    fontSize: 80,
    color: '#4CAF50',
    marginBottom: 24,
  },
  purchasedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  purchasedText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default PurchaseScreen;
