import { useState, ChangeEvent } from 'react';
import { PitchFormData } from '../types/index';
import { INDUSTRY_OPTIONS, STAGE_OPTIONS } from '../types/constants';
import { ChevronRight, ChevronLeft, Rocket, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onSubmit: (data: PitchFormData) => void;
  isSubmitting: boolean;
}

const INITIAL: PitchFormData = {
  companyName: '', tagline: '', industry: '', stage: 'mvp',
  askAmount: 500000, equityOffered: 10, impliedValuation: 5000000,
  problem: '', marketSize: '', solution: '', traction: '', businessModel: '',
  unitEconomics: { cac: null, ltv: null, margin: null, burnRate: null, runway: null, mrr: null },
  competition: '', moat: '',
  team: { founderNames: '', background: '', relevantExperience: '', teamSize: null },
  scalability: '',
  financials: { revenue: null, revenueGrowth: '', currentValuation: null, previousFunding: null, useOfFunds: '' },
  exitPotential: '',
};

const STEPS = ['Basics', 'The Pitch', 'Economics', 'Team & Exit'];

function Field({ label, id, error, required, hint, children }: {
  label: string; id: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-text flex items-center gap-1">
        {label}
        {required && <span className="text-sky-400">*</span>}
        {hint && <span className="text-zinc-600 normal-case font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function StructuredPitchForm({ onSubmit, isSubmitting }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PitchFormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof PitchFormData>(key: K, value: PitchFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function setNested<K extends 'unitEconomics' | 'team' | 'financials'>(
    parent: K, key: string, value: unknown,
  ) {
    setData((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
  }

  function numOrNull(val: string): number | null {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!data.companyName.trim()) errs['companyName'] = 'Required';
      if (!data.tagline.trim()) errs['tagline'] = 'Required';
      if (!data.industry) errs['industry'] = 'Required';
      if (data.askAmount <= 0) errs['askAmount'] = 'Must be positive';
      if (data.equityOffered <= 0 || data.equityOffered >= 100) errs['equityOffered'] = '0–100%';
    }
    if (step === 1) {
      if (data.problem.trim().length < 20) errs['problem'] = 'Describe the problem in detail';
      if (data.marketSize.trim().length < 20) errs['marketSize'] = 'Describe the market size';
      if (data.solution.trim().length < 20) errs['solution'] = 'Describe your solution';
      if (!data.businessModel.trim()) errs['businessModel'] = 'Required';
    }
    if (step === 2) {
      if (!data.competition.trim()) errs['competition'] = 'Required';
      if (!data.moat.trim()) errs['moat'] = 'Required';
    }
    if (step === 3) {
      if (!data.team.founderNames.trim()) errs['founderNames'] = 'Required';
      if (data.team.background.trim().length < 10) errs['background'] = 'Please elaborate';
      if (!data.exitPotential.trim()) errs['exitPotential'] = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step === STEPS.length - 1) {
      const valuation = data.askAmount / (data.equityOffered / 100);
      onSubmit({ ...data, impliedValuation: valuation });
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="glass-card p-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
              i === step ? 'bg-sky-500 text-white' : i < step ? 'bg-sky-500/30 text-sky-400' : 'bg-zinc-800 text-zinc-600',
            )}>{i + 1}</div>
            <span className={clsx('text-xs hidden sm:block', i === step ? 'text-zinc-200' : 'text-zinc-600')}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
          </div>
        ))}
      </div>

      {/* Step 0 — Basics */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Company Name" id="companyName" error={errors['companyName']} required>
              <input id="companyName" className="input-field" placeholder="e.g. Acme AI" value={data.companyName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('companyName', e.target.value)} />
            </Field>
            <Field label="One-line Tagline" id="tagline" error={errors['tagline']} required>
              <input id="tagline" className="input-field" placeholder="What you do in 10 words" value={data.tagline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('tagline', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Industry" id="industry" error={errors['industry']} required>
              <select id="industry" className="input-field" value={data.industry}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => set('industry', e.target.value)}>
                <option value="">Select industry...</option>
                {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </Field>
            <Field label="Company Stage" id="stage" required>
              <select id="stage" className="input-field" value={data.stage}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => set('stage', e.target.value as PitchFormData['stage'])}>
                {STAGE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Ask Amount ($)" id="askAmount" error={errors['askAmount']} required>
              <input id="askAmount" type="number" className="input-field" placeholder="500000" value={data.askAmount || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('askAmount', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Equity Offered (%)" id="equityOffered" error={errors['equityOffered']} required>
              <input id="equityOffered" type="number" className="input-field" placeholder="10" value={data.equityOffered || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('equityOffered', parseFloat(e.target.value) || 0)} />
            </Field>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-xs text-zinc-400">
              Implied valuation:{' '}
              <strong className="text-sky-400">
                ${data.equityOffered > 0 ? (data.askAmount / (data.equityOffered / 100)).toLocaleString() : '—'}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Step 1 — The Pitch */}
      {step === 1 && (
        <div className="space-y-5">
          <Field label="The Problem 🎯" id="problem" error={errors['problem']} required hint="Pain severity">
            <textarea id="problem" rows={3} className="input-field resize-none" 
              placeholder="What specific pain are you solving? Who feels it and how badly?"
              value={data.problem} onChange={(e) => set('problem', e.target.value)} />
          </Field>
          <Field label="Market Size 📈" id="marketSize" error={errors['marketSize']} required hint="TAM, SAM, SOM">
            <textarea id="marketSize" rows={2} className="input-field resize-none" placeholder="TAM: $XB, SAM: $XM. Growth rate X% CAGR. Source: ..."
              value={data.marketSize} onChange={(e) => set('marketSize', e.target.value)} />
          </Field>
          <Field label="Product / Solution 💡" id="solution" error={errors['solution']} required hint="Differentiation">
            <textarea id="solution" rows={3} className="input-field resize-none" 
              placeholder="What makes your product uniquely valuable? How does it scale?"
              value={data.solution} onChange={(e) => set('solution', e.target.value)} />
          </Field>
          <Field label="Traction 🚀" id="traction" hint="Revenue, users, growth rate">
            <textarea id="traction" rows={2} className="input-field resize-none" placeholder="1,000 paying users, $50K MRR, 15% MoM growth..."
              value={data.traction} onChange={(e) => set('traction', e.target.value)} />
          </Field>
          <Field label="Business Model 💰" id="businessModel" error={errors['businessModel']} required hint="How you make money">
            <textarea id="businessModel" rows={2} className="input-field resize-none" 
              placeholder="SaaS, $X/user/month. Enterprise: $X/seat. Marketplace: X% take rate..."
              value={data.businessModel} onChange={(e) => set('businessModel', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 2 — Economics */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
            <div className="text-xs text-amber-400 font-semibold mb-1">🦅 Vikram's territory</div>
            <div className="text-xs text-zinc-500">Fill in what you know. Leave unknown fields blank.</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'cac', label: 'CAC ($)', ph: '25' },
              { key: 'ltv', label: 'LTV ($)', ph: '150' },
              { key: 'margin', label: 'Gross Margin (%)', ph: '65' },
              { key: 'burnRate', label: 'Burn Rate ($/mo)', ph: '80000' },
              { key: 'runway', label: 'Runway (months)', ph: '18' },
              { key: 'mrr', label: 'MRR ($)', ph: '50000' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="label-text">{label}</label>
                <input type="number" className="input-field" placeholder={ph}
                  value={data.unitEconomics[key as keyof typeof data.unitEconomics] ?? ''}
                  onChange={(e) => setNested('unitEconomics', key, numOrNull(e.target.value))} />
              </div>
            ))}
          </div>
          <div className="section-divider" />
          <Field label="Competition ⚔️" id="competition" error={errors['competition']} required hint="Who else is in this space?">
            <textarea id="competition" rows={2} className="input-field resize-none" 
              placeholder="Competitor A ($XM raised), Competitor B (public). Our edge: ..."
              value={data.competition} onChange={(e) => set('competition', e.target.value)} />
          </Field>
          <Field label="Competitive Moat 🛡️" id="moat" error={errors['moat']} required hint="Why can't Google do this?">
            <textarea id="moat" rows={2} className="input-field resize-none" 
              placeholder="Network effects, proprietary data, 3-year IP, distribution lock-in..."
              value={data.moat} onChange={(e) => set('moat', e.target.value)} />
          </Field>
          <Field label="Scalability 🌍" id="scalability" hint="Cost efficiency at scale">
            <textarea id="scalability" rows={2} className="input-field resize-none" 
              placeholder="Infrastructure costs drop X% as volume doubles. Enters LATAM..."
              value={data.scalability} onChange={(e) => set('scalability', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 3 — Team & Exit */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Founder Name(s) 👥" id="founderNames" error={errors['founderNames']} required>
              <input id="founderNames" className="input-field" placeholder="Jane Doe, John Smith" value={data.team.founderNames}
                onChange={(e) => setNested('team', 'founderNames', e.target.value)} />
            </Field>
            <Field label="Team Size" id="teamSize" hint="optional">
              <input id="teamSize" type="number" className="input-field" placeholder="5"
                value={data.team.teamSize ?? ''}
                onChange={(e) => setNested('team', 'teamSize', numOrNull(e.target.value))} />
            </Field>
          </div>
          <Field label="Team Background" id="background" error={errors['background']} required>
            <textarea id="background" rows={2} className="input-field resize-none" placeholder="Ex-Google PM, MIT PhD, 2 successful exits..."
              value={data.team.background} onChange={(e) => setNested('team', 'background', e.target.value)} />
          </Field>
          <Field label="Relevant Experience" id="relevantExp" hint="Why are YOU the right team?">
            <textarea id="relevantExp" rows={2} className="input-field resize-none" placeholder="10 years in logistics, built X at Y company..."
              value={data.team.relevantExperience} onChange={(e) => setNested('team', 'relevantExperience', e.target.value)} />
          </Field>
          <div className="section-divider" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">Current Revenue ($/yr)</label>
              <input type="number" className="input-field" placeholder="600000"
                value={data.financials.revenue ?? ''}
                onChange={(e) => setNested('financials', 'revenue', numOrNull(e.target.value))} />
            </div>
            <div>
              <label className="label-text">Revenue Growth</label>
              <input type="text" className="input-field" placeholder="15% MoM" value={data.financials.revenueGrowth}
                onChange={(e) => setNested('financials', 'revenueGrowth', e.target.value)} />
            </div>
          </div>
          <Field label="Use of Funds 💵" id="useOfFunds" hint="What will you do with the money?">
            <input id="useOfFunds" className="input-field" placeholder="40% engineering, 30% marketing, 30% ops"
              value={data.financials.useOfFunds} onChange={(e) => setNested('financials', 'useOfFunds', e.target.value)} />
          </Field>
          <Field label="Exit Potential 🏆" id="exitPotential" error={errors['exitPotential']} required hint="Acquisition / IPO">
            <textarea id="exitPotential" rows={2} className="input-field resize-none" 
              placeholder="Acquisition target: Salesforce, SAP. IPO path in 5-7 years at $500M+"
              value={data.exitPotential} onChange={(e) => set('exitPotential', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/60">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />Back
        </button>
        <button id="pitch-next-btn" onClick={handleNext} disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400
            text-white font-semibold text-sm transition-all disabled:opacity-50">
          {step === STEPS.length - 1 ? (
            <><Rocket className="w-4 h-4" />Face the Sharks</>
          ) : (
            <>Next<ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
