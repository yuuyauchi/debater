import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DebateScore } from '../utils/scoringLogic';

interface DebateHistory {
  id: string;
  date: Date;
  characterId: string;
  topicId: string;
  stance: 'pro' | 'con';
  scores: DebateScore;
  overallScore: number;
  winner: 'user' | 'ai' | 'draw';
}

interface UserState {
  name: string;
  overallScore: number;
  debatesCount: number;
  averageScores: DebateScore;
  debateHistory: DebateHistory[];
}

interface UserContextType {
  user: UserState;
  updateUserAfterDebate: (
    scores: DebateScore,
    characterId: string,
    topicId: string,
    stance: 'pro' | 'con',
    winner: 'user' | 'ai' | 'draw'
  ) => void;
  resetUser: () => void;
}

const defaultUser: UserState = {
  name: 'あなた',
  overallScore: 0,
  debatesCount: 0,
  averageScores: {
    logic: 0,
    evidence: 0,
    tone: 0,
    refutation: 0,
    clarity: 0,
  },
  debateHistory: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(defaultUser);

  const updateUserAfterDebate = (
    scores: DebateScore,
    characterId: string,
    topicId: string,
    stance: 'pro' | 'con',
    winner: 'user' | 'ai' | 'draw'
  ) => {
    const newOverallScore = Math.round(
      (scores.logic + scores.evidence + scores.tone + scores.refutation + scores.clarity) / 5
    );

    const newHistory: DebateHistory = {
      id: Date.now().toString(),
      date: new Date(),
      characterId,
      topicId,
      stance,
      scores,
      overallScore: newOverallScore,
      winner,
    };

    setUser((prev) => {
      const newDebatesCount = prev.debatesCount + 1;

      // 加重平均で累計スコアを更新（初回は新しいスコアをそのまま使用）
      const updateAverage = (current: number, newVal: number): number => {
        if (prev.debatesCount === 0) {
          return newVal;
        }
        return Math.round(
          (current * prev.debatesCount + newVal) / newDebatesCount
        );
      };

      return {
        ...prev,
        overallScore: updateAverage(prev.overallScore, newOverallScore),
        debatesCount: newDebatesCount,
        averageScores: {
          logic: updateAverage(prev.averageScores.logic, scores.logic),
          evidence: updateAverage(prev.averageScores.evidence, scores.evidence),
          tone: updateAverage(prev.averageScores.tone, scores.tone),
          refutation: updateAverage(prev.averageScores.refutation, scores.refutation),
          clarity: updateAverage(prev.averageScores.clarity, scores.clarity),
        },
        debateHistory: [newHistory, ...prev.debateHistory].slice(0, 50), // 最新50件を保持
      };
    });
  };

  const resetUser = () => {
    setUser(defaultUser);
  };

  return (
    <UserContext.Provider value={{ user, updateUserAfterDebate, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
