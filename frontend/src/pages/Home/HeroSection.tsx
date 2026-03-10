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
            THE PIGGY<br />
            BANK <span className="hero-h1-serif">for</span><br />
            <span className="hero-h1-highlight">BITCOIN.</span>
          </h1>
          <p className="hero-tagline">
            FatJar &mdash; social savings where everyone<br />
            fills the jar with sats.
          </p>
          <p className="hero-desc">
            Create a jar. Family and friends contribute BTC on Layer 1.
            Early contributors earn more $FJAR tokens through the bonding
            curve. Zero fees. 100% to the fund.
          </p>
          <div className="hero-actions">
            <Button to="/create">
              Create a Jar <ArrowRight size={14} />
            </Button>
            <Button variant="secondary" to="/#how">
              How it works
            </Button>
          </div>
        </div>

        <div className="hero-right">
          <div className="piggy-wrap">
            <img
              className="piggy-img"
              src="/piggy-hero.png"
              alt="FatJar piggy bank filling with Bitcoin"
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
