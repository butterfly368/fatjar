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
            The Piggy Bank<br />
            For Everyone<br />
            <span className="hero-h1-highlight">On Bitcoin.</span>
          </h1>
          <p className="hero-tagline">
            Create a jar. Share the link. Friends and family<br />
            chip in with BTC. You all earn $FJAR tokens<br />
            along the way.
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
              alt="FatJar — the group piggy bank on Bitcoin"
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
