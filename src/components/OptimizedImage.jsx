import { memo } from 'react';

/**
 * OptimizedImage - Renders images with WebP (ICC color preserved) and JPEG fallback
 * WebP created with -sharp_yuv and -metadata icc for accurate colors
 */
const OptimizedImage = memo(({ src, alt, className, loading = 'lazy', sizes, width, height, ...props }) => {
  const webpSrc = src.replace(/\.(jpg|jpeg)$/i, '.webp');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        sizes={sizes}
        width={width}
        height={height}
        {...props}
      />
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
