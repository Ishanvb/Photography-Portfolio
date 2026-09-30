import { memo } from 'react';
import { fallBackToOriginal, resized, resizedSrcSet, webpOf } from '~/content/imageUrl';

/**
 * OptimizedImage - Renders a photo from its WebP (ICC colour preserved). No
 * JPEG is ever downloaded: `src` is the photo's .jpg path, which only names it.
 *
 * `webpSrc` is passed explicitly for content coming from the manifest, where the
 * two URLs are stored side by side. When it is absent (/photos/... paths
 * referenced directly in the source) the WebP beside the .jpg is used.
 *
 * `maxWidth` is for photos shown well below their full size: the browser picks
 * from resized copies up to that width (see content/imageUrl.js) instead of
 * downloading the 2400px original. Pass `sizes` with it so it can choose.
 */
const OptimizedImage = memo(({ src, webpSrc, alt, className, loading = 'lazy', sizes, width, height, maxWidth, onError, ...props }) => {
  const webp = webpOf({ jpg: src, webp: webpSrc });

  if (maxWidth) {
    const fallBack = fallBackToOriginal(webp);
    return (
      <img
        src={resized(webp, maxWidth)}
        srcSet={resizedSrcSet(webp, maxWidth)}
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

  return (
    <img
      src={webp}
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
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
