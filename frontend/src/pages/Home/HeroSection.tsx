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
            Savings Jars on Bitcoin
          </div>
          <h1 className="hero-h1">
            Every Reason<br />
            to Save<br />
            <span className="hero-h1-highlight">Together.</span>
          </h1>
          <p className="hero-tagline">
            People have pooled money together for centuries —<br />
            for family, friends, and community.
          </p>
          <p className="hero-desc">
            FatJar is the first time it's trustless.<br />
            No platform can shut this down.
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
