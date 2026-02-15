import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function UrbangeometryProject() {
  const location = useLocation();
  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;
  const headerAnimations = useHeaderAnimations([location, scrollToPhotoIndex]);

  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);

  const galleryImages = [
    '/photos/Urbangeometry/Urbangeometry1.jpg'
  ];

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleImageLoad = useCallback((index) => {
    loadedImagesRef.current.add(index);

    if (scrollToPhotoIndex !== undefined && scrollToPhotoIndex !== null && !hasScrolledRef.current) {
      let allLoaded = true;
      for (let i = 0; i <= scrollToPhotoIndex; i++) {
        if (!loadedImagesRef.current.has(i)) {
          allLoaded = false;
          break;
        }
      }

      if (allLoaded) {
        hasScrolledRef.current = true;
        requestAnimationFrame(() => {
          const galleryItems = document.querySelectorAll('[data-gallery-item]');
          if (galleryItems[scrollToPhotoIndex]) {
            galleryItems[scrollToPhotoIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        });
      }
    }
  }, [scrollToPhotoIndex]);

  useEffect(() => {
    if (scrollToPhotoIndex !== undefined && scrollToPhotoIndex !== null) {
      const fallbackTimer = setTimeout(() => {
        if (!hasScrolledRef.current) {
          hasScrolledRef.current = true;
          const galleryItems = document.querySelectorAll('[data-gallery-item]');
          if (galleryItems[scrollToPhotoIndex]) {
            galleryItems[scrollToPhotoIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }, 3000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [scrollToPhotoIndex]);

  return (
    <S.ProjectContainer>
      <Header />

      <S.MainContainer>
        <S.DateFrame $isVisible={headerAnimations.date}>
          <S.DateText>[ Photo Collections: 2 ]</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src="/photos/Urbangeometry/Urbangeometry.jpg"
              alt="Urban Geometry"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="80px"
              $top="80%"
              $width="900px"
              $lineHeight="0.65"
              $leftXl="150px"
              $leftMd="110px"
              $fontSizeXs="50px"
            >
              Urban Geometry
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            This collection highlights the natural patterns that appear in urban settings.
            These photos focus on architectural design, negative space, and the harmony of
            the natural and man-made world. Perspective and framing is very important here
            as it can highlight symmetries and light and identify otherwise hidden textures
            or patterns.
          </S.BodyText>
        </S.ContentFrame>
      </S.MainContainer>

      <S.GallerySection>
        {galleryImages.map((image, index) => (
          <S.GalleryItem key={index} $index={index} data-gallery-item>
            <S.GalleryImageContainer>
              <S.GalleryImage
                as={OptimizedImage}
                src={image}
                alt={`Urban Geometry ${index + 1}`}
                onLoad={() => handleImageLoad(index)}
              />
            </S.GalleryImageContainer>
          </S.GalleryItem>
        ))}
      </S.GallerySection>
      <Footer />
    </S.ProjectContainer>
  );
}

export default UrbangeometryProject;
