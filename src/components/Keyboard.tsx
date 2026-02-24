import React, { memo } from 'react';
import { KEYBOARD_MAP, FINGER_COLORS } from '../constants';
import { motion } from 'motion/react';

interface KeyboardProps {
  targetKey: string;
  pressedKey: string | null;
  isError: boolean;
}

const Keyboard: React.FC<KeyboardProps> = memo(({ targetKey, pressedKey, isError }) => {
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    [' ']
  ];

  return (
    <div className="flex flex-col gap-2 p-6 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl select-none">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex gap-2 justify-center ${rowIndex === 4 ? 'mt-2' : ''}`}>
          {row.map((key) => {
            const keyInfo = KEYBOARD_MAP[key.toLowerCase()];
            const isTarget = targetKey.toLowerCase() === key.toLowerCase();
            const isPressed = pressedKey?.toLowerCase() === key.toLowerCase();
            const fingerColor = keyInfo ? FINGER_COLORS[keyInfo.finger] : 'bg-slate-700';

            return (
              <div
                key={key}
                className={`
                  relative flex items-center justify-center rounded-xl font-mono font-bold transition-all duration-75
                  ${key === ' ' ? 'w-64 h-14' : 'w-12 h-12'}
                  ${isTarget ? `${fingerColor} text-white shadow-lg shadow-${fingerColor.split('-')[1]}-500/50 ring-4 ring-white/20` : 'bg-slate-800 text-slate-400 border border-white/5'}
                  ${isPressed && isError && isTarget ? 'bg-red-500 ring-red-500/50' : ''}
                  ${isPressed ? 'scale-95 translate-y-0.5' : 'scale-100 translate-y-0'}
                `}
              >
                <span className="text-lg uppercase">{key === ' ' ? 'Space' : key}</span>
                
                {isTarget && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-sans font-bold shadow-xl">
                    {keyInfo?.finger.replace('-', ' ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

Keyboard.displayName = 'Keyboard';

export default Keyboard;
