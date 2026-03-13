import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { getResolvedMode } from '../../services/contract';
import { hasOPWallet } from '../../hooks/useWallet';
import './LiveBanner.css';

export function Layout() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    getResolvedMode().then((mode) => {
      if (mode === 'live') {
        setShowBanner(true);
        setHasWallet(hasOPWallet());
      } else {
        setShowBanner(false);
      }
    });
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {showBanner && (
          <div className="live-banner">
            <span className="live-banner-dot" />
            <span>
              <strong>Live mode</strong> — connected to OPNet testnet.
              {!hasWallet && ' Install the OPWallet extension to create jars and contribute.'}
              {hasWallet && ' Transactions require testnet BTC for gas.'}
            </span>
            <button className="live-banner-close" onClick={() => setShowBanner(false)}>
              &times;
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
