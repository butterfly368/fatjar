import './WhySection.css';

export function WhySection() {
  return (
    <section className="why">
      <div className="why-header">
        <div className="section-label">[01] Why This Exists</div>
        <h2 className="why-title">
          People Already<br />
          Save Together.
        </h2>
      </div>

      <div className="why-blocks">
        {/* Block 1 — Proven Demand */}
        <div className="why-block">
          <div className="why-block-label">The Insight</div>
          <p className="why-block-lead">
            PayPal Money Pools &mdash; 86 million pooling events per year.
            MoneyFellows &mdash; 8.5 million users. Fintech proved people
            save together.
          </p>
          <p className="why-block-body">
            Ethereum saw it too &mdash; WeTrust, Bloinx, Pigzbe all built
            social savings on-chain. The demand was real. But none of them
            built on the chain that holds real wealth.
          </p>
          <p className="why-block-punch">
            $2 trillion sits in Bitcoin. Less than 0.5% is in DeFi.
            FatJar unlocks it.
          </p>
        </div>

        {/* Block 2 — Generational Wealth */}
        <div className="why-block">
          <div className="why-block-label">The Opportunity</div>
          <p className="why-block-stat">
            $6 trillion in crypto will be inherited by 2045.
          </p>
          <p className="why-block-body">
            Traditional savings lose value to inflation every year.
            A FatJar holds Bitcoin &mdash; and the time-lock can&rsquo;t be
            broken, not even by you. No platform can shut it down.
            No government can freeze it.
          </p>
        </div>

        {/* Block 3 — The Emma Story */}
        <div className="why-block why-block--story">
          <div className="why-block-label">The Story</div>
          <h3 className="why-story-name">Emma&rsquo;s College Fund</h3>
          <div className="why-story-meta">
            <span>Created 2024</span>
            <span className="why-story-dot" />
            <span>Unlocks 2044</span>
            <span className="why-story-dot" />
            <span>Beneficiary: Emma&rsquo;s wallet</span>
          </div>
          <p className="why-block-body">
            Her parents started it. Grandparents, aunts, uncles &mdash;
            everyone contributes Bitcoin over the years. The bonding curve
            rewards the earliest believers the most.
          </p>
          <p className="why-story-punch">
            Nobody can touch it early. Not even her parents.<br />
            When Emma turns 18, she opens her jar.
          </p>
        </div>
      </div>
    </section>
  );
}
