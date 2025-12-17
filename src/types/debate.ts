/**
 * ディベート関連の共有型定義
 */

/**
 * ターンごとのメッセージ情報
 */
export interface TurnMessage {
  text: string;
  turn: number;
  phase: string;
}
