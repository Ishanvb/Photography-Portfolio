import { useEffect, useLayoutEffect, useRef } from 'react';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/ProjectGallery.styled';

function VideographyProject() {
  const headerAnimations = useHeaderAnimations();

  const playerRefs = useRef([null, null, null]);

  const youtubeVideos = [
    { id: 'lakOaiXYcp4' },
    { id: 'idLy5RoOYME' },
    { id: 'ok38O_TNS0Q' }
  ];

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      youtubeVideos.forEach((video, index) => {
        playerRefs.current[index] = new window.YT.Player(`youtube-player-${index}`, {
          videoId: video.id,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 1,
            disablekb: 0,
            cc_load_policy: 0,
            origin: window.location.origin
          }
        });
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // headerAnimations handled by useHeaderAnimations hook

  return (
    <S.ProjectContainer>
      <Header />

      <S.MainContainer $paddingBottom="200px">
        <S.DateFrame $isVisible={headerAnimations.date}>
          <S.DateText>[ Photo Collections: 3 ]</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src="/photos/Videography/videography.jpg"
              alt="Videography"
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              $left="80px"
              $leftXl="150px"
              $leftMd="110px"
            >
              Videography
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>
            My videography is often in collaboration with other artists to help portray their art visually.
            I attempt to capture the essence of artists' music through video by using a variety of techniques,
            pacing, framing, editing, and even cameras. These videos are used for social media promotion and
            Spotify to appeal to audiences who may resonate with the video and feel more inclined to look into
            the associated music. My videography is also used to promote Cal Poly's fashion club, FITS, and
            their related campaigns by using video to highlight clothing using a more fashion and lifestyle approach.
          </S.BodyText>
        </S.ContentFrame>
      </S.MainContainer>

      <S.GallerySection>
        {youtubeVideos.map((video, index) => (
          <S.GalleryItem key={index} $index={index}>
            <S.GalleryVideoContainer>
              <S.YoutubeWrapper data-cursor-youtube>
                <S.YoutubePlayer id={`youtube-player-${index}`} />
              </S.YoutubeWrapper>
            </S.GalleryVideoContainer>
          </S.GalleryItem>
        ))}
      </S.GallerySection>
      <Footer />
    </S.ProjectContainer>
  );
}

export default VideographyProject;
