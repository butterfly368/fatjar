import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { WalletButton } from '../ui/WalletButton';
import { useWallet } from '../../hooks/useWallet';
import './Navbar.css';

export function Navbar() {
  const { connected } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToJars = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('active-jars')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('active-jars')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <Logo />
      </Link>
      <div className="nav-links">
        <a className="nav-link" href="#active-jars" onClick={scrollToJars}>
          Active Jars
        </a>
        {connected && (
          <Link className="nav-link" to="/dashboard">
            My Jars
          </Link>
        )}
        {connected && (
          <Link className="nav-link" to="/create">
            Create a Jar
          </Link>
        )}
        <a className="nav-link" href="https://github.com" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <WalletButton />
      </div>
    </nav>
  );
}
