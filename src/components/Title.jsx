import { useState, useEffect } from 'react';
import '~/components/Title.css';

function Title({ startAnimation = true }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Hi, I'm MariannaParzick.";
  const finalText = "MariannaParzick";

  useEffect(() => {
    // Don't start animation until told to
    if (!startAnimation) return;

    let currentIndex = 0;
    const typingSpeed = 60; // ms per character
    const deleteSpeed = 30; // ms per character when deleting
    const pauseBeforeDelete = 500; // pause after typing completes

    // Phase 1: Type full text with period
    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);

        // Phase 2: Pause, then delete everything
        setTimeout(() => {
          let currentText = fullText;
          const deleteInterval = setInterval(() => {
            if (currentText.length > 0) {
              currentText = currentText.slice(0, -1);
              setDisplayText(currentText);
            } else {
              clearInterval(deleteInterval);

              // Phase 3: Type out final text
              setTimeout(() => {
                let finalIndex = 0;
                const finalTypeInterval = setInterval(() => {
                  if (finalIndex < finalText.length) {
                    setDisplayText(finalText.slice(0, finalIndex + 1));
                    finalIndex++;
                  } else {
                    clearInterval(finalTypeInterval);
                    setShowCursor(false);
                  }
                }, typingSpeed);
              }, 200);
            }
          }, deleteSpeed);
        }, pauseBeforeDelete);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [startAnimation]);

  return (
    <div className="title-container" data-node-id="35:19">
      <h1 className={`title ${showCursor ? 'typing' : ''}`} data-node-id="1:4">
        {displayText}
      </h1>
    </div>
  );
}

export default Title;

