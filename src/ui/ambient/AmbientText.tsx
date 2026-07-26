import React from 'react';

export const AmbientText = React.memo(() => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-12 z-10 text-white/80 tracking-[0.4em] font-light text-2xl uppercase select-none">
      <span className="drop-shadow-[0_0_15px_rgba(255,42,75,0.9)]">relax</span>
      <span className="drop-shadow-[0_0_15px_rgba(255,42,75,0.9)]">breathe</span>
    </div>
  );
});