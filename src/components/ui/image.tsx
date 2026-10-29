import * as React from "react";
import {
  IMAGE_LOAD_MODE,
  parseWixMediaUrl,
  nextImageLoadMode,
  getOriginalImageUrl,
} from "./image-helpers";
import { ResponsiveImage } from "./responsive-image";

const FALLBACK_IMAGE_URL =
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png";

type ImageLoadMode = (typeof IMAGE_LOAD_MODE)[keyof typeof IMAGE_LOAD_MODE];

type FittingType = React.ComponentPropsWithoutRef<
  typeof ResponsiveImage
>["fittingType"];

interface PreviewSource {
  source: string;
  value: string;
  className?: string;
  sourceClassName?: string;
}

type ImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src?: string;
  fittingType?: FittingType;
  originWidth?: number;
  originHeight?: number;
  focalPointX?: number;
  focalPointY?: number;
  quality?: number;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

/**
 * Image with built-in Wix Media Platform support.
 *
 * Optimizes supported Wix images according to the rendered container
 * and device pixel ratio. Failed transforms retry the original URL.
 * If the original image also fails, a generic fallback image is used.
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src: source,
      fittingType = "fill" as FittingType,
      originWidth,
      originHeight,
      focalPointX,
      focalPointY,
      quality = 90,
      onError,
      ...props
    },
    ref,
  ) => {
    const [previewSource, setPreviewSource] =
      React.useState<PreviewSource | null>(null);

    const preview = previewSource?.source === source ? previewSource : null;

    const src = preview ? preview.value : source;

    const replaceSource = (value: string, className?: string): void => {
      setPreviewSource({
        source: source ?? "",
        value,
        className,
        sourceClassName: props.className,
      });
    };

    React.useEffect(() => {
      setPreviewSource(null);
    }, [source]);

    const parsedSource =
      src && src !== FALLBACK_IMAGE_URL ? parseWixMediaUrl(src) : null;

    const initialMode: ImageLoadMode = parsedSource
      ? IMAGE_LOAD_MODE.OPTIMIZED
      : IMAGE_LOAD_MODE.ORIGINAL;

    const [loadState, setLoadState] = React.useState<{
      src: string | undefined;
      mode: ImageLoadMode;
    }>({
      src,
      mode: initialMode,
    });

    const mode = loadState.src === src ? loadState.mode : initialMode;

    React.useEffect(() => {
      setLoadState({ src, mode: initialMode });
    }, [src, initialMode]);

    const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
      if (mode === IMAGE_LOAD_MODE.FALLBACK) return;

      const nextMode = nextImageLoadMode(mode);

      setLoadState({
        src,
        mode: nextMode,
      });

      if (nextMode === IMAGE_LOAD_MODE.FALLBACK) {
        onError?.(event);
      }
    };

    const imageProps = {
      ...props,
      className:
        preview && preview.sourceClassName === props.className
          ? preview.className
          : props.className,
      onError: handleError,
    };

    if (!src) {
      return (
        <img
          ref={ref}
          src={FALLBACK_IMAGE_URL}
          {...imageProps}
          data-empty-image
        />
      );
    }

    const parsed = mode === IMAGE_LOAD_MODE.OPTIMIZED ? parsedSource : null;

    if (!parsed) {
      const isErrorMode = mode === IMAGE_LOAD_MODE.FALLBACK;

      const imageSrc = isErrorMode
        ? FALLBACK_IMAGE_URL
        : getOriginalImageUrl(src, parsedSource);

      return (
        <img
          ref={ref}
          src={imageSrc}
          {...imageProps}
          data-error-image={isErrorMode || undefined}
        />
      );
    }

    const focalPoint =
      typeof focalPointX === "number" && typeof focalPointY === "number"
        ? { x: focalPointX, y: focalPointY }
        : undefined;

    const aspectRatio =
      originWidth && originHeight
        ? `${originWidth} / ${originHeight}`
        : undefined;

    return (
      <ResponsiveImage
        ref={ref}
        src={src}
        parsed={parsed}
        onSourceChange={replaceSource}
        fittingType={fittingType}
        focalPoint={focalPoint}
        quality={quality}
        aspectRatio={aspectRatio}
        {...imageProps}
      />
    );
  },
);

Image.displayName = "Image";

export { Image };
