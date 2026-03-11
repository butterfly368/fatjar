import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { Input, TextArea } from '../../components/ui/Input';
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
  'open-collection': 'Collect BTC for anything. You withdraw when ready.',
  'trust-fund': 'Save for someone you love. The beneficiary withdraws.',
  'all-or-nothing': 'Set a goal. Hit it and you withdraw. Miss it, everyone gets refunded.',
  'funded-grant': 'Fund someone\u2019s dream. Goal met = beneficiary gets it. Missed = refunds.',
};

// Bitcoin averages ~10 min per block
const CURRENT_BLOCK = 890000;
const MINUTES_PER_BLOCK = 10;

function dateToBlock(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  const diffBlocks = Math.ceil(diffMs / (MINUTES_PER_BLOCK * 60 * 1000));
  return CURRENT_BLOCK + diffBlocks;
}

function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function CreateFund() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
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
      description: '',
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

  const estimatedBlock = dateToBlock(unlockDate);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (name.length > 64) errs.name = 'Max 64 characters';
    if (unlockDate && dateToBlock(unlockDate) <= CURRENT_BLOCK) errs.unlockDate = 'Must be a future date';
    if (hasGoal) {
      if (!goalAmount.trim()) errs.goalAmount = 'Goal amount is required when enabled';
      else if (parseFloat(goalAmount) <= 0) errs.goalAmount = 'Must be greater than 0';
    }
    if (hasBeneficiary) {
      if (!beneficiary.trim()) errs.beneficiary = 'Beneficiary address is required when enabled';
      else if (!beneficiary.startsWith('bc1') && !beneficiary.startsWith('opt1') && !beneficiary.startsWith('0x')) {
        errs.beneficiary = 'Address must start with bc1, opt1, or 0x';
      } else if (beneficiary.length < 20) {
        errs.beneficiary = 'Address looks too short — double-check it';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const block = BigInt(dateToBlock(unlockDate));
      const goal = hasGoal && goalAmount
        ? BigInt(Math.round(parseFloat(goalAmount) * 100_000_000))
        : 0n;
      const ben = hasBeneficiary && beneficiary ? beneficiary : ZERO_ADDRESS;

      const newId = await createVault(name, block, goal, ben, description);
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

        <TextArea
          label="Description"
          placeholder="What's this jar for? Help contributors understand the purpose."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          maxLength={200}
          rows={3}
        />

        <div className="create-fund-divider" />

        {/* Time-lock toggle */}
        <div className="create-fund-toggle-section">
          <div className="create-fund-toggle-row">
            <div className="create-fund-toggle-info">
              <div className="create-fund-toggle-label">Time-Lock</div>
              <div className="create-fund-toggle-hint">
                Lock the jar until a date. Without it, the creator can withdraw anytime.
              </div>
            </div>
            <button
              type="button"
              className={`toggle-switch${unlockDate ? ' toggle-switch-active' : ''}`}
              onClick={() => setUnlockDate(unlockDate ? '' : getMinDate())}
              aria-label="Toggle time-lock"
            >
              <span className="toggle-switch-knob" />
            </button>
          </div>
          {unlockDate && (
            <div className="create-fund-toggle-content">
              <Input
                label="Unlock Date"
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                error={errors.unlockDate}
                min={getMinDate()}
              />
              <div className="create-fund-helper">
                No one can withdraw before this date — not even you.
              </div>
              {estimatedBlock > 0 && (
                <div className="create-fund-helper create-fund-helper-block">
                  ≈ Bitcoin block #{estimatedBlock.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

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
                placeholder="opt1... or bc1..."
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                error={errors.beneficiary}
              />
              <div className="create-fund-helper create-fund-helper-warning">
                ⚠ Double-check this address. It cannot be changed after creation. A wrong address means the funds go to someone else permanently.
              </div>
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
          <div>Estimated creation fee: ~0.0001 BTC (gas)</div>
          <div className="create-fund-gas-note">Contributors also pay a small gas fee on each contribution.</div>
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
