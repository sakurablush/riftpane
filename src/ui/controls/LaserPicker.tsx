import React from 'react';
import { useRendererStore } from '../../state/rendererStore';
import { LASER_PRESETS } from '../../utils/constants';

export const LaserPicker = React.memo(() => {
  const laserNm = useRendererStore((s) => s.laserNm);
  const setLaserNm = useRendererStore((s) => s.setLaserNm);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-pink-300/60 font-bold tracking-wider hidden sm:inline">LASER</span>
      <div className="flex items-center gap-1.5">
        {Object.values(LASER_PRESETS).map((preset) => {
          const isActive = laserNm === preset.nm;
          return (
            <button
              key={preset.nm}
              onClick={() => setLaserNm(preset.nm)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-bold transition border min-w-[3.5rem] ${
                isActive
                  ? 'bg-white/10 text-white border-pink-400/60'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}
              style={
                isActive
                  ? { boxShadow: `0 0 12px ${preset.hex}80`, color: preset.hex }
                  : {}
              }
            >
              <span className="text-[9px] opacity-80">{preset.name}</span>
              <span
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: '80%',
                  background: preset.hex,
                  opacity: isActive ? 1 : 0.25,
                  boxShadow: isActive ? `0 0 6px ${preset.hex}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
});