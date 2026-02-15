import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useMobileDetect from '~/hooks/useMobileDetect';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import * as S from '~/pages/Work.styled';

// Animated category label with downward scrolling letters on hover
const AnimatedCategoryLabel = ({ text }) => {
  return (
    <S.AnimatedCategory>
      {text.split("").map((char, i) => (
        <S.Letter
          key={i}
          style={{ transitionDelay: `${i * 35}ms` }}
        >
          <S.LetterStack>
            <span>{char === " " ? "\u00A0" : char}</span>
            <span>{char === " " ? "\u00A0" : char}</span>
          </S.LetterStack>
        </S.Letter>
      ))}
    </S.AnimatedCategory>
  );
};

const workProjects = [
  {
    id: 1,
    image: '/photos/reelphotos/mari6.jpg',
    title: 'PORTRAITS',
    description: 'COLLECTIONS: 8'
  },
  {
    id: 2,
    image: '/photos/reelphotos/mari7.jpg',
    title: 'FASHION',
    description: 'COLLECTIONS: 4'
  },
  {
    id: 3,
    image: '/photos/Light/Light.jpg',
    title: 'LIGHT',
    description: 'COLLECTIONS: 3'
  },
  {
    id: 4,
    image: '/photos/Fineart/Fineart.jpg',
    title: 'FINE ART',
    description: 'COLLECTIONS: 2'
  },
  {
    id: 5,
    image: '/photos/Urbangeometry/Urbangeometry.jpg',
    title: 'URBAN GEOMETRY',
    description: 'COLLECTIONS: 2'
  },
  {
    id: 6,
    image: '/photos/Videography/videography.jpg',
    title: 'VIDEOGRAPHY',
    description: 'COLLECTIONS: 3'
  }
];

function Work() {
  const navigate = useNavigate();
  const isMobile = useMobileDetect();
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Store initial mobile state for typing text (doesn't change on resize)
  const initialMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth <= 768);

  // Category dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownReady, setDropdownReady] = useState(false);

  // Instruction bar reveal state
  const instructionRef = useRef(null);
  const [instructionVisible, setInstructionVisible] = useState(false);

  const handleProjectClick = (projectId) => {
    if (projectId === 1) {
      navigate('/work/portrait-project');
    } else if (projectId === 2) {
      navigate('/work/fashion-project');
    } else if (projectId === 3) {
      navigate('/work/light-project');
    } else if (projectId === 4) {
      navigate('/work/fineart-project');
    } else if (projectId === 5) {
      navigate('/work/urbangeometry-project');
    } else if (projectId === 6) {
      navigate('/work/videography-project');
    }
  };

  // Navigate to project page when category is clicked
  const handleCategoryClick = (projectId) => {
    setDropdownOpen(false);
    handleProjectClick(projectId);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Set dropdown ready after fade-in animation completes (0.8s)
  useEffect(() => {
    if (isTypingComplete) {
      const timer = setTimeout(() => {
        setDropdownReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTypingComplete]);

  useEffect(() => {
    // Use shorter text on mobile (based on initial load, not resize)
    const fullText = initialMobileRef.current ? "Here's my Work." : "Here's some of my Work.";
    const finalText = "Work";
    let currentIndex = 0;
    let isDeleting = false;
    let deleteIndex = fullText.length;

    const typeText = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
        if (currentIndex > fullText.length) {
          setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 1000);
        } else {
          setTimeout(typeText, 50);
        }
      } else if (isDeleting && deleteIndex >= 0) {
        setDisplayText(fullText.substring(0, deleteIndex));
        deleteIndex--;
        if (deleteIndex < 0) {
          setTimeout(() => {
            let finalIndex = 0;
            const typeFinal = () => {
              if (finalIndex <= finalText.length) {
                setDisplayText(finalText.substring(0, finalIndex));
                finalIndex++;
                if (finalIndex > finalText.length) {
                  setIsTypingComplete(true);
                } else {
                  setTimeout(typeFinal, 80);
                }
              }
            };
            typeFinal();
          }, 200);
        } else {
          setTimeout(typeText, 30);
        }
      }
    };

    typeText();
  }, []); // Run only once on mount

  // Intersection Observer for instruction bar reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !instructionVisible) {
            setInstructionVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (instructionRef.current) {
      observer.observe(instructionRef.current);
    }

    return () => {
      if (instructionRef.current) {
        observer.unobserve(instructionRef.current);
      }
    };
  }, [instructionVisible]);

  // Helper to format title
  const formatTitle = (title, index) => {
    return `P${index + 1} ${title.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}`;
  };

  return (
    <S.Page>
      <Header />
      <S.HeaderRow>
        <S.CategoryDropdown $isOpen={dropdownOpen} $isVisible={isTypingComplete} data-category-dropdown={dropdownOpen ? 'open' : 'closed'}>
          {/* Projects title with arrow on right - entire frame clickable on mobile */}
          <S.CategoryItem
            onClick={isMobile ? toggleDropdown : undefined}
          >
            <S.CategoryText>Projects</S.CategoryText>
            <S.CategoryArrow
              $isOpen={dropdownOpen}
              onClick={!isMobile ? toggleDropdown : undefined}
              {...(dropdownReady && !isMobile && { 'data-cursor-magnet': true })}
            />
          </S.CategoryItem>

          {/* Line under title */}
          <S.CategoryLine />

          {/* Dropdown items P1-P6 */}
          <S.DropdownItems>
            {workProjects.map((project, index) => (
              <S.DropdownItem
                key={project.id}
                onClick={() => handleCategoryClick(project.id)}
              >
                <S.CategoryText>
                  <AnimatedCategoryLabel text={formatTitle(project.title, index)} />
                </S.CategoryText>
              </S.DropdownItem>
            ))}
          </S.DropdownItems>
        </S.CategoryDropdown>

        <S.TitleFrame>
          <S.PageTitle>
            {displayText}
            {!isTypingComplete && <S.Cursor>|</S.Cursor>}
          </S.PageTitle>
        </S.TitleFrame>
      </S.HeaderRow>
      <S.Content>
        {/* Instruction bar above gallery */}
        <S.GalleryInstruction
          $isVisible={instructionVisible}
          $isContentVisible={isTypingComplete}
          ref={instructionRef}
        >
          <S.InstructionText><span>SCROLL TO EXPLORE</span></S.InstructionText>
          <S.InstructionText><span>SELECT FRAME - LEARN MORE</span></S.InstructionText>
        </S.GalleryInstruction>

        {workProjects.map((project, index) => (
          <S.ProjectPresentation
            key={project.id}
            $index={index}
          >
            <S.ImageContainer data-cursor="View Project" onClick={() => handleProjectClick(project.id)}>
              <OptimizedImage src={project.image} alt={project.title} />
            </S.ImageContainer>
              <S.Caption>
                <S.Title>{project.title}</S.Title>
                <S.Description>{project.description}</S.Description>
              </S.Caption>
          </S.ProjectPresentation>
        ))}

      </S.Content>
      <Footer />
    </S.Page>
  );
}

export default Work;
