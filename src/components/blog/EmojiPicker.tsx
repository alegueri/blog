'use client';

import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  // Writing
  '✍️','📝','📖','📚','🖊️','📄','📰','🗞️','📜','💬',
  // Tech
  '💻','🖥️','📱','⌨️','🔧','⚙️','🛠️','🤖','🔌','📡',
  // Ideas
  '💡','🧠','🔍','🎯','✨','🌟','⚡','🔑','🧩','🗺️',
  // Nature
  '🌱','🌊','🔥','🌈','🌙','☀️','🌿','🍃','❄️','🌸',
  // Creative
  '🎨','🎵','🎮','🏆','🚀','💎','🎬','📸','🎙️','🎤',
  // Emotions
  '❤️','😊','🤔','😎','🙌','👏','💪','🤝','👀','🫶',
  // Misc
  '🏡','🗓️','📊','📈','💰','🌍','🎁','🔮','⏰','🧪',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-xl border border-gray-200 bg-white text-2xl flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
        title="Pick an icon"
      >
        {value || '＋'}
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-50 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl p-3">
          <div className="grid grid-cols-10 gap-0.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onChange(emoji); setOpen(false); }}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-lg hover:bg-indigo-50 transition-colors ${value === emoji ? 'bg-indigo-100' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 text-center py-1"
            >
              Remove icon
            </button>
          )}
        </div>
      )}
    </div>
  );
}
