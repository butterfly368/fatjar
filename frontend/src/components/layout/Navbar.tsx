import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { WalletButton } from '../ui/WalletButton';
import { useWallet } from '../../hooks/useWallet';
import './Navbar.css';

export function Navbar() {
  const { connected } = useWallet();

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <Logo />
      </Link>
      <div className="nav-links">
        <Link className="nav-link" to="/jars">
          Explore
        </Link>
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
