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
            A Piggy Bank<br />
            That Grows<br />
            <span className="hero-h1-highlight">With Your Child.</span>
          </h1>
          <p className="hero-tagline">
            Lock Bitcoin until they're ready. Family and friends contribute<br />
            along the way. Nobody can touch it early — not even you.
          </p>
          <div className="hero-actions">
            <Button to="/create">
              Create a Jar <ArrowRight size={14} />
            </Button>
            <Button variant="secondary" to="/#active-jars">
              See Active Jars
            </Button>
          </div>
        </div>

        <div className="hero-right">
          <div className="piggy-wrap">
            <img
              className="piggy-img"
              src="/piggy-hero.png"
              alt="FatJar — trustless Bitcoin savings jars"
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
