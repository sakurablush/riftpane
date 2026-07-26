import React from 'react';

// Slot machine–style scroll–snap carousel powered by native CSS scroll snap.
// This is intentionally minimal to keep file size and render cost low.
export function SlotReel({ items, activeIndex, onSelect, renderItem }: { items: string[]; activeIndex: number; onSelect: (index: number) => void; renderItem: (value: string, index: number) => React.ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 pt-1 px-1">
      {items.map((value, index) => (
        <button
          key={value}
          onClick={() => onSelect(index)}
          className={`snap-start shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
            activeIndex === index ? 'border-pink-400 bg-pink-500/20 text-white shadow-[0_0_10px_rgba(255,42,75,0.8)]' : 'border-white/10 text-white/60 hover:text-white'
          }`}
        >
          {renderItem(value, index)}
        </button>
      ))}
    </div>
  );
}