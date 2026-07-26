import React, { useCallback } from 'react';
import { useRendererStore } from '../../state/rendererStore';
import { useCameraStore } from '../../state/cameraStore';
import { LaserPicker } from '../controls/LaserPicker';
import { WallColorPicker } from '../controls/WallColorPicker';

export const BottomBar = React.memo((): React.ReactNode => {
  const zoom = useCameraStore((s) => s.zoom);
  const slitWidth = useRendererStore((s) => s.slitWidth);
  const setSlitWidth = useRendererStore((s) => s.setSlitWidth);
  const wallHex = useRendererStore((s) => s.wallHex);
  const setWall = useRendererStore((s) => s.setWall);

  const handleSelectWall = useCallback((hex: string, rgb: readonly [number, number, number]) => {
    setWall(hex, rgb as [number, number, number]);
  }, [setWall]);

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#120a1f]/50 hover:bg-[#120a1f]/85 backdrop-blur-md border-t border-pink-500/30 px-2 sm:px-3 py-1.5 sm:py-2 pointer-events-auto shadow-[0_0_20px_rgba(255,42,75,0.15)] transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <LaserPicker />
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-pink-300/60 font-bold tracking-wider">SLIT</span>
          <input
            type="range"
            min={0.0}
            max={20.0}
            step={0.1}
            value={slitWidth}
            onChange={(e) => setSlitWidth(Number(e.target.value))}
            className="w-14 h-1 appearance-none bg-pink-500/20 rounded-full outline-none accent-pink-500 cursor-pointer"
          />
          <span className="text-[8px] text-pink-200/60 font-mono min-w-[16px] text-right">{slitWidth.toFixed(1)}</span>
        </div>
        <WallColorPicker wallHex={wallHex} onSelect={handleSelectWall} />
      </div>
      <div className="flex items-center gap-1.5 text-[8px] text-pink-200/60 font-bold uppercase tracking-wider">
        <span>Z: {zoom.toFixed(2)}</span>
        <span className="text-pink-500/40">·</span>
        <span>SCROLL TO ZOOM</span>
        <span className="text-pink-500/40">·</span>
        <span>DRAG TO LOOK</span>
      </div>
    </div>
  );
});