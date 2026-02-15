import { useState, useEffect } from 'react';
import * as S from '~/components/Title.styled';

function Title({ startAnimation = true }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Hi, I'm MariannaParzick.";
  const finalText = "MariannaParzick";

  useEffect(() => {
    if (!startAnimation) return;

    let currentIndex = 0;
    const typingSpeed = 60;
    const deleteSpeed = 30;
    const pauseBeforeDelete = 500;

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);

        setTimeout(() => {
          let currentText = fullText;
          const deleteInterval = setInterval(() => {
            if (currentText.length > 0) {
              currentText = currentText.slice(0, -1);
              setDisplayText(currentText);
            } else {
              clearInterval(deleteInterval);

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
    <S.Container data-node-id="35:19">
      <S.TitleText $isTyping={showCursor} data-node-id="1:4">
        {displayText}
      </S.TitleText>
    </S.Container>
  );
}

export default Title;
