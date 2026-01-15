import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Work.css';

// Asset hashes for Work page images
const assetHashes = {
  mari1: '92a9b6d93d1fa93805444e74c5ce731435fbd3a2',
  mari4: '2b82f9c749a60173f5347f19f52e7da344385dbe',
  mari5: '36791b84b72621de39fd424b554fd012b10b982e',
  mari6: 'eae66c416d784703bed49ad863cda27ff9e653d7',
  mari7: 'f1e2d3c4b5a6978877665544332211aabbccdde0'
};

const getAssetPath = (hash) => {
  if (import.meta.env.DEV) {
    return `/mcp-assets/${hash}.jpg`;
  }
  return `http://localhost:3845/assets/${hash}.jpg`;
};

const workProjects = [
  {
    id: 1,
    image: getAssetPath(assetHashes.mari6),
    title: 'PORTRAITS',
    description: 'COLLECTIONS: 8'
  },
  {
    id: 2,
    image: getAssetPath(assetHashes.mari7),
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
    description: 'COLLECTIONS: 2'
  }
];

function Work() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Footer animation states
  const footerRef = useRef(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [showContactBox, setShowContactBox] = useState(false);

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

  useEffect(() => {
    const fullText = "Here's some of my Work.";
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
          setTimeout(typeText, 80);
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
          setTimeout(typeText, 50);
        }
      }
    };

    typeText();
  }, []);

  // Intersection Observer for footer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !footerVisible) {
            setFooterVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, [footerVisible]);

  // Show contact box after heading is visible
  useEffect(() => {
    if (!footerVisible) return;
    setTimeout(() => setShowContactBox(true), 400);
  }, [footerVisible]);

  useEffect(() => {
  const reveals = document.querySelectorAll('.reveal-group');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.4 }
  );

  reveals.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}, []);


  return (
    <div className="work-page">
      <Header />
      <div className="work-title-frame">
        <h1 className="work-page-title">
          {displayText}
          {!isTypingComplete && <span className="cursor">|</span>}
        </h1>
      </div>
      <div className="work-content">
        {workProjects.map((project) => (
          <div key={project.id} className="work-project-presentation">
            <div className="work-image-container" onClick={() => handleProjectClick(project.id)}>
              <img src={project.image} alt={project.title} className="work-image" />
            </div>
              <div className="work-caption reveal-group">
                <p className="work-title reveal reveal-title">
                  <span>{project.title}</span>
                </p>
                <p className="work-description reveal reveal-description">
                  <span>{project.description}</span>
                </p>
              </div>
          </div>
        ))}

        <div className="work-contact-section" ref={footerRef}>
          <div className={`work-together ${footerVisible ? 'fade-in-up' : ''}`}>
            <h2 className="work-heading">
              <span className="semibold">Lets</span> <span className="script">work</span> <span className="semibold">together</span>
            </h2>
          </div>

          <div className={`contact-info ${showContactBox ? 'slide-up' : ''}`}>
            <span className="corner corner-tl"></span>
            <span className="corner corner-tr"></span>
            <span className="corner corner-bl"></span>
            <span className="corner corner-br"></span>

            <p className="contact-text">Contact:</p>
            <p className="contact-text">
              Mobile: <a href="tel:+15127756749" className="contact-link">+1 512.775.6749</a>
            </p>
            <p className="contact-text">
              <a href="mailto:mariannaparzick@gmail.com" className="contact-link">mariannaparzick@gmail.com</a>
            </p>
            <p className="contact-text">
              LinkedIn: <a href="https://www.linkedin.com/in/marianna-parzick/" target="_blank" rel="noopener noreferrer" className="contact-link contact-link-underline">marianna-parzick</a>
            </p>
            <p className="contact-text">
              Instagram: <a href="https://www.instagram.com/fla5hedbymari?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="contact-link">@fla5hedbymari</a>
            </p>
            <p className="contact-text">Reach Out!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Work;
