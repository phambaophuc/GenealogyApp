import * as React from "react";
import { cn } from "../../lib/utils";
import {
  buildSrcSet,
  buildTransformUrl,
  splitImageProps,
  type parseWixMediaUrl,
} from "./image-helpers";
import { useResponsiveImage } from "./use-responsive-image";

type ParsedImage = NonNullable<ReturnType<typeof parseWixMediaUrl>>;

type FittingType = "fill" | "fit";

interface FocalPoint {
  x: number;
  y: number;
}

type ResponsiveImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onLoad"
> & {
  src: string;
  parsed: ParsedImage;
  fittingType?: FittingType;
  focalPoint?: FocalPoint;
  quality?: number;
  aspectRatio?: string;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onSourceChange?: (value: string, className?: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

export const ResponsiveImage = React.forwardRef<
  HTMLImageElement,
  ResponsiveImageProps
>(
  (
    {
      src,
      parsed,
      fittingType = "fill",
      focalPoint,
      quality = 90,
      className,
      style,
      aspectRatio,
      onLoad,
      onSourceChange,
      ...props
    },
    ref,
  ) => {
    const { wrapperRef, imgRef, loaded, options, handleLoad } =
      useResponsiveImage(
        {
          parsed,
          fittingType,
          focalPoint,
          quality,
          className,
          onLoad,
          onSourceChange,
        },
        ref,
      );

    const { wrapperProps, imageProps } = splitImageProps(props);

    return (
      <span
        ref={wrapperRef}
        className={cn("inline-block relative", className)}
        style={{ aspectRatio, ...style }}
        {...wrapperProps}
        data-base44-image=""
        data-base44-image-src={src}
      >
        {/* Keep both image layers inside the padded content box. */}
        <span
          data-source-location={undefined}
          className="block relative w-full h-full overflow-hidden"
        >
          {options && !loaded && (
            <img
              data-source-location={undefined}
              src={buildTransformUrl(parsed, {
                ...options,
                width: 20,
                height: options.height
                  ? Math.max(
                      1,
                      Math.round((20 * options.height) / options.width),
                    )
                  : undefined,
                quality: 20,
              })}
              alt=""
              aria-hidden="true"
              className="w-full h-full inset-0 absolute"
              style={{
                objectFit: fittingType === "fit" ? "contain" : "cover",
                filter: "blur(10px)",
                transform: "scale(1.1)",
              }}
            />
          )}

          {options && (
            <img
              data-source-location={undefined}
              ref={imgRef}
              src={buildTransformUrl(parsed, options)}
              srcSet={buildSrcSet(parsed, options)}
              loading="lazy"
              className={cn(
                "w-full h-full inset-0 absolute",
                fittingType === "fit" ? "object-contain" : "object-cover",
              )}
              onLoad={handleLoad}
              {...imageProps}
            />
          )}
        </span>
      </span>
    );
  },
);

ResponsiveImage.displayName = "ResponsiveImage";
