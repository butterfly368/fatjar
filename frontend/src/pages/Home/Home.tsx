import { HeroSection } from './HeroSection';
import { StatsStrip } from './StatsStrip';
import { HowItWorks } from './HowItWorks';
import { FeaturesSection } from './FeaturesSection';
import { ActiveJars } from './ActiveJars';
import { BondingCurveSection } from './BondingCurveSection';
import { RoadmapSection } from './RoadmapSection';

export function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <ActiveJars />
      <HowItWorks />
      <FeaturesSection />
      <BondingCurveSection />
      <RoadmapSection />
    </>
  );
}
