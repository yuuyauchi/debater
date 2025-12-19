import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// 商品ID（実際のApp StoreやGoogle Playで設定したIDに置き換えてください）
const PRODUCT_IDS = Platform.select({
  ios: ['com.debater.all_characters'],
  android: ['com.debater.all_characters'],
}) || [];

interface PurchaseContextType {
  isPurchased: boolean;
  isLoading: boolean;
  purchaseAllCharacters: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};

interface PurchaseProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@debater_purchase_status';

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({ children }) => {
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化とローカルストレージから購入状態を読み込む
  useEffect(() => {
    initIAP();
    loadPurchaseStatus();
  }, []);

  const initIAP = async () => {
    try {
      // IAPの初期化
      await RNIap.initConnection();
      console.log('IAP initialized');

      // iOSの場合、購入完了の確認をクリア
      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }
    } catch (error) {
      console.warn('IAP initialization error:', error);
    }
  };

  const loadPurchaseStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEY);
      if (status === 'true') {
        setIsPurchased(true);
      }
    } catch (error) {
      console.error('Failed to load purchase status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePurchaseStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, status.toString());
      setIsPurchased(status);
    } catch (error) {
      console.error('Failed to save purchase status:', error);
    }
  };

  const purchaseAllCharacters = async () => {
    try {
      setIsLoading(true);

      // 商品情報を取得
      const products = await RNIap.fetchProducts({ skus: PRODUCT_IDS });

      if (!products || products.length === 0) {
        // 開発環境ではダミーで購入完了とする
        console.log('No products available, using development mode');
        await savePurchaseStatus(true);
        return;
      }

      // 購入リクエスト
      const purchase = await RNIap.requestPurchase({
        sku: PRODUCT_IDS[0],
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      } as any);

      // 購入の検証（実際のアプリでは必ずサーバー側で検証してください）
      if (purchase) {
        await savePurchaseStatus(true);

        // 購入完了後、トランザクションを終了
        const purchaseObj = Array.isArray(purchase) ? purchase[0] : purchase;
        if (Platform.OS === 'ios') {
          await RNIap.finishTransaction({ purchase: purchaseObj, isConsumable: false });
        } else {
          await RNIap.acknowledgePurchaseAndroid(purchaseObj.purchaseToken || '');
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);

      // ユーザーがキャンセルした場合はエラーを無視
      if (error.code !== 'E_USER_CANCELLED') {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);

      const purchases = await RNIap.getAvailablePurchases();

      // 購入履歴があれば復元
      const hasAllCharactersPurchase = purchases.some(
        (purchase) => purchase.productId === PRODUCT_IDS[0]
      );

      if (hasAllCharactersPurchase) {
        await savePurchaseStatus(true);
      }
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: PurchaseContextType = {
    isPurchased,
    isLoading,
    purchaseAllCharacters,
    restorePurchases,
  };

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
};
