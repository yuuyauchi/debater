import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LEARNING_CONTENTS, LearningContent } from '../data/mockData';

type TabType = 'framework' | 'fallacy' | 'tone';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'framework', label: 'フレームワーク', icon: '📐' },
  { key: 'fallacy', label: '議論のミス', icon: '⚠️' },
  { key: 'tone', label: '話し方', icon: '🤝' },
];

export const LearnScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('framework');
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  const filteredContents = LEARNING_CONTENTS.filter(
    (content) => content.category === activeTab
  );

  const toggleExpand = (contentId: string) => {
    setExpandedContent(expandedContent === contentId ? null : contentId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>学習</Text>
        <Text style={styles.subtitle}>ディベートスキルを磨きましょう</Text>
      </View>

      {/* タブバー */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* コンテンツリスト */}
      <ScrollView style={styles.contentList} contentContainerStyle={styles.contentListContainer}>
        {filteredContents.map((content) => (
          <View key={content.id} style={styles.contentCard}>
            <TouchableOpacity
              style={styles.contentHeader}
              onPress={() => toggleExpand(content.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.contentTitle}>{content.title}</Text>
              <Text style={styles.expandIcon}>
                {expandedContent === content.id ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {expandedContent === content.id && (
              <View style={styles.contentBody}>
                <Text style={styles.contentText}>{content.content}</Text>
              </View>
            )}
          </View>
        ))}

        {filteredContents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              このカテゴリのコンテンツは準備中です
            </Text>
          </View>
        )}

        {/* 学習進捗 */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📚 学習のヒント</Text>
          <Text style={styles.progressText}>
            ディベートでは、論理的に考え、相手の意見を尊重しながら自分の主張を伝えることが大切です。
            {'\n\n'}
            定期的にここで学んだフレームワークを復習し、実践で活用してみましょう。
          </Text>
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  activeTab: {
    backgroundColor: '#4A90D9',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabLabel: {
    color: '#FFF',
  },
  contentList: {
    flex: 1,
  },
  contentListContainer: {
    padding: 15,
    paddingTop: 5,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 10,
  },
  contentBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  contentText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90D9',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    color: '#5D6D7E',
    lineHeight: 20,
  },
});

export default LearnScreen;
