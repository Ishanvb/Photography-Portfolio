import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function PortraitProject() {
  const location = useLocation();
  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;
  const headerAnimations = useHeaderAnimations([location, scrollToPhotoIndex]);

  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);

  const galleryImages = [
    '/photos/PortraitProject/Portrait1.jpg',
    '/photos/PortraitProject/Portrait2.jpg',
    '/photos/PortraitProject/Portrait3.jpg',
    '/photos/PortraitProject/Portrait4.jpg',
    '/photos/PortraitProject/Portrait5.jpg',
    '/photos/PortraitProject/Portrait6.jpg',
    '/photos/PortraitProject/Portrait7.jpg'
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
          <S.DateText>[ Photo Collections: 8 ]</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src="/photos/PortraitProject/Portrait.jpg"
              alt="Portrait"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="198px"
              $leftXl="150px"
              $leftMd="110px"
            >
              Portraits
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            This collection of portraits was meant to capture the ways I view my friends and their unique auras.
            I used a variety of portrait lighting techniques including split, loop, beauty, rembrandt, paramount,
            and short/broad light. Each of these techniques is used to accentuate the feelings each photo evokes.
            I work with my models to style and pose them in ways that align with their own personal image and
            simultaneously match the vision I conceptualized for the photograph.
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
                alt={`Portrait ${index + 1}`}
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

export default PortraitProject;
