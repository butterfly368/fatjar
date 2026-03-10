import { HeroSection } from './HeroSection';
import { StatsStrip } from './StatsStrip';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorks } from './HowItWorks';
import { BondingCurveSection } from './BondingCurveSection';
import { ActiveJars } from './ActiveJars';

export function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <ActiveJars />
      <FeaturesSection />
      <HowItWorks />
      <BondingCurveSection />
    </>
  );
}
