import { Link } from 'react-router-dom';
import Header from '~/components/Header';
import '~/pages/NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <Header />
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <p className="not-found-message">Page not found</p>
        <Link to="/" className="not-found-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
