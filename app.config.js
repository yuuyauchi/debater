import 'dotenv/config';

export default {
  expo: {
    name: 'Debater',                // 端末に表示されるアプリ名（任意で調整）
    slug: 'debater-app',
    version: '1.0.0',               // App Store 表示バージョン
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yauchiyuu.debaterapp',
      buildNumber: '1',              // ★ 必須：TestFlight用（毎回増やす）
      infoPlist: {
        NSMicrophoneUsageDescription:
          'We use the microphone to record speech for voice input.', // ★必須
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: "6fd30a00-dbcf-424a-883b-8ed092051206",
      },
      // ★ 開発環境用（App Store向けビルド時は削除推奨）
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
};
