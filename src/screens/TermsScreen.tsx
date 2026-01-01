import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export const TermsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>利用規約</Text>
          <Text style={styles.lastUpdated}>最終更新日: 2026年1月1日</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第1条（適用）</Text>
            <Text style={styles.sectionText}>
              本利用規約（以下「本規約」といいます）は、本アプリケーション「Debate Dojo」（以下「本アプリ」といいます）の利用に関する条件を、本アプリを利用するすべてのユーザー（以下「ユーザー」といいます）と当社との間で定めるものです。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第2条（利用登録）</Text>
            <Text style={styles.sectionText}>
              ユーザーは、本アプリをダウンロードし、起動することで、本規約に同意したものとみなされます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第3条（禁止事項）</Text>
            <Text style={styles.sectionText}>
              ユーザーは、本アプリの利用にあたり、以下の行為をしてはなりません。
            </Text>
            <Text style={styles.listItem}>• 法令または公序良俗に違反する行為</Text>
            <Text style={styles.listItem}>• 犯罪行為に関連する行為</Text>
            <Text style={styles.listItem}>• 本アプリの運営を妨害する行為</Text>
            <Text style={styles.listItem}>• 他のユーザーに迷惑をかける行為</Text>
            <Text style={styles.listItem}>• 不正アクセスまたは試みる行為</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第4条（知的財産権）</Text>
            <Text style={styles.sectionText}>
              本アプリに関する知的財産権は、すべて当社に帰属します。ユーザーは、本アプリを個人的な用途でのみ使用することができます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第5条（免責事項）</Text>
            <Text style={styles.sectionText}>
              当社は、本アプリの内容の正確性、完全性、有用性について保証いたしません。また、本アプリの利用により生じた損害について、一切の責任を負いません。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第6条（規約の変更）</Text>
            <Text style={styles.sectionText}>
              当社は、ユーザーの承諾を得ることなく、本規約を変更することができます。変更後の規約は、本アプリ内に掲示した時点より効力を生じるものとします。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>第7条（準拠法・裁判管轄）</Text>
            <Text style={styles.sectionText}>
              本規約の解釈にあたっては、日本法を準拠法とします。本アプリに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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

export default TermsScreen;
