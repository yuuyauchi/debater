// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: 'debater-app',
    slug: 'debater-app',
    version: '1.0.0',
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
      buildNumber: '2', // ← ビルド番号アップ
      bundleIdentifier: 'com.yauchiyuu.debaterapp',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false, // ← 追加！
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // 環境変数を使っているならここで渡す
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      eas: {
        projectId: '6fd30a00-dbcf-424a-883b-8ed092051206', // ← ログに出ていた projectId
      },
    },
  },
};
