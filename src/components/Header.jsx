import { useState } from 'react';
import './Header.css';

function Header() {
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttons = [
    { id: 'home', label: '01 home' },
    { id: 'work', label: '02 work' },
    { id: 'about', label: '03 about' },
    { id: 'contact', label: '04 Contact' }
  ];

  return (
    <header className="header" data-name="Header" data-node-id="1:18">
      {buttons.map((button) => (
        <button
          key={button.id}
          className={`header-button ${hoveredButton === button.id ? 'hovered' : ''} ${button.id === 'home' ? 'active' : ''}`}
          onMouseEnter={() => setHoveredButton(button.id)}
          onMouseLeave={() => setHoveredButton(null)}
          data-name="Button"
        >
          <p>{button.label}</p>
        </button>
      ))}
    </header>
  );
}

export default Header;

