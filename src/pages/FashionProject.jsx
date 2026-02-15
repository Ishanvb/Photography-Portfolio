import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function FashionProject() {
  const location = useLocation();
  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;
  const headerAnimations = useHeaderAnimations([location, scrollToPhotoIndex]);

  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);

  const galleryImages = [
    '/photos/Fashion/Fashion1.jpg',
    '/photos/Fashion/Fashion2.jpg',
    '/photos/Fashion/Fashion3.jpg',
    '/photos/Fashion/Fashion4.jpg',
    '/photos/Fashion/Fashion5.jpg',
    '/photos/Fashion/Fashion6.jpg',
    '/photos/Fashion/Fashion7.jpg',
    '/photos/Fashion/Fashion8.jpg',
    '/photos/Fashion/Fashion9.jpg',
    '/photos/Fashion/Fashion10.jpg',
    '/photos/Fashion/Fashion11.jpg',
    '/photos/Fashion/Fashion12.jpg',
    '/photos/Fashion/Fashion13.jpg',
    '/photos/Fashion/Fashion14.jpg',
    '/photos/Fashion/Fashion15.jpg'
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
          <S.DateText>[ Photo Collections: 16 ]</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src="/photos/Fashion/Fashion.jpg"
              alt="Fashion"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="198px"
              $leftXl="150px"
              $leftMd="110px"
            >
              Fashion
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            My fashion photoshoots are intended to be styled and framed in ways that emulate a
            specific time period of fashion, industry, or lifestyle. The highlight of these photos
            is the clothing and accessories, but the models contribute to telling a story about
            the chosen aesthetic. Using technical skills, creative vision, elements like styling,
            location, and mood help elevate garments beyond mere products into encompassing a curated
            atmosphere/visual.
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
                alt={`Fashion ${index + 1}`}
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

export default FashionProject;
