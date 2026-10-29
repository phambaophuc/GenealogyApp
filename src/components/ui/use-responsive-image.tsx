import * as React from "react";
import { useSize } from "../../hooks/use-size";
import { cn } from "../../lib/utils";
import {
  DEFAULT_TRANSFORM_WIDTH,
  getImagePreviewClassName,
  type ImageFocalPoint,
  type ImageTransformOptions,
  type ParsedWixMediaUrl,
} from "./image-helpers";

type FittingType = "fill" | "fit";

interface UseResponsiveImageProps {
  parsed: ParsedWixMediaUrl;
  fittingType?: FittingType;
  focalPoint?: ImageFocalPoint;
  quality: number;
  className?: string;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onSourceChange?: (value: string, className?: string) => void;
}

export function useResponsiveImage(
  {
    parsed,
    fittingType = "fill",
    focalPoint,
    quality,
    className,
    onLoad,
    onSourceChange,
  }: UseResponsiveImageProps,
  parentRef: React.ForwardedRef<HTMLImageElement>,
) {
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const size = useSize(wrapperRef);

  const [loadedBaseUrl, setLoadedBaseUrl] = React.useState<string | null>(null);

  const loaded = loadedBaseUrl === parsed.baseUrl;

  React.useImperativeHandle(parentRef, () => imgRef.current!);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return;

    const replace = (event: Event): void => {
      const customEvent = event as CustomEvent<{ src: string }>;

      onSourceChange?.(
        customEvent.detail.src,
        getImagePreviewClassName(
          className,
          wrapper.className,
          cn("inline-block relative", className),
        ),
      );
    };

    wrapper.addEventListener("base44:image-replace", replace);

    return () => {
      wrapper.removeEventListener("base44:image-replace", replace);
    };
  }, [className, onSourceChange]);

  const crop = fittingType !== "fit";

  const options: ImageTransformOptions | null = size
    ? {
        width: size.width || DEFAULT_TRANSFORM_WIDTH,
        height: size.height || undefined,
        crop,
        focalPoint: crop ? focalPoint : undefined,
        quality,
      }
    : null;

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setLoadedBaseUrl(parsed.baseUrl);
    onLoad?.(event);
  };

  return {
    wrapperRef,
    imgRef,
    loaded,
    options,
    handleLoad,
  };
}
