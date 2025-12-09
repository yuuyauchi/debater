# Debate Dojo (ディベート道場)

AIキャラクターとのディベート対戦を通じてディベートスキル向上を促進するiOS/Androidアプリのプロトタイプです。

## V4.0 アップデート - Mastra統合

### Mastraサーバーによるエージェント管理

**Mastra**フレームワークを使用したバックエンドサーバーを導入し、AIエージェントを一元管理するアーキテクチャに刷新しました。

#### アーキテクチャ

```
┌─────────────────────┐     ┌─────────────────────────────┐
│  React Native App   │────▶│     Mastra Server           │
│  (Expo)             │     │     (Node.js)               │
│                     │     │                             │
│  - UI/UX            │     │  ┌─────────────────────┐    │
│  - 音声録音         │     │  │ debate-challenger   │    │
│  - MastraApiService │     │  │ (対戦エージェント)   │    │
└─────────────────────┘     │  └─────────────────────┘    │
                            │  ┌─────────────────────┐    │
                            │  │ judge-analyst       │    │
                            │  │ (評価エージェント)   │    │
                            │  └─────────────────────┘    │
                            │  ┌─────────────────────┐    │
                            │  │ learning-coach      │    │
                            │  │ (学習コーチ)         │    │
                            │  └─────────────────────┘    │
                            └─────────────────────────────┘
```

#### 4つのAIエージェント

| エージェント | 役割 | 説明 |
|-------------|------|------|
| **Mastra Voice** | STT | OpenAI Whisper APIで音声をテキストに変換 |
| **Debate Challenger** | 対戦 | キャラクター別の反証を生成 |
| **Judge Analyst** | 評価 | 5軸スコアをJSON形式で算出 |
| **Learning Coach** | 学習 | 個別フィードバックを生成 |

#### 設計仕様通りの関数分離

```typescript
// 4つの独立した関数
transcribeAudio(audioUri)           // STT
getChallengerResponse(transcript)   // 反証生成
getJudgeScore(debateLog)            // 評価スコア
getCoachingFeedback(debateLog)      // フィードバック
```

---

## セットアップ

### 必要環境

- Node.js 20以上
- npm または yarn
- Expo Go アプリ（iOS/Android端末）
- OpenAI APIキー

### 1. 依存関係のインストール

```bash
# React Nativeアプリ
npm install

# Mastraサーバー
cd mastra-server
npm install
cd ..
```

### 2. 環境変数の設定

```bash
# プロジェクトルートに.envファイルを作成
cp .env.example .env

# .envを編集
OPENAI_API_KEY=sk-your-api-key-here
MASTRA_SERVER_URL=http://localhost:4111
```

Mastraサーバーにも.envを設定：

```bash
cd mastra-server
cp .env.example .env
# OPENAI_API_KEYを設定
```

### 3. サーバー起動

**ターミナル1 - Mastraサーバー:**
```bash
cd mastra-server
npm run dev
```

サーバーが `http://localhost:4111` で起動します。

**ターミナル2 - Expoアプリ:**
```bash
npm start
```

### 4. 動作確認

- Mastra Studio: http://localhost:4111 でエージェントを確認
- Expoアプリ: QRコードをスキャンしてアプリを起動

---

## ファイル構成

```
debater/
├── App.tsx                          # エントリポイント
├── src/
│   ├── services/
│   │   └── MastraApiService.ts      # Mastraクライアント [V4.0]
│   ├── screens/
│   │   ├── DebateScreen.tsx         # ボイス・ファーストUI
│   │   └── ResultsScreen.tsx        # Learning Coach表示
│   ├── components/
│   │   ├── RadarChart.tsx           # レーダーチャート
│   │   └── VoiceInputBar.tsx        # 音声入力UI
│   └── ...
├── mastra-server/                   # Mastraバックエンド [V4.0]
│   ├── src/
│   │   └── index.ts                 # エージェント定義
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── .env.example
```

---

## API サービス層

### MastraApiService.ts

React NativeアプリからMastraサーバーを呼び出すクライアント層：

| 関数 | 用途 | 接続先 |
|------|------|--------|
| `transcribeAudio()` | 音声認識 | OpenAI Whisper API (直接) |
| `getChallengerResponse()` | 反証生成 | Mastra Server → debate-challenger |
| `getJudgeScore()` | 評価スコア | Mastra Server → judge-analyst |
| `getCoachingFeedback()` | フィードバック | Mastra Server → learning-coach |

### フォールバック機構

Mastraサーバーに接続できない場合：
1. 直接OpenAI APIを呼び出す（フォールバック）
2. それも失敗した場合はモックレスポンスを返す

---

## Mastraサーバー詳細

### エージェント定義 (mastra-server/src/index.ts)

```typescript
import { Mastra, Agent } from '@mastra/core';

// Debate Challenger Agent
const debateChallengerAgent = new Agent({
  name: 'debate-challenger',
  instructions: `ディベート練習相手として反証を行う...`,
  model: { provider: 'OPENAI', name: 'gpt-4o-mini' },
});

// Judge Analyst Agent
const judgeAnalystAgent = new Agent({
  name: 'judge-analyst',
  instructions: `5つの軸で評価しJSONで返す...`,
  model: { provider: 'OPENAI', name: 'gpt-4o-mini' },
});

// Learning Coach Agent
const learningCoachAgent = new Agent({
  name: 'learning-coach',
  instructions: `学習フィードバックを生成...`,
  model: { provider: 'OPENAI', name: 'gpt-4o-mini' },
});

export const mastra = new Mastra({
  agents: { debateChallengerAgent, judgeAnalystAgent, learningCoachAgent },
});
```

### APIエンドポイント

Mastraサーバーは以下のエンドポイントを自動公開：

- `POST /api/agents/debate-challenger/generate`
- `POST /api/agents/judge-analyst/generate`
- `POST /api/agents/learning-coach/generate`

---

## 機能概要

- AIキャラクターとのターン制ディベート対戦
- 音声入力（メイン）+ テキスト入力の両対応
- 5つの評価軸によるスキル分析（レーダーチャート）
- Learning Coachによる個別フィードバック生成
- ディベートフレームワークの学習コンテンツ

## AIキャラクター

| キャラクター | レベル | 特徴 |
|-------------|--------|------|
| 桜子サクラ | 3 | 初心者向け、穏やかで優しい |
| 論理のケンジ | 5 | 論理的思考重視、演繹的反論 |
| 証拠のユキ | 6 | データと証拠を引用 |
| 反論のタケシ | 7 | 論理的誤謬を鋭く指摘 |
| 鉄人テツオ | 9 | C-R-E-E-Pで多角的分析 |

## 技術スタック

### フロントエンド (React Native)
- Expo
- TypeScript
- React Navigation v6
- react-native-svg
- expo-av / expo-file-system

### バックエンド (Mastra)
- Mastra Framework
- Node.js 20+
- OpenAI API (GPT-4o-mini)

---

## 今後の拡張案

- [x] 音声入力対応（STT）
- [x] AI応答生成（LLM）
- [x] ボイス・ファーストUI
- [x] Learning Coachフィードバック
- [x] AI反証生成機能
- [x] Mastraプラットフォーム統合
- [x] 設計仕様通りの関数分離
- [ ] Mastra Workflow（複数エージェント連携）
- [ ] RAG（知識ベース検索）
- [ ] マルチプレイヤー対戦
- [ ] ダークモード対応

---

## 参考資料

- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [@mastra/core npm](https://www.npmjs.com/package/@mastra/core)
