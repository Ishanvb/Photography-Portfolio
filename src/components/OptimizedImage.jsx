import { memo } from 'react';

/**
 * OptimizedImage - Renders images with WebP (ICC color preserved) and JPEG fallback
 * WebP created with -sharp_yuv and -metadata icc for accurate colors
 *
 * `webpSrc` is passed explicitly for content coming from the manifest, where the
 * two URLs are stored side by side. When it is absent (legacy /photos/... paths
 * still referenced directly in the source) the original derive-by-extension
 * behaviour applies, so existing call sites keep working untouched.
 */
const OptimizedImage = memo(({ src, webpSrc, alt, className, loading = 'lazy', sizes, width, height, ...props }) => {
  const resolvedWebp = webpSrc ?? src?.replace(/\.(jpg|jpeg)$/i, '.webp');

  return (
    <picture>
      {resolvedWebp && <source srcSet={resolvedWebp} type="image/webp" />}
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
