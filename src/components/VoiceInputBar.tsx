import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { Audio } from 'expo-av';
import { startRecording, stopRecording, transcribeAudio } from '../services/MastraApiService';

interface VoiceInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSend,
  disabled = false,
  placeholder = '意見を入力してください...',
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  // アニメーション用
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textInputRef = useRef<TextInput>(null);

  // マイク権限の確認
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          console.log('[Mastra Voice] Microphone permission not granted');
        }
      } catch (error) {
        console.error('[Mastra Voice] Error checking permission:', error);
        setHasPermission(false);
      }
    };
    checkPermission();
  }, []);

  // 録音中のパルスアニメーション
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isRecording]);

  // マイクボタン押下時の処理
  const handleMicPress = async () => {
    if (disabled || isProcessing) return;

    // キーボードを閉じる
    Keyboard.dismiss();

    // 権限がない場合
    if (hasPermission === false) {
      Alert.alert(
        'マイクの権限が必要です',
        '音声入力を使用するには、設定からマイクの権限を許可してください。',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isRecording) {
      // 録音停止 → STT処理
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const audioUri = await stopRecording();
        if (audioUri) {
          const transcribedText = await transcribeAudio(audioUri);
          setInputText(transcribedText);
        }
      } catch (error) {
        console.error('[Mastra Voice] STT error:', error);
        Alert.alert('エラー', '音声認識に失敗しました。もう一度お試しください。');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // 録音開始
      try {
        await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('[Mastra Voice] Recording error:', error);
        Alert.alert('エラー', '録音を開始できませんでした。マイクの権限を確認してください。');
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || disabled) return;
    onSend(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  };

  // テキスト入力エリアにフォーカスしたときの処理
  const handleTextInputFocus = () => {
    setIsTextInputFocused(true);
  };

  const handleTextInputBlur = () => {
    setIsTextInputFocused(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {/* 録音中/処理中のステータス表示 */}
        {(isRecording || isProcessing) && (
          <View style={styles.statusContainer}>
            {isRecording && (
              <>
                <View style={styles.recordingIndicator}>
                  <Animated.View
                    style={[
                      styles.recordingDot,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                </View>
                <Text style={styles.statusText}>録音中... もう一度タップして終了</Text>
              </>
            )}
            {isProcessing && (
              <>
                <View style={styles.processingIndicator}>
                  <Text style={styles.processingEmoji}>🎙️</Text>
                </View>
                <Text style={styles.statusText}>音声を認識中...</Text>
              </>
            )}
          </View>
        )}

        {/* テキスト入力エリア（修正フィールド） */}
        <View style={styles.textInputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            placeholderTextColor="#95A5A6"
            multiline
            maxLength={500}
            editable={!disabled && !isRecording && !isProcessing}
            onFocus={handleTextInputFocus}
            onBlur={handleTextInputBlur}
          />
          {inputText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setInputText('')}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 入力コントロール */}
        <View style={styles.controlsContainer}>
          {/* マイクボタン（メイン入力） */}
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
              (disabled || isProcessing) && styles.micButtonDisabled,
            ]}
            onPress={handleMicPress}
            disabled={disabled || isProcessing}
            activeOpacity={0.7}
          >
            {isRecording ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={styles.micButtonText}>⏹️</Text>
              </Animated.View>
            ) : isProcessing ? (
              <Text style={styles.micButtonText}>⏳</Text>
            ) : (
              <Text style={styles.micButtonText}>🎤</Text>
            )}
          </TouchableOpacity>

          {/* 送信ボタン */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || disabled || isRecording || isProcessing) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || disabled || isRecording || isProcessing}
          >
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>

        {/* ヒントテキスト（録音中・処理中以外で表示） */}
        {!isRecording && !isProcessing && (
          <Text style={styles.hintText}>
            🎤 タップで録音開始 → もう一度タップで音声認識 → 修正して送信
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
  },
  recordingIndicator: {
    marginRight: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E74C3C',
  },
  processingIndicator: {
    marginRight: 10,
  },
  processingEmoji: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    minHeight: 50,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    maxHeight: 100,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BDC3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginRight: 15,
  },
  micButtonRecording: {
    backgroundColor: '#E74C3C',
    shadowColor: '#E74C3C',
  },
  micButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
  },
  micButtonText: {
    fontSize: 26,
  },
  sendButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 28,
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 8,
  },
});

export default VoiceInputBar;
