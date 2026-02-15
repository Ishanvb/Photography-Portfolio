import { useLayoutEffect } from 'react';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function LightProject() {
  const headerAnimations = useHeaderAnimations();

  const galleryImages = [
    '/photos/Light/Light1.jpg',
    '/photos/Light/Light2.jpg',
    '/photos/Light/Light3.jpg'
  ];

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <S.ProjectContainer>
      <Header />

      <S.MainContainer>
        <S.DateFrame $isVisible={headerAnimations.date}>
          <S.DateText>[ Photo Collections: 4 ]</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src="/photos/Light/Light.jpg"
              alt="Light"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="198px"
              $leftXl="150px"
              $leftMd="110px"
            >
              Light
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            In this collection I used a photographic technique called painting with light.
            I used various light sources to illuminate parts of a scene during a long exposure.
            This method allows for the creation of unique light patterns, highlights, and artistic
            effects that are not possible with standard lighting techniques. A combination of gelled
            lights, external flash, and natural light was used to paint the photo interpretation of
            song lyrics I chose beforehand.
          </S.BodyText>
        </S.ContentFrame>
      </S.MainContainer>

      <S.GallerySection>
        {galleryImages.map((image, index) => (
          <S.GalleryItem key={index} $index={index}>
            <S.GalleryImageContainer>
              <S.GalleryImage
                as={OptimizedImage}
                src={image}
                alt={`Light ${index + 1}`}
              />
            </S.GalleryImageContainer>
          </S.GalleryItem>
        ))}
      </S.GallerySection>
      <Footer />
    </S.ProjectContainer>
  );
}

export default LightProject;
