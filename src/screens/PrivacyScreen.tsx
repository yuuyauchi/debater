import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export const PrivacyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>プライバシーポリシー</Text>
          <Text style={styles.lastUpdated}>最終更新日: 2026年1月1日</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. 個人情報の収集について</Text>
            <Text style={styles.sectionText}>
              本アプリ「Debate Dojo」（以下「本アプリ」といいます）では、ユーザーの皆様により良いサービスを提供するため、以下の情報を収集する場合があります。
            </Text>
            <Text style={styles.listItem}>• アプリの利用状況データ</Text>
            <Text style={styles.listItem}>• デバイス情報（OS、機種名など）</Text>
            <Text style={styles.listItem}>• ディベートの履歴と成績データ</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 個人情報の利用目的</Text>
            <Text style={styles.sectionText}>
              収集した情報は、以下の目的で利用いたします。
            </Text>
            <Text style={styles.listItem}>• 本アプリのサービス提供・運営</Text>
            <Text style={styles.listItem}>• ユーザーの学習進捗の管理</Text>
            <Text style={styles.listItem}>• サービスの改善・新機能の開発</Text>
            <Text style={styles.listItem}>• お問い合わせへの対応</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. マイクの使用について</Text>
            <Text style={styles.sectionText}>
              本アプリはディベート練習のために音声を録音します。マイクを使用して、あなたの議論を音声で入力し、AIがそれを評価してフィードバックを提供します。
            </Text>
            <Text style={[styles.sectionText, {marginTop: 8}]}>
              例えば、「環境保護について」とディベートする際に、あなたの意見を音声で入力できます。録音された音声データは、評価のためにのみ使用され、第三者に提供されることはありません。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 個人情報の第三者提供</Text>
            <Text style={styles.sectionText}>
              当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </Text>
            <Text style={styles.listItem}>• ユーザーの同意がある場合</Text>
            <Text style={styles.listItem}>• 法令に基づく場合</Text>
            <Text style={styles.listItem}>• 人の生命、身体または財産の保護のために必要がある場合</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. 個人情報の管理</Text>
            <Text style={styles.sectionText}>
              当社は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、必要かつ適切な安全管理措置を講じます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. データの保存期間</Text>
            <Text style={styles.sectionText}>
              収集したデータは、サービス提供に必要な期間、または法令で定められた期間保存いたします。ユーザーがアプリをアンインストールした場合、ローカルに保存されたデータは削除されます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. プライバシーポリシーの変更</Text>
            <Text style={styles.sectionText}>
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本アプリ内に掲示した時点より効力を生じるものとします。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. お問い合わせ</Text>
            <Text style={styles.sectionText}>
              本プライバシーポリシーに関するお問い合わせは、アプリ内の「お問い合わせ」からご連絡ください。
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>以上</Text>
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 22,
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
    fontSize: 14,
    color: '#95A5A6',
  },
});

export default PrivacyScreen;
