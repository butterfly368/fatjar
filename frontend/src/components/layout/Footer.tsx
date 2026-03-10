import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-brand">
          Fat<span className="footer-brand-accent">Jar.</span>
        </div>
        <p className="footer-tagline">The piggy bank for everyone on Bitcoin.</p>
        <p className="footer-built">
          Built for{' '}
          <a href="https://vibecode.finance" target="_blank" rel="noopener noreferrer">
            vibecode.finance
          </a>{' '}
          Week 3 &middot; OPNet &middot; Bitcoin L1
        </p>
      </div>
      <div className="footer-links">
        <a className="footer-link" href="https://github.com" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="footer-link" href="https://opnet.org" target="_blank" rel="noopener noreferrer">
          OPNet
        </a>
        <a className="footer-link" href="https://x.com" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
      </div>
    </footer>
  );
}
