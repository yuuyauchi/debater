import { ImageSourcePropType } from 'react-native';

// キャラクター画像のインポート
export const CHARACTER_IMAGES: { [key: string]: ImageSourcePropType } = {
  sakura: require('../../assets/characters/sakura.png'),
  kenji: require('../../assets/characters/kenji.png'),
  yuki: require('../../assets/characters/yuki.png'),
  takeshi: require('../../assets/characters/takeshi.png'),
  tetsuo: require('../../assets/characters/tetsuo.png'),
};

// AIキャラクター定義
export interface Character {
  id: string;
  name: string;
  level: number; // 1-9
  description: string;
  logic_bias: number; // 0.8-1.2
  tone_bias: number; // 0.8-1.2
  evidence_bias: number;
  refutation_bias: number;
  clarity_bias: number;
  avatar: string;
  imageKey: string; // CHARACTER_IMAGESのキー
  isPremium: boolean; // 課金が必要かどうか
}

export const CHARACTERS: Character[] = [
  {
    id: 'sakura',
    name: '桜子サクラ',
    level: 3,
    description: '初心者に優しく、基本的な論点を丁寧に説明。',
    logic_bias: 0.9,
    tone_bias: 1.1,
    evidence_bias: 0.85,
    refutation_bias: 0.8,
    clarity_bias: 1.0,
    avatar: '🌸',
    imageKey: 'sakura',
    isPremium: false, // 無料
  },
  {
    id: 'kenji',
    name: '論理のケンジ',
    level: 5,
    description: '論理的思考を重視し、筋道立てた議論を展開。',
    logic_bias: 1.15,
    tone_bias: 0.95,
    evidence_bias: 1.0,
    refutation_bias: 1.0,
    clarity_bias: 1.1,
    avatar: '🧠',
    imageKey: 'kenji',
    isPremium: true, // 課金必要
  },
  {
    id: 'yuki',
    name: '証拠のユキ',
    level: 6,
    description: 'データと証拠に基づく議論が得意。',
    logic_bias: 1.0,
    tone_bias: 0.9,
    evidence_bias: 1.2,
    refutation_bias: 1.0,
    clarity_bias: 1.05,
    avatar: '📊',
    imageKey: 'yuki',
    isPremium: true, // 課金必要
  },
  {
    id: 'takeshi',
    name: '反論のタケシ',
    level: 7,
    description: '相手の弱点を見抜き、鋭い反論を繰り出す。',
    logic_bias: 1.05,
    tone_bias: 0.85,
    evidence_bias: 1.0,
    refutation_bias: 1.2,
    clarity_bias: 1.0,
    avatar: '⚔️',
    imageKey: 'takeshi',
    isPremium: true, // 課金必要
  },
  {
    id: 'tetsuo',
    name: '鉄人テツオ',
    level: 9,
    description: '複雑なフレームワークを使いこなし、証拠の反論が的確。',
    logic_bias: 1.2,
    tone_bias: 0.8,
    evidence_bias: 1.15,
    refutation_bias: 1.2,
    clarity_bias: 1.15,
    avatar: '🏆',
    imageKey: 'tetsuo',
    isPremium: true, // 課金必要
  },
];

// ディベートトピック
export interface Topic {
  id: string;
  title: string;
  description: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'pineapple',
    title: 'パイナップルはピザに乗せるべきか？',
    description: 'ハワイアンピザの是非を議論します。',
  },
  {
    id: 'remote_work',
    title: 'リモートワークはオフィス勤務より優れているか？',
    description: '働き方の未来について議論します。',
  },
  {
    id: 'social_media',
    title: 'SNSは社会に良い影響を与えているか？',
    description: 'ソーシャルメディアの功罪を議論します。',
  },
  {
    id: 'ai_education',
    title: 'AIは教育現場で積極的に活用すべきか？',
    description: '教育におけるAIの役割を議論します。',
  },
  {
    id: 'cash_society',
    title: '現金は廃止すべきか？',
    description: 'キャッシュレス社会の是非を議論します。',
  },
];

// ランキングモックデータ
export interface RankingUser {
  id: string;
  name: string;
  overallScore: number;
  rank: number;
  debatesCount: number;
}

export const MOCK_RANKINGS: RankingUser[] = [
  { id: '1', name: 'ディベートマスター', overallScore: 92, rank: 1, debatesCount: 150 },
  { id: '2', name: '論理の達人', overallScore: 88, rank: 2, debatesCount: 120 },
  { id: '3', name: '証拠の鬼', overallScore: 85, rank: 3, debatesCount: 98 },
  { id: '4', name: 'あなた', overallScore: 72, rank: 4, debatesCount: 25 },
  { id: '5', name: '反論名人', overallScore: 70, rank: 5, debatesCount: 45 },
  { id: '6', name: '初心者ケン', overallScore: 65, rank: 6, debatesCount: 30 },
  { id: '7', name: 'ディベート好き', overallScore: 60, rank: 7, debatesCount: 20 },
  { id: '8', name: '学習中タロウ', overallScore: 55, rank: 8, debatesCount: 15 },
  { id: '9', name: 'ルーキーサラ', overallScore: 48, rank: 9, debatesCount: 8 },
  { id: '10', name: '新人デビュー', overallScore: 42, rank: 10, debatesCount: 3 },
];

// 学習コンテンツ
export interface LearningContent {
  id: string;
  title: string;
  category: 'framework' | 'fallacy' | 'tone';
  content: string;
}

export const LEARNING_CONTENTS: LearningContent[] = [
  // =====================================
  // フレームワーク（10個）
  // =====================================
  {
    id: 'creep',
    title: 'C-R-E-E-Pフレームワーク',
    category: 'framework',
    content: `C-R-E-E-Pは効果的な議論を構築するためのフレームワークです。

**C - Claim（主張）**
あなたの立場を明確に述べます。
例：「パイナップルはピザに乗せるべきです。」

**R - Reason（理由）**
なぜその主張をするのか理由を述べます。
例：「甘みと酸味のバランスが料理を豊かにするからです。」

**E - Evidence（証拠）**
主張を裏付ける具体的な証拠やデータを提示します。
例：「ハワイアンピザは1962年に発明され、世界で最も人気のあるピザトッピングの一つです。」

**E - Explanation（説明）**
証拠がどのように主張を支持するか説明します。
例：「この人気は、多くの人がフルーツとチーズの組み合わせを楽しんでいる証拠です。」

**P - Point（結論）**
議論を締めくくり、主張を再確認します。
例：「したがって、パイナップルは間違いなくピザのトッピングとして適しています。」`,
  },
  {
    id: 'are',
    title: 'A-R-Eフレームワーク',
    category: 'framework',
    content: `A-R-Eはシンプルな議論構造です。

**A - Assertion（主張）**
自分の立場を明確に述べます。

**R - Reasoning（理由づけ）**
主張の根拠となる理由を説明します。

**E - Evidence（証拠）**
主張を裏付ける具体的なデータや例を提示します。`,
  },
  {
    id: 'peel',
    title: 'PEELフレームワーク',
    category: 'framework',
    content: `PEELは段落や論点を構造化するためのフレームワークです。

**P - Point（論点）**
その段落で伝えたい主要なポイントを述べます。

**E - Evidence（証拠）**
ポイントを支持する証拠や例を提示します。

**E - Explanation（説明）**
証拠がポイントをどう支持するか説明します。

**L - Link（リンク）**
次の論点や全体の主張に繋げます。`,
  },
  {
    id: 'sexi',
    title: 'SEXIフレームワーク',
    category: 'framework',
    content: `SEXIは説得力のある議論を構築するためのフレームワークです。

**S - Statement（意見）**
自分の考えをはっきり述べます。

**E - Explanation（説明）**
なぜそう考えるか説明します。

**X - eXample（例）**
具体的な例を挙げます。

**I - Importance（重要性）**
なぜこれが重要なのか強調します。`,
  },
  {
    id: 'oreo',
    title: 'OREOフレームワーク',
    category: 'framework',
    content: `OREOは意見を述べる際のシンプルな構造です。

**O - Opinion（意見）**
自分の意見を明確に述べます。

**R - Reason（理由）**
その意見を持つ理由を説明します。

**E - Example（例）**
理由を裏付ける具体例を示します。

**O - Opinion（意見の再確認）**
最後に意見を再度述べて締めくくります。`,
  },
  {
    id: 'teel',
    title: 'TEELフレームワーク',
    category: 'framework',
    content: `TEELはエッセイや議論の段落構成に使われます。

**T - Topic Sentence（トピック文）**
段落の主題を述べる文。

**E - Explanation（説明）**
トピックについての詳しい説明。

**E - Evidence（証拠）**
説明を裏付ける証拠やデータ。

**L - Linking Sentence（接続文）**
次の段落や結論への橋渡し。`,
  },
  {
    id: 'star',
    title: 'STARフレームワーク',
    category: 'framework',
    content: `STARは具体的な事例を説明する際に有効です。

**S - Situation（状況）**
背景や状況を説明します。

**T - Task（課題）**
解決すべき課題や目標を述べます。

**A - Action（行動）**
取った行動や提案を説明します。

**R - Result（結果）**
行動の結果や成果を示します。`,
  },
  {
    id: 'prep',
    title: 'PREPフレームワーク',
    category: 'framework',
    content: `PREPは簡潔で説得力のある議論に最適です。

**P - Point（ポイント）**
最初に結論や主張を述べます。

**R - Reason（理由）**
その主張の理由を説明します。

**E - Example（例）**
具体的な例で理由を補強します。

**P - Point（ポイントの再確認）**
最後にポイントを繰り返して強調します。`,
  },
  {
    id: 'spse',
    title: 'SPSEフレームワーク',
    category: 'framework',
    content: `SPSEは問題解決型の議論に適しています。

**S - Situation（状況）**
現在の状況を説明します。

**P - Problem（問題）**
具体的な問題点を指摘します。

**S - Solution（解決策）**
問題に対する解決策を提案します。

**E - Evaluation（評価）**
解決策の効果や実現可能性を評価します。`,
  },
  {
    id: 'cer',
    title: 'CERフレームワーク',
    category: 'framework',
    content: `CERは科学的な議論に特に有効です。

**C - Claim（主張）**
問いに対する答えを述べます。

**E - Evidence（証拠）**
主張を支持するデータや観察結果を示します。

**R - Reasoning（理由づけ）**
証拠がなぜ主張を支持するか説明します。

この構造は、客観的で検証可能な議論を構築するのに役立ちます。`,
  },
  // =====================================
  // よくある議論のミス（10個）
  // =====================================
  {
    id: 'ad_hominem',
    title: '人身攻撃（アド・ホミネム）',
    category: 'fallacy',
    content: `**人身攻撃とは**
議論の内容ではなく、相手の人格や属性を攻撃すること。

**例：**
「あなたは若いから、この問題について何もわかっていない。」

**なぜ問題か：**
議論の内容と発言者の属性は無関係です。
主張の正しさは、論理と証拠で判断すべきです。

**対処法：**
「私の年齢ではなく、私の主張の内容について反論してください。」`,
  },
  {
    id: 'straw_man',
    title: 'ストローマン（わら人形論法）',
    category: 'fallacy',
    content: `**ストローマンとは**
相手の主張を歪めて解釈し、その歪めた主張に反論すること。

**例：**
A：「もっと環境に配慮した政策が必要だ」
B：「Aは経済を完全に無視して、全員が原始時代に戻れと言っている」

**なぜ問題か：**
実際の主張ではなく、架空の極端な主張に反論しています。

**対処法：**
「私はそのようなことは言っていません。私の実際の主張は...」`,
  },
  {
    id: 'false_dilemma',
    title: '誤った二分法',
    category: 'fallacy',
    content: `**誤った二分法とは**
実際には複数の選択肢があるのに、二つしかないように提示すること。

**例：**
「私たちの政策に賛成するか、国を破滅させるか、どちらかだ。」

**なぜ問題か：**
他の選択肢や中間的な立場を無視しています。

**対処法：**
「第三の選択肢として...も考えられます。」`,
  },
  {
    id: 'slippery_slope',
    title: '滑りやすい坂（スリッパリースロープ）',
    category: 'fallacy',
    content: `**滑りやすい坂とは**
ある行動が連鎖的に極端な結果を招くと主張すること。

**例：**
「もし宿題の提出期限を1日延ばしたら、次は1週間になり、最終的には誰も宿題をしなくなる。」

**なぜ問題か：**
各段階の因果関係が証明されていません。

**対処法：**
「その連鎖が必然的に起こる根拠を示してください。」`,
  },
  {
    id: 'appeal_to_authority',
    title: '権威への訴え',
    category: 'fallacy',
    content: `**権威への訴えとは**
専門外の権威者の意見を根拠として使うこと。

**例：**
「有名な俳優がこの健康食品を推薦しているから効果がある。」

**なぜ問題か：**
その分野の専門家でない人の意見は、主張の根拠になりません。

**対処法：**
「その分野の専門家や研究結果ではどうなっていますか？」`,
  },
  {
    id: 'circular_reasoning',
    title: '循環論法',
    category: 'fallacy',
    content: `**循環論法とは**
結論を前提として使い、同じことを繰り返す論法。

**例：**
「この本は素晴らしい。なぜなら、最高の本だからだ。」

**なぜ問題か：**
主張を証明するための独立した根拠がありません。

**対処法：**
「その主張を支持する、別の独立した根拠はありますか？」`,
  },
  {
    id: 'hasty_generalization',
    title: '早まった一般化',
    category: 'fallacy',
    content: `**早まった一般化とは**
少数の例から全体に当てはまる結論を導くこと。

**例：**
「私の知り合いの猫は皆おとなしい。だから全ての猫はおとなしい。」

**なぜ問題か：**
サンプルが小さすぎて、全体を代表していません。

**対処法：**
「そのサンプル数は十分ですか？他の例ではどうですか？」`,
  },
  {
    id: 'red_herring',
    title: 'レッドへリング（論点のすり替え）',
    category: 'fallacy',
    content: `**レッドへリングとは**
議論の本題から注意をそらす無関係な話題を持ち出すこと。

**例：**
A：「この政策は予算を超過しています」
B：「でも、教育の重要性を否定するんですか？」

**なぜ問題か：**
元の論点に答えず、別の話題に誘導しています。

**対処法：**
「それは別の議論です。元の論点に戻りましょう。」`,
  },
  {
    id: 'appeal_to_emotion',
    title: '感情への訴え',
    category: 'fallacy',
    content: `**感情への訴えとは**
論理的な根拠の代わりに、感情を使って説得しようとすること。

**例：**
「子供たちのことを考えてください！この法案に反対するなんて、子供を嫌いなんですか？」

**なぜ問題か：**
感情は論理的な根拠にはなりません。

**対処法：**
「感情的な訴えではなく、具体的なデータで説明してください。」`,
  },
  {
    id: 'bandwagon',
    title: 'バンドワゴン効果（多数派への訴え）',
    category: 'fallacy',
    content: `**バンドワゴン効果とは**
多くの人が信じているから正しいと主張すること。

**例：**
「みんながこの製品を使っているから、あなたも使うべきだ。」

**なぜ問題か：**
人気があることと正しいことは別です。

**対処法：**
「多くの人が信じていても、それが正しい根拠にはなりません。」`,
  },
  {
    id: 'false_cause',
    title: '誤った因果関係',
    category: 'fallacy',
    content: `**誤った因果関係とは**
二つの事象の相関を因果関係と誤認すること。

**例：**
「アイスクリームの売上が増えると犯罪も増える。だからアイスクリームは犯罪を引き起こす。」

**なぜ問題か：**
両方とも第三の要因（暑い天気）に影響されているだけかもしれません。

**対処法：**
「相関関係と因果関係は異なります。因果を証明する根拠はありますか？」`,
  },
  // =====================================
  // 話し方のマナー（10個）
  // =====================================
  {
    id: 'respectful_disagreement',
    title: '敬意ある反対意見の表明',
    category: 'tone',
    content: `**効果的なディベートのコミュニケーション**

ディベートでは、相手を尊重しながら反対意見を述べることが重要です。

**良い例：**
- 「興味深いご意見ですが、別の視点から考えると...」
- 「そのポイントは理解できますが、〇〇という点で異なる見解があります。」
- 「ご指摘の通り〇〇ですが、一方で△△も考慮すべきだと思います。」

**避けるべき表現：**
- 「それは間違っている」（断定的すぎる）
- 「あなたは理解していない」（人格攻撃）
- 「そんな考えはばかげている」（侮辱的）

**なぜ重要か：**
ていねいな話し方を心がけることで、建設的な議論ができるようになり、
相手も自分の意見を聞いてくれやすくなります。`,
  },
  {
    id: 'active_listening',
    title: 'アクティブリスニング',
    category: 'tone',
    content: `**アクティブリスニングとは**

相手の話を積極的に聞き、理解しようとする姿勢です。

**実践方法：**
1. 相手の主張を自分の言葉で言い換える
   「つまり、〇〇ということですね」

2. 確認の質問をする
   「△△についてもう少し詳しく教えていただけますか？」

3. 共通点を認める
   「〇〇という点では同意見です。」

**効果：**
- 相手に尊重されていると感じさせる
- 誤解を防ぐ
- より深い議論につながる`,
  },
  {
    id: 'constructive_criticism',
    title: '建設的な批判の仕方',
    category: 'tone',
    content: `**建設的な批判とは**

相手の主張の問題点を指摘しながら、改善策も提案すること。

**効果的な方法：**
1. まず良い点を認める
2. 具体的な問題点を指摘する
3. 代替案や改善策を提案する

**例：**
「その視点は新鮮で興味深いです。ただ、〇〇という点でデータが不足しているように思います。△△のような証拠があれば、より説得力が増すのではないでしょうか。」`,
  },
  {
    id: 'emotional_control',
    title: '感情のコントロール',
    category: 'tone',
    content: `**ディベートでの感情管理**

熱い議論でも冷静さを保つことが重要です。

**テクニック：**
1. 深呼吸をして間を取る
2. 相手の攻撃的な発言を個人的に受け取らない
3. 「私」を主語にした表現を使う
4. 反論する前に相手の意図を確認する

**感情的になりそうな時：**
「少し考える時間をいただけますか」
「その点について、もう少し詳しく説明していただけますか」`,
  },
  {
    id: 'steel_manning',
    title: 'スチールマニング',
    category: 'tone',
    content: `**スチールマニングとは**

相手の主張を最も強い形で解釈してから反論すること。
ストローマンの逆のアプローチです。

**方法：**
1. 相手の主張の最良の解釈を考える
2. その解釈が正しいか確認する
3. 最良の形での主張に対して反論する

**例：**
「あなたのお考えを最も好意的に解釈すると、〇〇ということですね。それは確かに一理ありますが、△△という点で私は異なる見解を持っています。」

**効果：**
相手からの信頼を得られ、より深い議論ができます。`,
  },
  {
    id: 'common_ground',
    title: '共通点から始める',
    category: 'tone',
    content: `**共通点の発見と活用**

対立する意見を持つ相手とも、共通点から議論を始めると効果的です。

**ステップ：**
1. 相手と共有する価値観や目標を見つける
2. その共通点を明確に述べる
3. 違いがどこにあるかを特定する

**例：**
「私たちは両方とも、子供たちの教育の質を向上させたいという点で同じ目標を持っています。意見が異なるのは、その方法についてですね。」

**効果：**
対立ではなく協働の姿勢を作り出せます。`,
  },
  {
    id: 'clarifying_questions',
    title: '明確化のための質問',
    category: 'tone',
    content: `**効果的な質問の技術**

質問は攻撃ではなく、理解を深めるために使います。

**良い質問の例：**
- 「〇〇とおっしゃいましたが、具体的にはどういう意味でしょうか？」
- 「その結論に至った根拠を教えていただけますか？」
- 「もし△△だった場合、お考えは変わりますか？」

**避けるべき質問：**
- 「本気でそう思っているんですか？」（攻撃的）
- 「それが正しいと証明できますか？」（挑戦的すぎる）`,
  },
  {
    id: 'acknowledging_limitations',
    title: '自分の限界を認める',
    category: 'tone',
    content: `**ひかえめな姿勢の重要性**

自分の知識や主張の限界を認めることは、弱さではなく強さです。

**効果的な表現：**
- 「この分野については専門家ではありませんが...」
- 「私の理解が間違っているかもしれませんが...」
- 「新しい証拠があれば、考えを改める用意があります」

**効果：**
- 相手からの信頼を得られる
- より誠実な議論ができる
- 間違いを認めやすくなる`,
  },
  {
    id: 'avoiding_absolutes',
    title: '絶対的表現を避ける',
    category: 'tone',
    content: `**ニュアンスのある表現の使用**

「絶対」「必ず」「全て」などの絶対的表現は議論を硬直させます。

**避けるべき表現 → 改善例：**
- 「これは絶対に正しい」→「証拠に基づくと、これが正しいと考えられます」
- 「みんなが〇〇だ」→「多くの場合、〇〇の傾向があります」
- 「例外なく」→「ほとんどの場合」

**効果：**
より正確で反論されにくい主張ができます。`,
  },
  {
    id: 'graceful_concession',
    title: 'うまくゆずる方法',
    category: 'tone',
    content: `**相手の良い点を認める技術**

相手の主張の良い点を認めることは、議論を前進させます。

**うまくゆずるときの表現：**
- 「その点については、おっしゃる通りです」
- 「確かに、〇〇という観点からは理にかなっています」
- 「それは私が見落としていた重要なポイントです」

**注意点：**
ゆずった後でも、自分の主要な論点は維持できます。
「ただし、△△という点では異なる見解があります。」`,
  },
];

// AIの応答モックデータ
export const AI_RESPONSES: { [key: string]: string[] } = {
  pro: [
    'なるほど、そのような見方もありますね。しかし、私は別の視点から考えてみたいと思います。',
    'ご意見は理解できますが、データを見ると異なる結論が導き出されます。',
    '興味深いポイントですね。ただ、いくつかの反論があります。',
    'その論点は重要ですが、より広い文脈で考える必要があると思います。',
    '確かにそうした側面もありますが、一方で考慮すべき点があります。',
  ],
  con: [
    'そのご意見には一理ありますが、反対の立場から言わせていただくと...',
    '論理的に考えると、いくつかの問題点が見えてきます。',
    'そのような主張に対して、私は異なる証拠を提示したいと思います。',
    'その視点は興味深いですが、別の角度から見ると...',
    '確かにそういった側面もありますが、反論させていただきます。',
  ],
};
