import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

export const ContactScreen: React.FC = () => {
  const handleEmailPress = () => {
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
        <View style={styles.content}>
          <Text style={styles.title}>お問い合わせ</Text>

          <View style={styles.introSection}>
            <Text style={styles.introText}>
              Debate Dojoに関するご質問、ご要望、不具合の報告などがございましたら、以下の方法でお問い合わせください。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 メールでのお問い合わせ</Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailPress}
            >
              <Text style={styles.emailButtonText}>メールアプリを開く</Text>
            </TouchableOpacity>
            <Text style={styles.emailAddress}>yuuyauchi1998@gmail.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>お問い合わせ前にご確認ください</Text>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Q. ディベートの評価基準は？</Text>
              <Text style={styles.faqAnswer}>
                A. 論理性、根拠の明確さ、反論の説得力、構成力などを総合的に評価しています。詳しくは「学習」タブをご覧ください。
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Q. データが消えてしまった</Text>
              <Text style={styles.faqAnswer}>
                A. 現在、データはデバイスにローカル保存されています。アプリを削除すると、データも削除されますのでご注意ください。
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Q. 音声入力がうまく動作しない</Text>
              <Text style={styles.faqAnswer}>
                A. マイクの権限が許可されているか、設定アプリで確認してください。また、静かな環境でお試しください。
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>お問い合わせ時の注意事項</Text>
            <Text style={styles.listItem}>• お問い合わせには2〜3営業日以内に返信いたします</Text>
            <Text style={styles.listItem}>• 不具合報告の際は、デバイス情報やOSバージョンもお知らせください</Text>
            <Text style={styles.listItem}>• スクリーンショットを添付いただけると、より迅速な対応が可能です</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>⚔️ Debate Dojo</Text>
            <Text style={styles.footerSubtext}>ディベートで強くなろう</Text>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  introSection: {
    backgroundColor: '#E8F4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  introText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  emailButton: {
    backgroundColor: '#4A90D9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emailAddress: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 22,
    marginTop: 4,
    paddingLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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

export default ContactScreen;
