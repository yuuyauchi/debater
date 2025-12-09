import { Character } from '../data/mockData';

export interface DebateScore {
  logic: number;      // 論理構造
  evidence: number;   // 証拠力
  tone: number;       // 話し方
  refutation: number; // 反論力
  clarity: number;    // 構造化
}

export interface DebateResult {
  scores: DebateScore;
  overallScore: number;
  feedback: FeedbackItem[];
  winner: 'user' | 'ai' | 'draw';
}

export interface FeedbackItem {
  axis: keyof DebateScore;
  axisName: string;
  score: number;
  message: string;
  suggestion?: string;
}

// スコア計算ロジック
// キャラクターのレベルとバイアスに基づいてスコアを生成
export function calculateDebateScore(
  character: Character,
  userMessages: string[]
): DebateResult {
  const baseScore = 50; // 基本スコア
  const messageBonus = Math.min(userMessages.length * 5, 25); // メッセージ数ボーナス（最大25）

  // メッセージの長さに基づくボーナス
  const avgMessageLength = userMessages.reduce((acc, msg) => acc + msg.length, 0) / Math.max(userMessages.length, 1);
  const lengthBonus = Math.min(avgMessageLength / 10, 15); // 長さボーナス（最大15）

  // ランダム要素
  const randomFactor = () => Math.random() * 20 - 10; // -10 ~ +10

  // キャラクターの難易度による減点
  const difficultyPenalty = (character.level - 5) * 3; // レベル5を基準に±調整

  // 各軸のスコア計算
  const scores: DebateScore = {
    logic: clampScore(
      baseScore + messageBonus + lengthBonus + randomFactor() - (difficultyPenalty * character.logic_bias)
    ),
    evidence: clampScore(
      baseScore + messageBonus + lengthBonus + randomFactor() - (difficultyPenalty * character.evidence_bias)
    ),
    tone: clampScore(
      baseScore + messageBonus + lengthBonus + randomFactor() - (difficultyPenalty * character.tone_bias)
    ),
    refutation: clampScore(
      baseScore + messageBonus + lengthBonus + randomFactor() - (difficultyPenalty * character.refutation_bias)
    ),
    clarity: clampScore(
      baseScore + messageBonus + lengthBonus + randomFactor() - (difficultyPenalty * character.clarity_bias)
    ),
  };

  // 総合スコア計算
  const overallScore = Math.round(
    (scores.logic + scores.evidence + scores.tone + scores.refutation + scores.clarity) / 5
  );

  // フィードバック生成
  const feedback = generateFeedback(scores);

  // 勝敗判定
  const winner = determineWinner(overallScore, character.level);

  return {
    scores,
    overallScore,
    feedback,
    winner,
  };
}

// スコアを0-100の範囲に収める
function clampScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}

// フィードバック生成
function generateFeedback(scores: DebateScore): FeedbackItem[] {
  const feedback: FeedbackItem[] = [];
  const axisNames: Record<keyof DebateScore, string> = {
    logic: '論理構造',
    evidence: '証拠力',
    tone: '話し方',
    refutation: '反論力',
    clarity: '構造化',
  };

  const suggestions: Record<keyof DebateScore, string> = {
    logic: '「C-R-E-E-Pフレームワーク」を確認して、論理的な議論の構築方法を学びましょう。',
    evidence: '具体的なデータや事例を使って主張を裏付けることを意識しましょう。',
    tone: '「敬意ある反対意見の表明」のコンテンツで、建設的な議論の仕方を学びましょう。',
    refutation: '相手の主張の弱点を見つけ、的確に反論する練習をしましょう。',
    clarity: '議論を明確に構造化し、ポイントを整理して伝えることを心がけましょう。',
  };

  // 低いスコア（60未満）の軸にフィードバックを生成
  (Object.keys(scores) as Array<keyof DebateScore>).forEach((axis) => {
    const score = scores[axis];
    const axisName = axisNames[axis];

    if (score < 60) {
      feedback.push({
        axis,
        axisName,
        score,
        message: `「${axisName}」の評価が低いです。`,
        suggestion: suggestions[axis],
      });
    } else if (score >= 80) {
      feedback.push({
        axis,
        axisName,
        score,
        message: `「${axisName}」が優れています！`,
      });
    }
  });

  return feedback;
}

// 勝敗判定
function determineWinner(overallScore: number, characterLevel: number): 'user' | 'ai' | 'draw' {
  const threshold = 50 + characterLevel * 3; // キャラクターレベルに応じた閾値

  if (overallScore >= threshold + 10) {
    return 'user';
  } else if (overallScore < threshold - 10) {
    return 'ai';
  } else {
    return 'draw';
  }
}

// ユーザーの累計スコアを更新
export function updateOverallUserScore(
  currentScore: number,
  debateCount: number,
  newScore: number
): number {
  // 累計スコアの加重平均を計算
  return Math.round(
    (currentScore * debateCount + newScore) / (debateCount + 1)
  );
}
