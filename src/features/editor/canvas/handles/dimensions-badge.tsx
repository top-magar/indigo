'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/shared/utils';

export function DimensionsBadge({ wrapperRef, isSelected }: {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setDims({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wrapperRef]);

  if (!dims) return null;

  return (
    <span className={cn(
      'absolute -bottom-5 right-0 z-[19] rounded px-0.5 text-[10px] font-mono whitespace-nowrap pointer-events-none origin-top-right',
      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/70',
    )} style={{ transform: 'scale(calc(1 / var(--zoom, 1)))' }}>
      {dims.w} × {dims.h}
    </span>
  );
}
