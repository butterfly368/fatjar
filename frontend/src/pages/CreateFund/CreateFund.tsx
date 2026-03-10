import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { createVault } from '../../services/contract';
import {
  ZERO_ADDRESS,
  getVaultMode,
  getVaultModeLabel,
  type Vault,
  type VaultMode,
} from '../../types';
import './CreateFund.css';

const MODE_DESCRIPTIONS: Record<VaultMode, string> = {
  'open-collection': 'Collect money for anything. You withdraw when the jar unlocks.',
  'trust-fund': 'Save for someone you love. The beneficiary opens the jar when the time comes.',
  'all-or-nothing': 'Set a goal. If it\u2019s met, you withdraw. If not, everyone gets their BTC back.',
  'funded-grant': 'Fund someone\u2019s dream. If the goal is met, the beneficiary gets it. If not, refunds.',
};

// Rough estimate: ~10 min per block
function estimateDate(blocks: number): string {
  if (!blocks || blocks <= 0) return '';
  const currentBlock = 890000;
  const blocksUntil = blocks - currentBlock;
  if (blocksUntil <= 0) return 'Already passed';
  const ms = blocksUntil * 10 * 60 * 1000;
  const date = new Date(Date.now() + ms);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function CreateFund() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [unlockBlock, setUnlockBlock] = useState('');
  const [hasGoal, setHasGoal] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');
  const [hasBeneficiary, setHasBeneficiary] = useState(false);
  const [beneficiary, setBeneficiary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  // Build a temporary Vault-like object to determine the mode
  const currentMode = useMemo(() => {
    const tempVault: Vault = {
      id: '0',
      name: name || 'Preview',
      creator: '',
      totalRaised: 0n,
      unlockBlock: 0n,
      isClosed: false,
      withdrawn: 0n,
      contributorCount: 0,
      goalAmount: hasGoal && goalAmount ? BigInt(Math.round(parseFloat(goalAmount) * 100_000_000)) : 0n,
      beneficiary: hasBeneficiary && beneficiary ? beneficiary : ZERO_ADDRESS,
    };
    return getVaultMode(tempVault);
  }, [name, hasGoal, goalAmount, hasBeneficiary, beneficiary]);

  const modeLabel = getVaultModeLabel(currentMode);
  const modeDescription = MODE_DESCRIPTIONS[currentMode];

  const blockEstimate = estimateDate(parseInt(unlockBlock, 10));

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (name.length > 64) errs.name = 'Max 64 characters';
    if (!unlockBlock.trim()) errs.unlockBlock = 'Unlock block is required';
    else if (parseInt(unlockBlock, 10) <= 0) errs.unlockBlock = 'Must be a positive block number';
    if (hasGoal) {
      if (!goalAmount.trim()) errs.goalAmount = 'Goal amount is required when enabled';
      else if (parseFloat(goalAmount) <= 0) errs.goalAmount = 'Must be greater than 0';
    }
    if (hasBeneficiary) {
      if (!beneficiary.trim()) errs.beneficiary = 'Beneficiary address is required when enabled';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const block = BigInt(unlockBlock);
      const goal = hasGoal && goalAmount
        ? BigInt(Math.round(parseFloat(goalAmount) * 100_000_000))
        : 0n;
      const ben = hasBeneficiary && beneficiary ? beneficiary : ZERO_ADDRESS;

      const newId = await createVault(name, block, goal, ben);
      setCreated(newId);
      navigate(`/fund/${newId}`);
    } catch {
      setErrors({ submit: 'Failed to create jar. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="create-fund">
        <div className="create-fund-success">
          <div className="create-fund-success-title">
            <PiggyBank size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Jar Created
          </div>
          <p className="create-fund-success-desc">
            Your jar "{name}" has been created. Share the link with your people to start collecting.
          </p>
          <Button to={`/fund/${created}`}>
            View Your Jar <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-fund">
      <div className="create-fund-header">
        <div className="create-fund-label">Create a Jar</div>
        <h1 className="create-fund-title">
          Start Your<br />FatJar
        </h1>
      </div>

      <form className="create-fund-form" onSubmit={handleSubmit}>
        <Input
          label="Jar Name"
          placeholder="e.g. Sarah's College Fund"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={64}
        />

        <div className="input-group">
          <Input
            label="Unlock Block"
            type="number"
            placeholder="e.g. 900000"
            value={unlockBlock}
            onChange={(e) => setUnlockBlock(e.target.value)}
            error={errors.unlockBlock}
            min={1}
          />
          {blockEstimate && (
            <div className="create-fund-helper">
              Estimated unlock: ~{blockEstimate}
            </div>
          )}
        </div>

        <div className="create-fund-divider" />

        {/* Goal Amount toggle */}
        <div className="create-fund-toggle-section">
          <div className="create-fund-toggle-row">
            <div className="create-fund-toggle-info">
              <div className="create-fund-toggle-label">Goal Amount</div>
              <div className="create-fund-toggle-hint">
                Set a BTC goal. Without a goal, any amount raised counts as success.
              </div>
            </div>
            <button
              type="button"
              className={`toggle-switch${hasGoal ? ' toggle-switch-active' : ''}`}
              onClick={() => setHasGoal(!hasGoal)}
              aria-label="Toggle goal amount"
            >
              <span className="toggle-switch-knob" />
            </button>
          </div>
          {hasGoal && (
            <div className="create-fund-toggle-content">
              <Input
                label="Goal (BTC)"
                type="number"
                placeholder="e.g. 0.5"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                error={errors.goalAmount}
                min={0}
                step="0.00000001"
              />
            </div>
          )}
        </div>

        {/* Beneficiary toggle */}
        <div className="create-fund-toggle-section">
          <div className="create-fund-toggle-row">
            <div className="create-fund-toggle-info">
              <div className="create-fund-toggle-label">Beneficiary Address</div>
              <div className="create-fund-toggle-hint">
                Designate a recipient. Without one, you (the creator) withdraw.
              </div>
            </div>
            <button
              type="button"
              className={`toggle-switch${hasBeneficiary ? ' toggle-switch-active' : ''}`}
              onClick={() => setHasBeneficiary(!hasBeneficiary)}
              aria-label="Toggle beneficiary"
            >
              <span className="toggle-switch-knob" />
            </button>
          </div>
          {hasBeneficiary && (
            <div className="create-fund-toggle-content">
              <Input
                label="Beneficiary Address"
                placeholder="bc1q..."
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                error={errors.beneficiary}
              />
            </div>
          )}
        </div>

        <div className="create-fund-divider" />

        {/* Mode preview card */}
        <div className="create-fund-mode-card">
          <div className="create-fund-mode-label">Mode</div>
          <div className="create-fund-mode-name">{modeLabel}</div>
          <div className="create-fund-mode-desc">{modeDescription}</div>
        </div>

        {/* Gas estimate */}
        <div className="create-fund-gas">
          Estimated gas: ~0.0001 BTC
        </div>

        {errors.submit && (
          <div className="create-fund-error">{errors.submit}</div>
        )}

        <div className="create-fund-actions">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Jar'} <ArrowRight size={14} />
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
