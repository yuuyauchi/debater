# Debate Dojo (ディベート道場)

AIキャラクターとのディベート対戦を通じてディベートスキル向上を促進するiOS/Androidアプリです。

## アーキテクチャ

```
┌──────────────────────────────────┐
│    React Native App (Expo)       │
│                                  │
│  - UI/UX                         │
│  - 音声録音・音声認識            │
│  - OpenAI API直接統合            │
│                                  │
│  ┌────────────────────────────┐  │
│  │ AI機能                     │  │
│  │ - Whisper STT             │  │
│  │ - Debate Challenger       │  │
│  │ - Judge Analyst           │  │
│  │ - Learning Coach          │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
           │
           ↓
  OpenAI API (gpt-4o-mini)
```

## 主要機能

### 3つのAIエージェント機能

| 機能 | 役割 | 使用モデル |
|------|------|-----------|
| **Whisper STT** | 音声認識 | OpenAI Whisper API |
| **Debate Challenger** | 対戦 | GPT-4o-mini：キャラクター別の反証を生成 |
| **Judge Analyst** | 評価 | GPT-4o-mini：5軸スコアをJSON形式で算出 |
| **Learning Coach** | 学習 | GPT-4o-mini：個別フィードバックを生成 |

### API関数

```typescript
// 音声認識
transcribeAudio(audioUri: string): Promise<string>

// 反証生成
getChallengerResponse(transcript: string, charId: string): Promise<string>

// 評価スコア
getJudgeScore(debateLog: string, characterLevel: number): Promise<EvaluationScores>

// フィードバック
getCoachingFeedback(debateLog: string, scores: EvaluationScores): Promise<string>
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
npm install
```

### 2. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集してOpenAI APIキーを設定：

```
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. アプリ起動

```bash
npm start
```

Expo Goアプリで表示されたQRコードをスキャンしてアプリを起動します。

---

## ファイル構成

```
debater/
├── App.tsx                          # エントリポイント
├── src/
│   ├── services/
│   │   └── MastraApiService.ts      # OpenAI API統合サービス
│   ├── screens/
│   │   ├── HomeScreen.tsx           # ホーム画面
│   │   ├── CharacterSelectScreen.tsx # キャラクター選択
│   │   ├── DebateScreen.tsx         # ディベート画面（音声入力対応）
│   │   ├── ResultsScreen.tsx        # 評価結果・フィードバック表示
│   │   ├── LearnScreen.tsx          # 学習コンテンツ
│   │   ├── ProfileScreen.tsx        # プロフィール
│   │   ├── RankingScreen.tsx        # ランキング
│   │   └── SettingsScreen.tsx       # 設定
│   ├── components/
│   │   ├── RadarChart.tsx           # レーダーチャート
│   │   └── VoiceInputBar.tsx        # 音声入力UI
│   ├── data/
│   │   └── mockData.ts              # キャラクター・トピックデータ
│   ├── context/
│   │   └── UserContext.tsx          # ユーザー状態管理
│   └── navigation/
│       └── TabNavigator.tsx         # タブナビゲーション
├── assets/                          # 画像・アイコン
├── package.json
├── .env.example
└── tsconfig.json
```

---

## API サービス層

### MastraApiService.ts

OpenAI APIを直接呼び出すサービス層：

| 関数 | 用途 | API |
|------|------|-----|
| `transcribeAudio()` | 音声認識 | OpenAI Whisper API |
| `getChallengerResponse()` | 反証生成 | OpenAI GPT-4o-mini |
| `getJudgeScore()` | 評価スコア | OpenAI GPT-4o-mini |
| `getCoachingFeedback()` | フィードバック | OpenAI GPT-4o-mini |

### フォールバック機構

APIキーが未設定、またはAPI呼び出しに失敗した場合：
- モックレスポンスを返してアプリの動作を継続

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

### フロントエンド
- React Native (Expo)
- TypeScript
- React Navigation v7
- react-native-svg（レーダーチャート）
- expo-av（音声録音）
- expo-file-system（ファイル操作）

### AI/ML
- OpenAI Whisper API（音声認識）
- OpenAI GPT-4o-mini（ディベート・評価・フィードバック生成）

---

## 今後の拡張案

### 実装済み
- [x] 音声入力対応（STT）
- [x] AI応答生成（LLM）
- [x] ボイス・ファーストUI
- [x] Learning Coachフィードバック
- [x] AI反証生成機能
- [x] キャラクター別の個性設定
- [x] 5軸評価システム

### 開発中・検討中
- [ ] 課金機能（キャラクター解放システム）
- [ ] ディベート評価基準の明確化
- [ ] RAG（知識ベース検索）
- [ ] マルチプレイヤー対戦
- [ ] ダークモード対応
- [ ] 履歴・分析機能の強化

---

## 参考資料

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
