import { KeyInfo } from './types';

export const KEYBOARD_MAP: Record<string, KeyInfo> = {
  // Row 1 (Numbers)
  '1': { key: '1', finger: 'left-pinky', row: 1 },
  '2': { key: '2', finger: 'left-ring', row: 1 },
  '3': { key: '3', finger: 'left-middle', row: 1 },
  '4': { key: '4', finger: 'left-index', row: 1 },
  '5': { key: '5', finger: 'left-index', row: 1 },
  '6': { key: '6', finger: 'right-index', row: 1 },
  '7': { key: '7', finger: 'right-index', row: 1 },
  '8': { key: '8', finger: 'right-middle', row: 1 },
  '9': { key: '9', finger: 'right-ring', row: 1 },
  '0': { key: '0', finger: 'right-pinky', row: 1 },
  '-': { key: '-', finger: 'right-pinky', row: 1 },
  '=': { key: '=', finger: 'right-pinky', row: 1 },

  // Row 2 (Top)
  'q': { key: 'q', finger: 'left-pinky', row: 2 },
  'w': { key: 'w', finger: 'left-ring', row: 2 },
  'e': { key: 'e', finger: 'left-middle', row: 2 },
  'r': { key: 'r', finger: 'left-index', row: 2 },
  't': { key: 't', finger: 'left-index', row: 2 },
  'y': { key: 'y', finger: 'right-index', row: 2 },
  'u': { key: 'u', finger: 'right-index', row: 2 },
  'i': { key: 'i', finger: 'right-middle', row: 2 },
  'o': { key: 'o', finger: 'right-ring', row: 2 },
  'p': { key: 'p', finger: 'right-pinky', row: 2 },
  '[': { key: '[', finger: 'right-pinky', row: 2 },
  ']': { key: ']', finger: 'right-pinky', row: 2 },

  // Row 3 (Home)
  'a': { key: 'a', finger: 'left-pinky', row: 3 },
  's': { key: 's', finger: 'left-ring', row: 3 },
  'd': { key: 'd', finger: 'left-middle', row: 3 },
  'f': { key: 'f', finger: 'left-index', row: 3 },
  'g': { key: 'g', finger: 'left-index', row: 3 },
  'h': { key: 'h', finger: 'right-index', row: 3 },
  'j': { key: 'j', finger: 'right-index', row: 3 },
  'k': { key: 'k', finger: 'right-middle', row: 3 },
  'l': { key: 'l', finger: 'right-ring', row: 3 },
  ';': { key: ';', finger: 'right-pinky', row: 3 },
  "'": { key: "'", finger: 'right-pinky', row: 3 },

  // Row 4 (Bottom)
  'z': { key: 'z', finger: 'left-pinky', row: 4 },
  'x': { key: 'x', finger: 'left-ring', row: 4 },
  'c': { key: 'c', finger: 'left-middle', row: 4 },
  'v': { key: 'v', finger: 'left-index', row: 4 },
  'b': { key: 'b', finger: 'left-index', row: 4 },
  'n': { key: 'n', finger: 'right-index', row: 4 },
  'm': { key: 'm', finger: 'right-index', row: 4 },
  ',': { key: ',', finger: 'right-middle', row: 4 },
  '.': { key: '.', finger: 'right-ring', row: 4 },
  '/': { key: '/', finger: 'right-pinky', row: 4 },

  // Space
  ' ': { key: ' ', finger: 'thumb', row: 5 },
};

export const FINGER_COLORS: Record<string, string> = {
  'left-pinky': 'bg-rose-400',
  'left-ring': 'bg-orange-400',
  'left-middle': 'bg-amber-400',
  'left-index': 'bg-emerald-400',
  'right-index': 'bg-blue-400',
  'right-middle': 'bg-indigo-400',
  'right-ring': 'bg-violet-400',
  'right-pinky': 'bg-fuchsia-400',
  'thumb': 'bg-slate-400',
};

export const PRACTICE_MODES = [
  { id: 'home-row', name: '基准行 (ASDF JKL;)', content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;' },
  { id: 'top-row', name: '上排键 (QWER UIOP)', content: 'qwer uiop qwer uiop qwer uiop qwer uiop qwer uiop' },
  { id: 'bottom-row', name: '下排键 (ZXCV NM,.)', content: 'zxcv nm,. zxcv nm,. zxcv nm,. zxcv nm,. zxcv nm,.' },
  { id: 'common-words', name: '常用单词', content: 'the quick brown fox jumps over the lazy dog typing master practice makes perfect' },
  { id: 'custom', name: '自定义文本', content: '' },
];
