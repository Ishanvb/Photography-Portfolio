import { useState, useEffect, useRef } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from './About.styled';

function About() {
  const [showContent, setShowContent] = useState(false);
  const [wordStyles, setWordStyles] = useState({});
  const [bioListWidth, setBioListWidth] = useState('auto');
  const [workListWidth, setWorkListWidth] = useState('auto');
  const [photosVisible, setPhotosVisible] = useState(false);
  const [visibleBioItems, setVisibleBioItems] = useState([]);
  const [visibleWorkItems, setVisibleWorkItems] = useState([]);
  const bodyTextRef = useRef(null);
  const bioListRef = useRef(null);
  const workListRef = useRef(null);
  const photosRef = useRef(null);

  useEffect(() => {
    setShowContent(true);
  }, []);

  // Calculate list widths based on longest item + 50px
  useEffect(() => {
    if (bioListRef.current) {
      const items = bioListRef.current.querySelectorAll('p');
      let maxWidth = 0;
      items.forEach(item => {
        const width = item.scrollWidth;
        if (width > maxWidth) maxWidth = width;
      });
      setBioListWidth(maxWidth + 50);
    }

    if (workListRef.current) {
      const items = workListRef.current.querySelectorAll('p');
      let maxWidth = 0;
      items.forEach(item => {
        const width = item.scrollWidth;
        if (width > maxWidth) maxWidth = width;
      });
      setWorkListWidth(maxWidth + 50);
    }
  }, [showContent]);

  // Scroll-triggered animations using Intersection Observer
  useEffect(() => {
    // Photos fade in
    const photosObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPhotosVisible(true);
            photosObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (photosRef.current) {
      photosObserver.observe(photosRef.current);
    }

    // Bio list items staggered fade in
    const bioObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = bioListRef.current?.querySelectorAll('p');
            if (items) {
              items.forEach((_, index) => {
                setTimeout(() => {
                  setVisibleBioItems((prev) => [...prev, index]);
                }, index * 100);
              });
            }
            bioObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (bioListRef.current) {
      bioObserver.observe(bioListRef.current);
    }

    // Work list items staggered fade in
    const workObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = workListRef.current?.querySelectorAll('p');
            if (items) {
              items.forEach((_, index) => {
                setTimeout(() => {
                  setVisibleWorkItems((prev) => [...prev, index]);
                }, index * 100);
              });
            }
            workObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (workListRef.current) {
      workObserver.observe(workListRef.current);
    }

    return () => {
      photosObserver.disconnect();
      bioObserver.disconnect();
      workObserver.disconnect();
    };
  }, [showContent]);

  // Blur reveal effect on open - line by line from top to bottom
  useEffect(() => {
    if (!showContent) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!bodyTextRef.current) return;

      const words = bodyTextRef.current.querySelectorAll('span');
      if (words.length === 0) return;

      // Get each word's vertical position relative to the container
      const containerTop = bodyTextRef.current.offsetTop;
      const wordPositions = [];
      let minTop = Infinity;
      let maxTop = 0;

      words.forEach((word, index) => {
        const wordTop = word.offsetTop - containerTop;
        minTop = Math.min(minTop, wordTop);
        maxTop = Math.max(maxTop, wordTop);
        wordPositions.push({ index, top: wordTop });
      });

      const totalHeight = maxTop - minTop || 1;
      const gradientHeight = 0.4; // 40% of text height for gradient spread
      const animationDuration = 800; // Total animation time in ms

      let startTime = null;
      let animationFrame;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        // Add extra progress to ensure all text is fully revealed at the end
        const progress = Math.min(1 + gradientHeight, elapsed / animationDuration);

        const newWordStyles = {};

        wordPositions.forEach(({ index, top }) => {
          // Normalize position from 0 to 1
          const normalizedPosition = (top - minTop) / totalHeight;

          // Calculate distance from reveal line
          const distance = normalizedPosition - progress;

          let blurAmount;
          let state;

          if (distance <= 0) {
            // Fully revealed
            blurAmount = 0;
            state = 'revealed';
          } else if (distance < gradientHeight) {
            // In gradient zone - smooth transition
            const gradientProgress = distance / gradientHeight;
            blurAmount = gradientProgress * 5;
            state = 'revealing';
          } else {
            // Not yet revealed
            blurAmount = 5;
            state = 'hidden';
          }

          newWordStyles[index] = { blur: blurAmount, state };
        });

        setWordStyles(newWordStyles);

        if (progress < 1 + gradientHeight) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }, 400); // Initial delay for content fade-in

    return () => clearTimeout(timer);
  }, [showContent]);

  const firstSentence = "I'm a second-year Business Administration student concentrating in Marketing with a minor in Photography and Videography at Cal Poly San Luis Obispo.";
  const restOfText = " During my time at school, I've been working as a videographer for Cal Poly Athletics, filming coverage for all Division I ESPN livestreams as well as getting footage for social media and pregame edits. Through courses for my minor, my association in my school's fashion club, and personal interest, I have worked with and photographed many different subjects and activities, using a variety of skills and techniques.";

  // Split text into words for blur reveal
  const renderBlurText = (text, isHighlight, startIndex) => {
    const words = text.split(' ');
    return words.map((word, i) => {
      const globalIndex = startIndex + i;
      const style = wordStyles[globalIndex] ?? { blur: 5, state: 'hidden' };

      // Determine opacity based on state
      const originalOpacity = isHighlight ? 1 : 0.6;
      let opacity;
      if (style.state === 'hidden') {
        opacity = 0; // Not visible yet
      } else if (style.state === 'revealing') {
        opacity = 1; // Full opacity while revealing
      } else {
        opacity = originalOpacity; // Settled to final opacity
      }

      return (
        <S.BlurWord
          key={globalIndex}
          $isHighlight={isHighlight}
          style={{
            filter: `blur(${style.blur}px)`,
            opacity: opacity
          }}
        >
          {word}{' '}
        </S.BlurWord>
      );
    });
  };

  const firstSentenceWords = firstSentence.split(' ').length;

  return (
    <S.Container>
      <Header />

      {/* About title at top center */}
      <S.Title $isVisible={showContent}>About</S.Title>

      {/* Main content frame */}
      <S.ContentFrame $isVisible={showContent}>
        {/* Welcome header */}
        <S.SectionHeader>
          <S.SectionHeaderText>Welcome</S.SectionHeaderText>
          <S.SectionHeaderText>S.1</S.SectionHeaderText>
        </S.SectionHeader>

        {/* Body text with blur reveal */}
        <S.BodyText ref={bodyTextRef}>
          {renderBlurText(firstSentence, true, 0)}
          {renderBlurText(restOfText, false, firstSentenceWords)}
        </S.BodyText>

        {/* Photos frame */}
        <S.PhotosFrame $isVisible={photosVisible} ref={photosRef}>
          <S.PhotoLarge data-cursor="School" data-cursor-icon="school">
            <OptimizedImage src="/photos/About/About.jpg" alt="School" />
          </S.PhotoLarge>
          <S.PhotoMedium data-cursor="Fashion" data-cursor-icon="fashion">
            <OptimizedImage src="/photos/About/About1.jpg" alt="Fashion" />
          </S.PhotoMedium>
          <S.PhotoSmall data-cursor="Me!" data-cursor-icon="me">
            <img src="/photos/About/AboutMe.jpg" alt="Me" />
          </S.PhotoSmall>
        </S.PhotosFrame>

        {/* Information header */}
        <S.SectionHeader>
          <S.SectionHeaderText>Information</S.SectionHeaderText>
          <S.SectionHeaderText>S.2</S.SectionHeaderText>
        </S.SectionHeader>
      </S.ContentFrame>

      {/* Info section - Biography and Work (outside content-frame for full width) */}
      <S.InfoSection>
        {/* Biography row - 150px from left */}
        <S.BioRow>
          <S.BioList ref={bioListRef} style={{ width: bioListWidth }}>
            {['Hometown : Austin, TX', 'School : Cal Poly San Luis Obispo', 'Year : Sophomore', 'Major : Business', 'Minor : Photography and Videography', 'Favorite Camera : Nikon D3500'].map((item, index) => (
              <S.BioListItem
                key={index}
                $isVisible={visibleBioItems.includes(index)}
              >
                {item}
              </S.BioListItem>
            ))}
          </S.BioList>
          <S.BioTitle $isVisible={visibleBioItems.length > 0}>Biography</S.BioTitle>
        </S.BioRow>

        {/* Work row - 150px from right */}
        <S.WorkRow>
          <S.WorkTitle $isVisible={visibleWorkItems.length > 0}>Work</S.WorkTitle>
          <S.WorkList ref={workListRef} style={{ width: workListWidth }}>
            {['Cal Poly FITS', 'MeerMutter Label', 'ART 122'].map((item, index) => (
              <S.WorkListItem
                key={index}
                $isVisible={visibleWorkItems.includes(index)}
              >
                {item}
              </S.WorkListItem>
            ))}
          </S.WorkList>
        </S.WorkRow>
      </S.InfoSection>

      <Footer />
    </S.Container>
  );
}

export default About;
