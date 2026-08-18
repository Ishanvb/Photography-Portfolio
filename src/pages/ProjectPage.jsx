import { useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useHeaderAnimations from '~/hooks/useHeaderAnimations';
import { useProject } from '~/hooks/useContent';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import NotFound from '~/pages/NotFound';
import * as S from '~/pages/ProjectGallery.styled';

/**
 * One data-driven page replacing the six near-identical *Project.jsx files.
 * Behaviour (scroll-to-photo from the reel, staggered header animations,
 * YouTube embeds for video projects) is unchanged; only the source of the
 * content moved from hardcoded arrays to the content manifest.
 */
function ProjectPage() {
  const { slug } = useParams();
  const location = useLocation();
  const project = useProject(slug);

  const scrollToPhotoIndex = location.state?.scrollToPhotoIndex;
  const headerAnimations = useHeaderAnimations([location, scrollToPhotoIndex, slug]);

  const loadedImagesRef = useRef(new Set());
  const hasScrolledRef = useRef(false);
  const playerRefs = useRef([]);

  const isVideo = project?.mediaKind === 'video';
  const items = useMemo(() => project?.photos ?? [], [project]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  // Reset scroll bookkeeping when navigating between projects.
  useEffect(() => {
    loadedImagesRef.current = new Set();
    hasScrolledRef.current = false;
  }, [slug]);

  const scrollToTarget = useCallback(() => {
    const galleryItems = document.querySelectorAll('[data-gallery-item]');
    const target = galleryItems[scrollToPhotoIndex];
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scrollToPhotoIndex]);

  // Only scroll once everything above the target has loaded, so the target's
  // position has stopped moving.
  const handleImageLoad = useCallback((index) => {
    loadedImagesRef.current.add(index);
    if (scrollToPhotoIndex === undefined || scrollToPhotoIndex === null) return;
    if (hasScrolledRef.current) return;

    for (let i = 0; i <= scrollToPhotoIndex; i++) {
      if (!loadedImagesRef.current.has(i)) return;
    }
    hasScrolledRef.current = true;
    requestAnimationFrame(scrollToTarget);
  }, [scrollToPhotoIndex, scrollToTarget]);

  // Safety net if an image never fires onLoad (cache quirks, decode failure).
  useEffect(() => {
    if (scrollToPhotoIndex === undefined || scrollToPhotoIndex === null) return;
    const timer = setTimeout(() => {
      if (hasScrolledRef.current) return;
      hasScrolledRef.current = true;
      scrollToTarget();
    }, 3000);
    return () => clearTimeout(timer);
  }, [scrollToPhotoIndex, scrollToTarget]);

  // YouTube iframe API, for video projects only.
  useEffect(() => {
    if (!isVideo || items.length === 0) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(tag, first);
    }

    const build = () => {
      items.forEach((video, index) => {
        if (!video.youtubeId) return;
        playerRefs.current[index] = new window.YT.Player(`youtube-player-${index}`, {
          videoId: video.youtubeId,
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
            origin: window.location.origin,
          },
        });
      });
    };

    window.onYouTubeIframeAPIReady = build;
    if (window.YT?.Player) build();

    return () => {
      playerRefs.current.forEach((p) => p?.destroy?.());
      playerRefs.current = [];
    };
  }, [isVideo, items]);

  // An unknown or unpublished slug should look exactly like any other bad URL.
  if (!project) return <NotFound />;

  return (
    <S.ProjectContainer>
      <Header />

      <S.MainContainer>
        <S.DateFrame $isVisible={headerAnimations.date}>
          <S.DateText>{project.countLabel}</S.DateText>
        </S.DateFrame>

        <S.ContentFrame>
          <S.ImageTitleFrame>
            <S.HeroImage
              as={OptimizedImage}
              src={project.hero?.jpg}
              webpSrc={project.hero?.webp}
              alt={project.title}
              $isVisible={headerAnimations.image}
            />
            <S.ProjectTitle
              $isVisible={headerAnimations.title}
              {...Object.fromEntries(
                Object.entries(project.titleOffset ?? {}).map(([k, v]) => [`$${k}`, v])
              )}
            >
              {project.title}
            </S.ProjectTitle>
          </S.ImageTitleFrame>

          <S.BodyText $isVisible={headerAnimations.body}>{project.bodyText}</S.BodyText>
        </S.ContentFrame>
      </S.MainContainer>

      <S.GallerySection>
        {items.map((item, index) => (
          <S.GalleryItem key={item.jpg ?? item.youtubeId ?? index} $index={index} data-gallery-item>
            {isVideo ? (
              <S.GalleryVideoContainer>
                <S.YoutubeWrapper data-cursor-youtube>
                  <S.YoutubePlayer id={`youtube-player-${index}`} />
                </S.YoutubeWrapper>
              </S.GalleryVideoContainer>
            ) : (
              <S.GalleryImageContainer>
                <S.GalleryImage
                  as={OptimizedImage}
                  src={item.jpg}
                  webpSrc={item.webp}
                  alt={item.alt || `${project.title} ${index + 1}`}
                  width={item.width ?? undefined}
                  height={item.height ?? undefined}
                  onLoad={() => handleImageLoad(index)}
                />
              </S.GalleryImageContainer>
            )}
          </S.GalleryItem>
        ))}
      </S.GallerySection>
      <Footer />
    </S.ProjectContainer>
  );
}

export default ProjectPage;
