import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { WalletButton } from '../ui/WalletButton';
import { useWallet } from '../../hooks/useWallet';
import { getResolvedMode, switchMode } from '../../services/contract';
import './Navbar.css';

export function Navbar() {
  const { connected } = useWallet();
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getResolvedMode().then(setMode).catch(() => setMode('mock'));
  }, []);

  function handleToggle() {
    if (!mode) return;
    switchMode(mode === 'live' ? 'mock' : 'live');
  }

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        <Logo />
      </Link>
      <button
        className={`nav-hamburger${menuOpen ? ' nav-hamburger--open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
        <Link className="nav-link" to="/jars" onClick={() => setMenuOpen(false)}>
          Active Jars
        </Link>
        {connected && (
          <Link className="nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
        )}
        {connected && (
          <Link className="nav-link" to="/create" onClick={() => setMenuOpen(false)}>
            Create a Jar
          </Link>
        )}
        <a className="nav-link" href="https://github.com/butterfly368/fatjar" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {mode && (
          <button
            className={`nav-mode-toggle nav-mode-toggle--${mode}`}
            onClick={handleToggle}
            title={mode === 'live' ? 'Switch to Demo mode' : 'Switch to Live (testnet) mode'}
          >
            {mode === 'live' ? 'LIVE' : 'DEMO'}
          </button>
        )}
        <WalletButton />
      </div>
    </nav>
  );
}
