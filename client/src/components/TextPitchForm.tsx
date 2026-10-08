import { useState, ChangeEvent } from 'react';
import { FileText, Rocket, Info } from 'lucide-react';

interface Props {
  onSubmit: (data: { pitchText: string; companyName: string; askAmount: number; equityOffered: number }) => void;
  isSubmitting: boolean;
}

export default function TextPitchForm({ onSubmit, isSubmitting }: Props) {
  const [pitchText, setPitchText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [askAmount, setAskAmount] = useState(500000);
  const [equityOffered, setEquityOffered] = useState(10);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) errs['companyName'] = 'Required';
    if (pitchText.trim().length < 100) errs['pitchText'] = 'Please provide at least 100 characters';
    if (askAmount <= 0) errs['askAmount'] = 'Must be positive';
    if (equityOffered <= 0 || equityOffered >= 100) errs['equity'] = 'Must be between 0–100%';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ pitchText, companyName, askAmount, equityOffered });
  }


  const valuation = equityOffered > 0 ? (askAmount / (equityOffered / 100)).toLocaleString() : '—';

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
        <Info className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-zinc-400 leading-relaxed">
          Paste your full pitch deck text, business plan, or a detailed description of your startup.
          The sharks will extract key details and evaluate your pitch end-to-end.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-1">
          <label className="label-text" htmlFor="txt-company">
            Company Name <span className="text-sky-400">*</span>
          </label>
          <input id="txt-company" className="input-field" placeholder="Acme AI" value={companyName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { 
              setCompanyName(e.target.value); 
              if (errors['companyName']) setErrors((er) => ({ ...er, companyName: '' })); 
            }} />
          {errors['companyName'] && <p className="text-xs text-red-400 mt-1">{errors['companyName']}</p>}
        </div>
        <div>
          <label className="label-text" htmlFor="txt-ask">
            Ask Amount ($) <span className="text-sky-400">*</span>
          </label>
          <input id="txt-ask" type="number" className="input-field" placeholder="500000" value={askAmount || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAskAmount(parseFloat(e.target.value) || 0)} />
          {errors['askAmount'] && <p className="text-xs text-red-400 mt-1">{errors['askAmount']}</p>}
        </div>
        <div>
          <label className="label-text" htmlFor="txt-equity">
            Equity Offered (%) <span className="text-sky-400">*</span>
          </label>
          <input id="txt-equity" type="number" className="input-field" placeholder="10" value={equityOffered || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEquityOffered(parseFloat(e.target.value) || 0)} />
          {errors['equity'] && <p className="text-xs text-red-400 mt-1">{errors['equity']}</p>}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
        Implied valuation: <strong className="text-sky-400">${valuation}</strong>
      </div>

      <div>
        <label className="label-text flex items-center gap-2" htmlFor="txt-pitch">
          <FileText className="w-3.5 h-3.5" />
          Pitch Text / Business Plan <span className="text-sky-400">*</span>
        </label>
        <textarea
          id="txt-pitch"
          rows={16}
          className="input-field resize-y font-mono text-xs leading-relaxed"
          placeholder={`Paste your full pitch here. Include:
- What problem you're solving
- Your target market and size  
- Your product/solution
- Traction metrics (revenue, users, growth)
- Business model (how you make money)
- Unit economics (CAC, LTV, margins if known)
- Competition and your moat
- Team background
- Financial projections
- Use of funds
- Exit strategy`}
          value={pitchText}
          onChange={(e) => {
            setPitchText(e.target.value);
            if (errors['pitchText']) setErrors((er) => ({ ...er, pitchText: '' }));
          }}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors['pitchText'] ? (
            <p className="text-xs text-red-400">{errors['pitchText']}</p>
          ) : (
            <p className="text-xs text-zinc-600">{pitchText.length} characters</p>
          )}
          <p className="text-xs text-zinc-600">Minimum 100 chars</p>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-zinc-800/60">
        <button id="text-submit-btn" onClick={handleSubmit} disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400
            text-white font-semibold text-sm transition-all disabled:opacity-50">
          <Rocket className="w-4 h-4" />
          Face the Sharks
        </button>
      </div>
    </div>
  );
}
