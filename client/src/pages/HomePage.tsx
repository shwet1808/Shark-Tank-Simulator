import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, TrendingUp, Shield } from 'lucide-react';
import { SHARK_PROFILES } from '../types/constants';

const STATS = [
  { label: 'Questions fired', value: '48', unit: 'avg/session' },
  { label: 'Deal success rate', value: '23', unit: '% of pitches' },
  { label: 'AI Shark personas', value: '4', unit: 'unique voices' },
  { label: 'Pitch factors', value: '12', unit: 'evaluated' },
];

const FEATURES = [
  { icon: Zap, label: 'Live Interrogation', desc: 'Real-time AI responses from 4 distinct shark personalities' },
  { icon: Target, label: 'Deep Analysis', desc: '12 startup factors evaluated with brutal precision' },
  { icon: TrendingUp, label: 'Negotiation Engine', desc: 'Live term sheet negotiation with counter-offers' },
  { icon: Shield, label: 'Deal Resolution', desc: 'Official investment memo exported on session close' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦈</span>
          <span className="font-semibold text-sm tracking-tight text-zinc-200">Shark Tank Simulator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-500">4 Sharks Online</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full
            bg-sky-500/5 blur-3xl" />
        </div>

        <div className="relative animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800
            bg-zinc-900/50 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Powered by GPT-4o — No fluff, just truth
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6 max-w-4xl">
            <span className="text-gradient">Face the Panel.</span>
            <br />
            <span className="text-gradient-blue">No Politeness.</span>
            <br />
            <span className="text-gradient">Pure Truth.</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Submit your startup pitch and face 4 ruthless AI investor personas who will
            dissect every number, challenge every assumption, and force you to earn your deal.
          </p>

          <button
            id="enter-tank-btn"
            onClick={() => navigate('/pitch')}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400
              text-white font-semibold text-lg transition-all duration-200 glow-btn
              shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)]"
          >
            Enter the Tank
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Stats grid */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((stat, i) => (
            <div key={i} className={`glass-card p-5 text-center animate-in stagger-${i + 1}`}>
              <div className="text-3xl font-black text-gradient-blue">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.unit}</div>
              <div className="text-sm text-zinc-300 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shark lineup */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6 text-center">
            Meet the Panel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(SHARK_PROFILES).map((shark, i) => (
              <div key={shark.id}
                className={`glass-card-hover p-4 text-center cursor-default animate-in stagger-${i + 1}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${shark.gradient}
                  border border-zinc-800 flex items-center justify-center text-2xl mx-auto mb-3`}>
                  {shark.emoji}
                </div>
                <div className={`text-sm font-semibold ${shark.color}`}>{shark.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{shark.title}</div>
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {shark.focus.slice(0, 2).map((f) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div key={i} className={`glass-card p-5 flex items-start gap-4 animate-in stagger-${i + 1}`}>
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center
                justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-100">{label}</div>
                <div className="text-xs text-zinc-500 mt-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 px-6 py-4 text-center text-xs text-zinc-600">
        Shark Tank Simulator — Built for founders who want the truth before the meeting
      </footer>
    </div>
  );
}
