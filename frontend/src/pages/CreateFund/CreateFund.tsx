import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, ArrowRight, Globe, Lock } from 'lucide-react';
import { Input, TextArea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { createFund } from '../../services/contracts';
import './CreateFund.css';

export function CreateFund() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<number | null>(null);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (name.length > 64) errs.name = 'Max 64 characters';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const unlockTimestamp = unlockDate ? Math.floor(new Date(unlockDate).getTime() / 1000) : 0;
    const fundId = await createFund(name, unlockTimestamp);
    setCreated(fundId);
    setSubmitting(false);
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
            Your jar "{name}" has been created. Share the link with friends and family to start collecting contributions.
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
          Start Your<br />Piggy Bank
        </h1>
      </div>

      <form className="create-fund-form" onSubmit={handleSubmit}>
        <Input
          label="Jar Name"
          placeholder="e.g. College Fund for Maya"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={64}
        />

        <TextArea
          label="Description"
          placeholder="What is this jar for? Tell contributors why they should chip in."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <div className="create-fund-divider" />

        <Input
          label="Unlock Date (Optional)"
          type="date"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
        />

        <div className="create-fund-divider" />

        <div className="create-fund-visibility">
          <div className="create-fund-visibility-label">Visibility</div>
          <div className="create-fund-visibility-options">
            <button
              type="button"
              className={`visibility-option${isPublic ? ' visibility-option-active' : ''}`}
              onClick={() => setIsPublic(true)}
            >
              <Globe size={14} />
              <span>Public</span>
            </button>
            <button
              type="button"
              className={`visibility-option${!isPublic ? ' visibility-option-active' : ''}`}
              onClick={() => setIsPublic(false)}
            >
              <Lock size={14} />
              <span>Private</span>
            </button>
          </div>
          <div className="create-fund-visibility-hint">
            {isPublic
              ? 'Visible on the homepage. Anyone can discover and contribute.'
              : 'Only people with the link can find and contribute to this jar.'}
          </div>
        </div>

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
