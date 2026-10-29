import * as React from "react";

export interface ElementSize {
  width: number;
  height: number;
}

export function useSize<T extends Element>(
  ref: React.RefObject<T | null>,
): ElementSize | null {
  const [size, setSize] = React.useState<ElementSize | null>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setSize({
      width: rect.width,
      height: rect.height,
    });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
