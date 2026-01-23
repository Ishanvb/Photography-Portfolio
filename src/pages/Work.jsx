import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import '~/pages/Work.css';

// Animated category label with downward scrolling letters on hover
const AnimatedCategoryLabel = ({ text }) => {
  return (
    <span className="animated-category">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="category-letter"
          style={{ transitionDelay: `${i * 35}ms` }}
        >
          <span className="category-letter-stack">
            <span>{char === " " ? "\u00A0" : char}</span>
            <span>{char === " " ? "\u00A0" : char}</span>
          </span>
        </span>
      ))}
    </span>
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
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Store initial mobile state for typing text (doesn't change on resize)
  const initialMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth <= 768);

  // Category dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownReady, setDropdownReady] = useState(false);

  // Instruction bar reveal state
  const instructionRef = useRef(null);
  const [instructionVisible, setInstructionVisible] = useState(false);

  // Project section refs for scrolling
  const projectRefs = useRef({});

  // Detect mobile on resize (for clickable area behavior)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Scroll to project section when category is clicked
  const handleCategoryClick = (projectId) => {
    const projectElement = projectRefs.current[projectId];
    if (projectElement) {
      if (isMobile) {
        // On mobile, center the project image in the viewport
        const imageContainer = projectElement.querySelector('.work-image-container');
        const targetElement = imageContainer || projectElement;

        const rect = targetElement.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementCenter = elementTop + (rect.height / 2);
        const viewportCenter = window.innerHeight / 2;
        // Subtract offset to scroll less (center image higher on screen)
        const scrollTo = elementCenter - viewportCenter - 250;

        window.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      } else {
        // On desktop, align to top
        projectElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setDropdownOpen(false);
    }
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
    <div className="work-page">
      <Header />
      <div className="work-header-row">
        <div className={`work-category-dropdown ${dropdownOpen ? 'open' : ''} ${isTypingComplete ? 'visible' : ''}`}>
          {/* Projects title with arrow on right - entire frame clickable on mobile */}
          <div
            className="work-category-item"
            onClick={isMobile ? toggleDropdown : undefined}
          >
            <p className="work-category-text">Projects</p>
            <div
              className={`work-category-arrow ${dropdownOpen ? 'open' : ''}`}
              onClick={!isMobile ? toggleDropdown : undefined}
              {...(dropdownReady && !isMobile && { 'data-cursor-magnet': true })}
            />
          </div>

          {/* Line under title */}
          <div className="work-category-line" />

          {/* Dropdown items P1-P6 */}
          <div className="work-category-dropdown-items">
            {workProjects.map((project, index) => (
              <div
                key={project.id}
                className="work-category-dropdown-item"
                onClick={() => handleCategoryClick(project.id)}
              >
                <p className="work-category-text">
                  <AnimatedCategoryLabel text={formatTitle(project.title, index)} />
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="work-title-frame">
          <h1 className="work-page-title">
            {displayText}
            {!isTypingComplete && <span className="cursor">|</span>}
          </h1>
        </div>
      </div>
      <div className={`work-content ${isTypingComplete ? 'visible' : ''}`}>
        {/* Instruction bar above gallery */}
        <div
          className={`work-gallery-instruction ${instructionVisible ? 'is-visible' : ''}`}
          ref={instructionRef}
        >
          <span className="work-instruction-text"><span>SCROLL TO EXPLORE</span></span>
          <span className="work-instruction-text"><span>SELECT FRAME - LEARN MORE</span></span>
        </div>

        {workProjects.map((project) => (
          <div
            key={project.id}
            className="work-project-presentation"
            ref={(el) => (projectRefs.current[project.id] = el)}
          >
            <div className="work-image-container" data-cursor="View Project" onClick={() => handleProjectClick(project.id)}>
              <OptimizedImage src={project.image} alt={project.title} className="work-image" />
            </div>
              <div className="work-caption">
                <p className="work-title">{project.title}</p>
                <p className="work-description">{project.description}</p>
              </div>
          </div>
        ))}

      </div>
      <Footer />
    </div>
  );
}

export default Work;
