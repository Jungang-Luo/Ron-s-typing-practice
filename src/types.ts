export type Finger = 
  | 'left-pinky' 
  | 'left-ring' 
  | 'left-middle' 
  | 'left-index' 
  | 'right-index' 
  | 'right-middle' 
  | 'right-ring' 
  | 'right-pinky' 
  | 'thumb';

export interface KeyInfo {
  key: string;
  finger: Finger;
  row: number;
}

export interface PracticeResult {
  mode: string;
  wpm: number;
  accuracy: number;
  errors: number;
  weakKeys: Record<string, number>;
  time: number;
}

export interface HistoryItem {
  id: number;
  mode: string;
  wpm: number;
  accuracy: number;
  errors: number;
  weak_keys: string;
  created_at: string;
}
