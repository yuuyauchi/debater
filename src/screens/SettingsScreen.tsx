import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useUser } from '../context/UserContext';

export const SettingsScreen: React.FC = () => {
  const { resetUser } = useUser();
  const [darkMode, setDarkMode] = React.useState(false);

  const handleResetData = () => {
    Alert.alert(
      'データをリセット',
      'すべてのデータをリセットしますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            resetUser();
            Alert.alert('完了', 'データがリセットされました');
          },
        },
      ]
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      '利用規約',
      '利用規約ページは準備中です。',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'プライバシーポリシー',
      'プライバシーポリシーページは準備中です。',
      [{ text: 'OK' }]
    );
  };

  const handleEnquiryPress = () => {
    const email = 'yuuyauchi1998@gmail.com';
    const subject = 'Debate Dojoお問い合わせ';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            'エラー',
            'メールアプリを開けませんでした。',
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'エラー',
          'メールアプリを開けませんでした。',
          [{ text: 'OK' }]
        );
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>設定</Text>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabelDisabled}>プッシュ通知</Text>
                <Text style={styles.settingDescription}>
                  ディベートのリマインダーを受け取る（準備中）
                </Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E0E0E0', true: '#4A90D9' }}
                thumbColor="#FFF"
                disabled
              />
            </View>
          </View>
        </View>

        {/* 交換設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交換</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabelDisabled}>ポイント交換</Text>
                <Text style={styles.settingDescription}>
                  獲得したポイントを交換する（準備中）
                </Text>
              </View>
              <Text style={styles.comingSoonBadge}>準備中</Text>
            </View>
          </View>
        </View>

        {/* サウンド設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サウンド</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabelDisabled}>効果音</Text>
                <Text style={styles.settingDescription}>
                  ディベート中の効果音を有効にする（準備中）
                </Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E0E0E0', true: '#4A90D9' }}
                thumbColor="#FFF"
                disabled
              />
            </View>
          </View>
        </View>

        {/* 表示設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>ダークモード</Text>
                <Text style={styles.settingDescription}>
                  画面を暗い表示にする（準備中）
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#4A90D9' }}
                thumbColor="#FFF"
                disabled
              />
            </View>
          </View>
        </View>

        {/* データ管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ管理</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={handleResetData}
            >
              <Text style={styles.settingLabelDanger}>データをリセット</Text>
              <Text style={styles.settingDescriptionDanger}>
                すべての進捗と履歴を削除します
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>バージョン</Text>
              <Text style={styles.infoValue}>1.0.0 (プロトタイプ)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>アプリ名</Text>
              <Text style={styles.infoValue}>Debate Dojo</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ビルド</Text>
              <Text style={styles.infoValue}>2024.1</Text>
            </View>
          </View>
        </View>

        {/* リンク */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkItem} onPress={handleTermsPress}>
              <Text style={styles.linkText}>利用規約</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem} onPress={handlePrivacyPress}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem} onPress={handleEnquiryPress}>
              <Text style={styles.linkText}>お問い合わせ</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>⚔️ Debate Dojo</Text>
          <Text style={styles.footerSubtext}>ディベートで強くなろう</Text>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemButton: {
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingLabelDisabled: {
    fontSize: 16,
    fontWeight: '500',
    color: '#95A5A6',
    marginBottom: 4,
  },
  comingSoonBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: '#95A5A6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingLabelDanger: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E74C3C',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#95A5A6',
  },
  settingDescriptionDanger: {
    fontSize: 13,
    color: '#E74C3C',
    opacity: 0.7,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: '#2C3E50',
  },
  infoValue: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    fontSize: 15,
    color: '#2C3E50',
  },
  linkArrow: {
    fontSize: 16,
    color: '#BDC3C7',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BDC3C7',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
  },
});

export default SettingsScreen;
