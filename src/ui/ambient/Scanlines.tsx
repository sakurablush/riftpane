import React, { useEffect, useMemo, useState } from 'react';
import { useUiStore } from '../../state/uiStore';

export const Scanlines = React.memo(() => {
  const crtGlitch = useUiStore((s) => s.crtGlitch);
  const [scanSize, setScanSize] = useState(4);

  useEffect(() => {
    if (!crtGlitch) return;
    
    const computeScanSize = () => {
      const h = window.innerHeight || 1080;
      // Adaptive scanlines: 3px on small screens, 6px on large
      setScanSize(Math.max(3, Math.min(6, Math.round(h / 250))));
    };

    computeScanSize();
    
    let timeout: number;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(computeScanSize, 150);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(document.body);
    
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [crtGlitch]);

  if (!crtGlitch) return null;

  const style = useMemo(() => ({
    backgroundImage: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%)`,
    backgroundSize: `100% ${scanSize}px`,
  }), [scanSize]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 opacity-15"
      style={style}
    />
  );
});