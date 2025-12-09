import 'dotenv/config';

// Debug: 環境変数の読み込み確認
console.log('[app.config.js] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('[app.config.js] OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);

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
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
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
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
};
