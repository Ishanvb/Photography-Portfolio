import { useLayoutEffect } from 'react';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function FineartProject() {
  const headerAnimations = useHeaderAnimations();

  const galleryImages = [
    '/photos/Fineart/Fineart1.jpg'
  ];

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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
              src="/photos/Fineart/Fineart.jpg"
              alt="Fine Art"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="198px"
              $leftXl="150px"
              $leftMd="110px"
            >
              Fine Art
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            Creating and imagining stories before shooting was a vital part of this collection.
            Brainstorming for this included storyboarding and writing conceptual captions beforehand.
            These photos are meant to be interpreted abstractly with no clear answer for what is occurring
            in the photo. The audience should create their own story based on what is depicted in the image.
            The collection is meant to convey a sense of whimsy and appear as photos that could be found in
            storybooks.
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
                alt={`Fine Art ${index + 1}`}
              />
            </S.GalleryImageContainer>
          </S.GalleryItem>
        ))}
      </S.GallerySection>
      <Footer />
    </S.ProjectContainer>
  );
}

export default FineartProject;
