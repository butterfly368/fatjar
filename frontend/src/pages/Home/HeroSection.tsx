import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import './HeroSection.css';

export function HeroSection() {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-label">
            <span className="hero-dot" />
            Bitcoin L1 via OPNet
          </div>
          <h1 className="hero-h1">
            LOCK<br />
            BITCOIN<br />
            <span className="hero-h1-highlight">TOGETHER.</span>
          </h1>
          <p className="hero-tagline">
            Trustless vaults on Bitcoin L1. Set a goal,<br />
            set a time-lock. Early backers earn more $FJAR.<br />
            Zero platform fees.
          </p>
          <div className="hero-actions">
            <Button to="/create">
              Create a Vault <ArrowRight size={14} />
            </Button>
            <Button variant="secondary" to="/#active-vaults">
              Browse Vaults
            </Button>
          </div>
        </div>

        <div className="hero-right">
          <div className="piggy-wrap">
            <img
              className="piggy-img"
              src="/piggy-hero.png"
              alt="FatJar vault locking Bitcoin together"
            />
          </div>
        </div>
      </section>

      <div className="hero-divider">
        <hr />
      </div>
    </>
  );
}
