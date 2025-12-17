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
    console.log('[STT] API key not configured. Using placeholder text.');
    await delay(500);
    return '[APIキー未設定] .envファイルにOPENAI_API_KEYを設定すると音声認識が有効になります。';
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

// モック用テンプレート（Mastraサーバー未接続時のフォールバック）
const CHARACTER_RESPONSE_TEMPLATES: { [key: string]: string[] } = {
  sakura: [
    'そうですね、この議題について考えると、いくつかの視点がありますね。私は別の角度から、まず基本的な点から整理してみましょう。',
    'なるほど、そういう考え方もありますね。でも、別の角度から見てみると、違う結論も導けるかもしれません。',
  ],
  kenji: [
    '論理的に考えると、この議題には3つの重要な論点があります。第一に、社会的影響。第二に、経済的効果。そして最後に、長期的な持続可能性。',
    'その主張の論理構造を検証してみましょう。前提から結論への理由づけに、いくつかの飛躍があるように見えます。',
  ],
  yuki: [
    '興味深いご意見ですが、データを見てみましょう。最新の研究によると、約65%の改善効果という結果が出ています。',
    '統計的な観点から申し上げますと、70%の事例でこの傾向が確認されています。',
  ],
  takeshi: [
    'その論点には致命的な欠陥があります。反証可能性という点を見落としていませんか？',
    '反論させていただきます。あなたの主張は早まった一般化という議論のミスに陥っています。',
  ],
  tetsuo: [
    'C-R-E-E-Pフレームワークで分析すると、あなたの主張にはEvidenceとExplanationの連携が弱いですね。',
    '包括的に評価すると、この議論には効果性、実現可能性、倫理性の3次元で検討が必要です。',
  ],
};

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
 * 直接OpenAI APIを呼び出すフォールバック
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
    console.log('[Debate Challenger] API key not configured or invalid. Using mock response.');
    await delay(2000);
    const templates = CHARACTER_RESPONSE_TEMPLATES[charId] || CHARACTER_RESPONSE_TEMPLATES['sakura'];
    return templates[Math.floor(Math.random() * templates.length)];
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

    // ネットワークエラーの場合はモックを返す
    console.log('[Debate Challenger] Falling back to mock response');
    await delay(1000);
    const templates = CHARACTER_RESPONSE_TEMPLATES[charId] || CHARACTER_RESPONSE_TEMPLATES['sakura'];
    return templates[Math.floor(Math.random() * templates.length)];
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
    console.log('[Judge Analyst] API key not configured. Using fallback.');
    return getJudgeScoreFallback(characterLevel);
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
    console.error('[Judge Analyst] API error, using fallback:', error);
    return getJudgeScoreFallback(characterLevel);
  }
}

/**
 * Judge Analystのフォールバック（モック生成）
 */
function getJudgeScoreFallback(characterLevel: number): EvaluationScores {
  const baseScore = 50;
  const randomFactor = () => Math.random() * 30 - 15;
  const difficultyPenalty = (characterLevel - 5) * 3;

  return {
    logic: clampScore(baseScore + randomFactor() - difficultyPenalty),
    evidence: clampScore(baseScore + randomFactor() - difficultyPenalty),
    tone: clampScore(baseScore + randomFactor() - difficultyPenalty),
    refutation: clampScore(baseScore + randomFactor() - difficultyPenalty),
    clarity: clampScore(baseScore + randomFactor() - difficultyPenalty),
  };
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
    console.log('[Learning Coach] API key not configured. Using fallback.');
    return getCoachingFeedbackFallback(scores);
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
    console.error('[Learning Coach] API error, using fallback:', error);
    return getCoachingFeedbackFallback(scores);
  }
}

/**
 * Learning Coachのフォールバック（テンプレート生成）
 */
function getCoachingFeedbackFallback(scores: EvaluationScores): string {
  const axisNames: Record<string, string> = {
    logic: '論理構造',
    evidence: '証拠力',
    tone: '話し方',
    refutation: '反論力',
    clarity: '構造化',
  };

  const contentMap: Record<string, string> = {
    logic: 'C-R-E-E-Pフレームワーク',
    evidence: 'C-R-E-E-Pフレームワーク',
    tone: '敬意ある反対意見の表明',
    refutation: 'ストローマン論法',
    clarity: 'A-R-Eフレームワーク',
  };

  const entries = Object.entries(scores) as [keyof EvaluationScores, number][];
  const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
  const [axis, score] = lowest;

  if (score >= 70) {
    return '素晴らしいディベートでした！全体的に高いスコアを維持しています。さらなる上達を目指して、より難しい相手に挑戦してみましょう。';
  }

  return `${axisNames[axis]}のスコアが${score}点と改善の余地があります。次は[学習]タブの「${contentMap[axis]}」を見直して、スキルアップを目指しましょう！`;
}

// =====================================
// 統合関数（後方互換性のため維持）
// =====================================

/**
 * 評価とフィードバックを統合して取得
 * getJudgeScore + getCoachingFeedback を内部で呼び出す
 */
export async function getEvaluationAndFeedback(
  debateLog: string,
  characterId: string = 'sakura'
): Promise<EvaluationAndFeedbackResult> {
  const character = CHARACTERS.find(c => c.id === characterId);
  const characterLevel = character?.level || 5;

  // Judge Analystでスコアを取得
  const scores = await getJudgeScore(debateLog, characterLevel);

  // Learning Coachでフィードバックを生成
  const feedbackText = await getCoachingFeedback(debateLog, scores);

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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clampScore(score: number): number {
  return Math.round(Math.max(0, Math.min(100, score)));
}
