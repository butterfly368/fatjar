import './WhySection.css';

export function WhySection() {
  return (
    <section className="why">
      <div className="why-header">
        <div className="section-label">[01] Why This Exists</div>
        <h2 className="why-title">
          People Already<br />
          Pool Money.
        </h2>
      </div>

      <div className="why-blocks">
        {/* Block 1 — Proven Demand */}
        <div className="why-block">
          <div className="why-block-label">The Insight</div>
          <p className="why-block-lead">
            Americans pool money 86 million times a year &mdash; for group
            gifts, travel, shared goals (PayPal, 2024). 11 million South
            Africans save through stokvels. 8.5 million Egyptians use
            MoneyFellows. US families hold $525 billion in college funds
            for their children.
          </p>
          <p className="why-block-body">
            Savings circles. Group goals. Children&rsquo;s futures. The
            instinct to pool money is older than banks. PoolTogether proved
            it works on-chain &mdash; 88,000 wallets, $17.8M deposited.
            But it runs on Ethereum. Nobody built where real wealth sits.
          </p>
          <p className="why-block-punch">
            $1.4 trillion sits in Bitcoin. Less than 1% touches DeFi.
            FatJar opens the door.
          </p>
        </div>

        {/* Block 2 — Generational Wealth */}
        <div className="why-block">
          <div className="why-block-label">The Opportunity</div>
          <p className="why-block-stat">
            VanEck estimates $6 trillion in crypto will change hands by 2045.
          </p>
          <p className="why-block-body">
            Traditional savings lose value to inflation every year.
            A FatJar holds Bitcoin &mdash; and the time-lock can&rsquo;t be
            broken, not even by you. No platform can shut it down.
            No middleman can freeze it.
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
