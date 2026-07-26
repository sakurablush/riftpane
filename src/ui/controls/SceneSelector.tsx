import React, { useMemo } from 'react';
import { SCENE_VERSIONS } from '../../utils/constants';

interface SceneSelectorProps {
  activeIndex: number;
  onChange: (index: number) => void;
}

export const SceneSelector = ({ activeIndex, onChange }: SceneSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-pink-300/70 tracking-widest uppercase mr-1">VERSION</span>
      <div className="flex items-center gap-1.5">
        {useMemo(() => {
          const items: React.ReactNode[] = [];
          SCENE_VERSIONS.forEach((v, i) => {
            const isActive = activeIndex === i;
            items.push(
              <button
                key={v.name + String(i)}
                onClick={() => onChange(i)}
                title={v.name}
                className={`w-7 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-tr from-pink-600 to-rose-400 text-white shadow-[0_0_12px_rgba(255,42,75,0.8)] scale-110'
                    : 'bg-black/40 text-pink-200/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {v.symbol}
              </button>
            );
          });
          return items;
        }, [activeIndex])}
      </div>
    </div>
  );
};