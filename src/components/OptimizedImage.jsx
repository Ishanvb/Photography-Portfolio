import { memo } from 'react';
import { fallBackToOriginal, resized, resizedSrcSet } from '~/content/imageUrl';

/**
 * OptimizedImage - Renders images with WebP (ICC color preserved) and JPEG fallback
 * WebP created with -sharp_yuv and -metadata icc for accurate colors
 *
 * `webpSrc` is passed explicitly for content coming from the manifest, where the
 * two URLs are stored side by side. When it is absent (legacy /photos/... paths
 * still referenced directly in the source) the original derive-by-extension
 * behaviour applies, so existing call sites keep working untouched.
 *
 * `maxWidth` is for photos shown well below their full size: the browser picks
 * from resized copies up to that width (see content/imageUrl.js) instead of
 * downloading the 2400px original. Pass `sizes` with it so it can choose.
 */
const OptimizedImage = memo(({ src, webpSrc, alt, className, loading = 'lazy', sizes, width, height, maxWidth, onError, ...props }) => {
  if (maxWidth) {
    const fallBack = fallBackToOriginal(webpSrc ?? src);
    return (
      <img
        src={resized(src, maxWidth)}
        srcSet={resizedSrcSet(src, maxWidth)}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        onError={(event) => {
          fallBack(event);
          onError?.(event);
        }}
        {...props}
      />
    );
  }

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
        onError={onError}
        {...props}
      />
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
