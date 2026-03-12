import { HeroSection } from './HeroSection';
import { StatsStrip } from './StatsStrip';
import { ActiveJars } from './ActiveJars';
import { WhySection } from './WhySection';
import { HowItWorks } from './HowItWorks';
import { FeaturesSection } from './FeaturesSection';
import { BondingCurveSection } from './BondingCurveSection';
import { RoadmapSection } from './RoadmapSection';

export function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <ActiveJars />
      <WhySection />
      <HowItWorks />
      <FeaturesSection />
      <BondingCurveSection />
      <RoadmapSection />
    </>
  );
}
