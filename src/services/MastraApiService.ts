/**
 * ApiService.ts
 *
 * AI機能統合のためのクライアントサービス
 *
 * 機能構成:
 * - 音声認識（STT）: OpenAI Whisper API直接使用
 * - Debate Challenger: 対戦エージェント
 * - Judge Analyst: 評価エージェント
 * - Learning Coach: 学習フィードバックエージェント
 */

import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { CHARACTERS } from '../data/mockData';

// API設定
const expoExtra = Constants.expoConfig?.extra;
const OPENAI_API_KEY = expoExtra?.openaiApiKey || process.env.OPENAI_API_KEY || '';

console.log('[ApiService] OPENAI_API_KEY configured:', !!OPENAI_API_KEY, 'length:', OPENAI_API_KEY.length);

// =====================================
// 型定義
// =====================================

export interface EvaluationScores {
  logic: number;      // 論理構造
  evidence: number;   // 証拠力
  tone: number;       // 話し方
  refutation: number; // 反論力
  clarity: number;    // 構造化
}

export interface FeedbackItem {
  axis: string;
  axisName: string;
  score: number;
  message: string;
  suggestion?: string;
  learnContentId?: string;
}

export interface EvaluationResult {
  scores: EvaluationScores;
  overallScore: number;
  winner: 'user' | 'ai' | 'draw';
  feedback: FeedbackItem[];
}

export interface EvaluationAndFeedbackResult {
  scores: EvaluationResult;
  feedback: string;
  turnFeedbacks?: TurnFeedback[];
}

export interface TurnFeedback {
  turn: number;
  phase: string;
  userMessage: string;
  strengths: string[];      // 良い点
  improvements: string[];   // 改善点
  specificExample: string;  // 具体例
}

// 録音の状態管理
let recording: Audio.Recording | null = null;

// =====================================
// 音声認識 (STT) - OpenAI Whisper API
// =====================================

/**
 * 録音を開始する
 */
export async function startRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
    console.log('[STT] Recording started');
  } catch (error) {
    console.error('[STT] Failed to start recording:', error);
    throw error;
  }
}

/**
 * 録音を停止してURIを取得する
 */
export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      console.log('[STT] No recording to stop');
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('[STT] Recording stopped, URI:', uri);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    recording = null;
    return uri;
  } catch (error) {
    console.error('[STT] Failed to stop recording:', error);
    recording = null;
    throw error;
  }
}

/**
 * 音声ファイルをテキストに変換する（STT）
 * OpenAI Whisper API を直接使用
 *
 * @param audioUri - 音声ファイルのURI
 * @returns 認識されたテキスト（日本語）
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    const errorMsg = 'OpenAI APIキーが設定されていません。.envファイルにOPENAI_API_KEYを設定してください。';
    console.error('[STT]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    console.log('[STT] Transcribing audio with OpenAI Whisper:', audioUri);

    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[STT] Whisper API error:', response.status, errorData);
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[STT] Transcription result:', result.text);
    return result.text || '';
  } catch (error) {
    console.error('[STT] Transcription error:', error);
    throw error;
  }
}

// =====================================
// Debate Challenger Agent
// =====================================

/**
 * 対戦エージェント（Debate Challenger）の応答生成
 * 直接OpenAI APIを呼び出す
 *
 * @param transcript - 現在までの議論全文
 * @param charId - AIキャラクターID
 * @param topicTitle - ディベートのトピック
 * @param aiStance - AIの立場（'pro' | 'con'）
 * @returns キャラクターの個性に合わせた反証テキスト（日本語）
 */
export async function getChallengerResponse(
  transcript: string,
  charId: string,
  topicTitle?: string,
  aiStance?: 'pro' | 'con'
): Promise<string> {
  console.log('[Debate Challenger] Generating response for character:', charId);

  // 直接OpenAI APIを呼び出す
  return await getChallengerResponseDirect(transcript, charId, topicTitle, aiStance);
}

/**
 * 直接OpenAI APIを呼び出す
 */
async function getChallengerResponseDirect(
  transcript: string,
  charId: string,
  topicTitle?: string,
  aiStance?: 'pro' | 'con'
): Promise<string> {
  console.log('[Debate Challenger] Direct API called');
  console.log('[Debate Challenger] API Key exists:', !!OPENAI_API_KEY);
  console.log('[Debate Challenger] API Key length:', OPENAI_API_KEY?.length || 0);
  console.log('[Debate Challenger] API Key prefix:', OPENAI_API_KEY?.substring(0, 10) || 'N/A');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    const errorMsg = 'OpenAI APIキーが設定されていません。.envファイルにOPENAI_API_KEYを設定してください。';
    console.error('[Debate Challenger]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const systemPrompt = getCharacterSystemPrompt(charId, topicTitle, aiStance);

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      max_tokens: 500,
      temperature: 0.8,
    };

    console.log('[Debate Challenger] Calling OpenAI API...');
    console.log('[Debate Challenger] Request URL: https://api.openai.com/v1/chat/completions');

    // XMLHttpRequestを使用してReact Native/Expo Goでの互換性を高める
    const response = await fetchWithXHR(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('[Debate Challenger] Response status:', response.status);

    if (!response.ok) {
      const errorText = response.body || '';
      console.error('[Debate Challenger] API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = JSON.parse(response.body);
    const content = result.choices?.[0]?.message?.content || '';
    console.log('[Debate Challenger] Success, response length:', content.length);
    return content;
  } catch (error: any) {
    console.error('[Debate Challenger] Direct API error:', error?.message || error);
    console.error('[Debate Challenger] Error name:', error?.name);
    console.error('[Debate Challenger] Error stack:', error?.stack);
    throw error;
  }
}

/**
 * XMLHttpRequestを使用したfetch代替
 * React Native/Expo Goでのネットワーク問題を回避
 */
function fetchWithXHR(
  url: string,
  options: { method: string; headers: Record<string, string>; body: string }
): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, url, true);

    // ヘッダーを設定
    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.timeout = 30000; // 30秒タイムアウト

    xhr.onload = () => {
      console.log('[XHR] onload, status:', xhr.status);
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        body: xhr.responseText,
      });
    };

    xhr.onerror = () => {
      console.error('[XHR] onerror event');
      reject(new Error('Network request failed (XHR)'));
    };

    xhr.ontimeout = () => {
      console.error('[XHR] ontimeout event');
      reject(new Error('Request timeout (XHR)'));
    };

    console.log('[XHR] Sending request...');
    xhr.send(options.body);
  });
}

// =====================================
// Judge Analyst Agent
// =====================================

/**
 * ディベートを評価してスコアを返す（Judge Analyst）
 * 直接OpenAI APIを呼び出す
 *
 * @param debateLog - 議論ログ全体
 * @param characterLevel - 対戦相手のレベル（1-9）
 * @returns 5軸の評価スコア
 */
export async function getJudgeScore(
  debateLog: string,
  characterLevel: number = 5
): Promise<EvaluationScores> {
  console.log('[Judge Analyst] Evaluating debate...');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    const errorMsg = 'OpenAI APIキーが設定されていません。.envファイルにOPENAI_API_KEYを設定してください。';
    console.error('[Judge Analyst]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const systemPrompt = `あなたはディベートの審査員です。
ユーザーのディベートパフォーマンスを客観的に評価し、5つの軸でスコアを算出します。

【評価軸】
1. Logic（論理構造）: 主張から結論への論理的な流れ
2. Evidence（証拠力）: 具体的なデータや事例の活用度
3. Tone（話し方）: 相手を尊重したていねいな議論姿勢
4. Refutation（反論力）: 相手の主張への効果的な反論
5. Clarity（構造化）: 議論の明確さ、ポイントの整理

【評価基準】
- 0-30: 非常に弱い
- 31-50: 改善の余地あり
- 51-70: 平均的
- 71-85: 良好
- 86-100: 優秀

必ずJSON形式で5つのスコアを返してください。`;

    const response = await fetchWithXHR(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: buildJudgePrompt(debateLog, characterLevel) },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = JSON.parse(response.body);
    const text = result.choices?.[0]?.message?.content || '';

    // JSONをパース
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scores = JSON.parse(jsonMatch[0]);
      console.log('[Judge Analyst] Scores:', scores);
      return scores as EvaluationScores;
    }

    throw new Error('Failed to parse scores from response');
  } catch (error) {
    console.error('[Judge Analyst] API error:', error);
    throw error;
  }
}

// =====================================
// Learning Coach Agent
// =====================================

/**
 * 学習フィードバックを生成する（Learning Coach）
 * 直接OpenAI APIを呼び出す
 *
 * @param debateLog - 議論ログ全体
 * @param scores - 評価スコア
 * @returns 学習コンテンツへの導線を含む個別フィードバック
 */
export async function getCoachingFeedback(
  debateLog: string,
  scores: EvaluationScores
): Promise<string> {
  console.log('[Learning Coach] Generating feedback...');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    const errorMsg = 'OpenAI APIキーが設定されていません。.envファイルにOPENAI_API_KEYを設定してください。';
    console.error('[Learning Coach]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const systemPrompt = `あなたはディベートの学習コーチです。
ユーザーのディベートパフォーマンスの評価結果に基づいて、具体的で励みになるフィードバックを提供します。

【役割】
- 改善が必要な点を優しく指摘する
- 具体的な学習アドバイスを提供する
- 学習コンテンツへの導線を含める
- ポジティブな点も認める

【学習コンテンツ】
- C-R-E-E-Pフレームワーク: 論理構造と証拠力の改善
- A-R-Eフレームワーク: 議論の構造化
- ストローマン論法: 反論力の向上
- 敬意ある反対意見の表明: 話し方の改善

日本語で親しみやすく、励ましを含めた建設的なトーンで書いてください。`;

    const response = await fetchWithXHR(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: buildCoachPrompt(debateLog, scores) },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = JSON.parse(response.body);
    const feedback = result.choices?.[0]?.message?.content || '';

    console.log('[Learning Coach] Feedback generated, length:', feedback.length);
    return feedback;
  } catch (error) {
    console.error('[Learning Coach] API error:', error);
    throw error;
  }
}

// =====================================
// Turn-by-Turn Feedback Agent
// =====================================

/**
 * 各ターンの発言に対する詳細なフィードバックを生成
 *
 * @param turnMessages - ターンごとのユーザーメッセージ
 * @param debateLog - 議論ログ全体
 * @returns 各ターンの良い点・改善点を含むフィードバック
 */
export async function getTurnByTurnFeedback(
  turnMessages: Array<{ text: string; turn: number; phase: string }>,
  debateLog: string
): Promise<TurnFeedback[]> {
  console.log('[Turn Feedback] Generating turn-by-turn feedback...');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    console.error('[Turn Feedback] API key not configured');
    throw new Error('OpenAI APIキーが設定されていません');
  }

  try {
    const systemPrompt = `あなたはディベートコーチです。ユーザーの各ターンの発言を分析し、具体的で建設的なフィードバックを提供します。

【役割】
- 各ターンの発言について、良い点を2-3個見つける
- 改善できる点を2-3個具体的に指摘する
- 発言から具体例を引用しながらフィードバックを行う
- 励ましを含めた建設的なトーンで書く

【フィードバックの観点】
- 論理構造：主張の明確さ、論理の流れ
- 証拠力：具体例やデータの使用
- 話し方：相手への敬意、表現の適切さ
- 反論力：相手の主張への対応
- 構造化：議論の整理、ポイントの明確さ

必ずJSON配列形式で回答してください。`;

    const userPrompt = `以下のディベートから、ユーザーの各ターンの発言を分析してください。

【議論全体】
${debateLog}

【ユーザーの各ターン発言】
${turnMessages.map(tm => `ターン${tm.turn}（${tm.phase}）: ${tm.text}`).join('\n\n')}

以下のJSON形式で、各ターンのフィードバックを返してください：
[
  {
    "turn": <ターン番号>,
    "strengths": ["良い点1", "良い点2"],
    "improvements": ["改善点1", "改善点2"],
    "specificExample": "発言から引用した具体例と分析"
  }
]`;

    const response = await fetchWithXHR(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = JSON.parse(response.body);
    const text = result.choices?.[0]?.message?.content || '';

    // JSONをパース
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const feedbacks = JSON.parse(jsonMatch[0]);

      // ターンメッセージの情報をマージ
      return feedbacks.map((fb: any) => {
        const turnMsg = turnMessages.find(tm => tm.turn === fb.turn);
        return {
          turn: fb.turn,
          phase: turnMsg?.phase || '',
          userMessage: turnMsg?.text || '',
          strengths: fb.strengths || [],
          improvements: fb.improvements || [],
          specificExample: fb.specificExample || '',
        };
      });
    }

    throw new Error('Failed to parse turn feedback from response');
  } catch (error) {
    console.error('[Turn Feedback] API error:', error);
    throw error;
  }
}

// =====================================
// 統合関数（後方互換性のため維持）
// =====================================

/**
 * 評価とフィードバックを統合して取得
 * getJudgeScore + getCoachingFeedback + getTurnByTurnFeedback を内部で呼び出す
 */
export async function getEvaluationAndFeedback(
  debateLog: string,
  characterId: string = 'sakura',
  turnMessages?: Array<{ text: string; turn: number; phase: string }>
): Promise<EvaluationAndFeedbackResult> {
  const character = CHARACTERS.find(c => c.id === characterId);
  const characterLevel = character?.level || 5;

  // Judge Analystでスコアを取得
  const scores = await getJudgeScore(debateLog, characterLevel);

  // Learning Coachでフィードバックを生成
  const feedbackText = await getCoachingFeedback(debateLog, scores);

  // 各ターンのフィードバックを生成
  let turnFeedbacks: TurnFeedback[] | undefined;
  if (turnMessages && turnMessages.length > 0) {
    try {
      turnFeedbacks = await getTurnByTurnFeedback(turnMessages, debateLog);
    } catch (error) {
      console.error('[getEvaluationAndFeedback] Turn feedback error:', error);
      // ターンフィードバックの生成に失敗しても、他の評価は継続
    }
  }

  // 総合スコアと勝敗を計算
  const overallScore = Math.round(
    (scores.logic + scores.evidence + scores.tone + scores.refutation + scores.clarity) / 5
  );

  const threshold = 50 + characterLevel * 3;
  let winner: 'user' | 'ai' | 'draw';
  if (overallScore >= threshold + 10) {
    winner = 'user';
  } else if (overallScore < threshold - 10) {
    winner = 'ai';
  } else {
    winner = 'draw';
  }

  // FeedbackItemsを生成
  const feedbackItems = generateFeedbackItems(scores);

  return {
    scores: {
      scores,
      overallScore,
      winner,
      feedback: feedbackItems,
    },
    feedback: feedbackText,
    turnFeedbacks,
  };
}

// 旧API互換用
export const getAgentResponse = getChallengerResponse;
export const analyzeDebate = async (
  transcript: string,
  characterId: string
): Promise<EvaluationResult> => {
  const result = await getEvaluationAndFeedback(transcript, characterId);
  return result.scores;
};

// =====================================
// ヘルパー関数
// =====================================

function buildJudgePrompt(debateLog: string, characterLevel: number): string {
  return `以下のディベートログを評価し、ユーザーのパフォーマンスを5つの軸でスコア化してください。

【対戦相手のレベル】${characterLevel}/9

【ディベートログ】
${debateLog}

以下のJSON形式で回答してください：
{
  "logic": <0-100の整数>,
  "evidence": <0-100の整数>,
  "tone": <0-100の整数>,
  "refutation": <0-100の整数>,
  "clarity": <0-100の整数>
}`;
}

function buildCoachPrompt(debateLog: string, scores: EvaluationScores): string {
  const axisNames: Record<string, string> = {
    logic: '論理構造',
    evidence: '証拠力',
    tone: '話し方',
    refutation: '反論力',
    clarity: '構造化',
  };

  const entries = Object.entries(scores) as [keyof EvaluationScores, number][];
  const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);

  return `以下の評価結果に基づいて、ユーザーへの個別フィードバックを生成してください。

【評価スコア】
- 論理構造: ${scores.logic}点
- 証拠力: ${scores.evidence}点
- 話し方: ${scores.tone}点
- 反論力: ${scores.refutation}点
- 構造化: ${scores.clarity}点

【最も改善が必要な軸】
${axisNames[lowest[0]]}（${lowest[1]}点）

【ディベートログ】
${debateLog}

以下の要件でフィードバックを生成してください：
1. 全体的な評価（1文）
2. 良かった点（1文）
3. 改善点と具体的なアドバイス（2-3文）
4. 学習タブへの誘導（1文）

日本語で、励ましを含めた建設的なトーンで書いてください。`;
}

function getCharacterSystemPrompt(
  charId: string,
  topicTitle?: string,
  aiStance?: 'pro' | 'con'
): string {
  const prompts: Record<string, string> = {
    sakura: `あなたは「桜子サクラ」という名前のディベート練習用AIです。
性格：穏やかで優しく、初心者に丁寧に説明します。
話し方：「〜ですね」「〜かもしれませんね」など柔らかい表現を使います。`,
    kenji: `あなたは「論理のケンジ」という名前のディベート練習用AIです。
性格：論理的で冷静、筋道立てた議論を重視します。
話し方：「論理的に考えると」「第一に、第二に」など構造化された表現を使います。`,
    yuki: `あなたは「証拠のユキ」という名前のディベート練習用AIです。
性格：データと証拠を重視する分析的な性格です。
話し方：「データによると」「研究では」など証拠ベースの表現を使います。`,
    takeshi: `あなたは「反論のタケシ」という名前のディベート練習用AIです。
性格：鋭く挑戦的、相手の弱点を見抜きます。
話し方：「しかし」「それは問題があります」など直接的な表現を使います。`,
    tetsuo: `あなたは「鉄人テツオ」という名前のディベート練習用AIです。
性格：最上級の論客で、複雑なフレームワークを使いこなします。
話し方：「C-R-E-E-Pフレームワークで分析すると」など専門的な表現を使います。`,
  };

  const stanceText = aiStance === 'pro' ? '賛成' : '反対';
  const topicInfo = topicTitle ? `\n\n【トピック】${topicTitle}\n【あなたの立場】${stanceText}` : '';

  const basePrompt = prompts[charId] || prompts['sakura'];

  return `${basePrompt}${topicInfo}

【重要な指示】
- あなたはディベートの対戦相手として、ユーザーと議論を行います。
- ユーザーから提示される指示に従い、フェーズに応じた適切な応答をしてください。
- 主張を述べる際は、明確な論拠と具体例を含めてください。
- 反論する際は、相手の主張の弱点を指摘し、具体的な反証を提示してください。
- あなたの立場（${stanceText}）を一貫して維持してください。
- 応答は自然な会話形式で、読みやすい長さ（3〜6文程度）にしてください。
- 日本語で応答してください。`;
}

function generateFeedbackItems(scores: EvaluationScores): FeedbackItem[] {
  const axisConfig = [
    { key: 'logic' as const, name: '論理構造', learnContentId: 'creep' },
    { key: 'evidence' as const, name: '証拠力', learnContentId: 'creep' },
    { key: 'tone' as const, name: '話し方', learnContentId: 'respectful_disagreement' },
    { key: 'refutation' as const, name: '反論力', learnContentId: 'straw_man' },
    { key: 'clarity' as const, name: '構造化', learnContentId: 'are' },
  ];

  return axisConfig.map(config => ({
    axis: config.key,
    axisName: config.name,
    score: scores[config.key],
    message: scores[config.key] < 60
      ? `${config.name}に改善の余地があります。`
      : `${config.name}は良好です。`,
    learnContentId: config.learnContentId,
  }));
}
