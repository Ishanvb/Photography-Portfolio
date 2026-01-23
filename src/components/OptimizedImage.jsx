/**
 * OptimizedImage - Renders images with WebP (ICC color preserved) and JPEG fallback
 * WebP created with -sharp_yuv and -metadata icc for accurate colors
 */
const OptimizedImage = ({ src, alt, className, loading = 'lazy', ...props }) => {
  const webpSrc = src.replace(/\.(jpg|jpeg)$/i, '.webp');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
