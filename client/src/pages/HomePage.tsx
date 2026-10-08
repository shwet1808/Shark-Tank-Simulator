import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, TrendingUp, Shield, HelpCircle } from 'lucide-react';
import { SHARK_PROFILES } from '../types/constants';

// Live stats shown in the hero stats grid
const STATS = [
  { label: 'Questions fired', value: '48', unit: 'avg/session' },
  { label: 'Deal success rate', value: '23', unit: '% of pitches' },
  { label: 'AI personas', value: '4', unit: 'unique voices' },
  { label: 'Pitch factors', value: '12', unit: 'evaluated' },
];

// Core value propositions
const FEATURES = [
  { icon: Zap, label: 'Live Interrogation', desc: 'Real-time AI responses from 4 distinct shark personalities' },
  { icon: Target, label: 'Deep Analysis', desc: '12 startup factors evaluated with brutal precision' },
  { icon: TrendingUp, label: 'Negotiation Engine', desc: 'Live term sheet negotiation with counter-offers' },
  { icon: Shield, label: 'Deal Resolution', desc: 'Professional investment memo generated on session close' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[100px]"
            style={{ backgroundColor: 'var(--color-accent-dim)' }}
          />
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-8 transition-all"
            style={{
              backgroundColor: 'var(--color-accent-dim)',
              borderColor: 'rgba(234, 88, 12, 0.3)',
              color: 'var(--color-accent)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Multi-Provider AI Agent System
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
            <span className="text-gradient">Face the Panel.</span>
            <br />
            <span className="text-gradient">No Politeness.</span>
            <br />
            <span className="text-gradient">Pure Truth.</span>
          </h1>

          <p className="text-[var(--color-text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Submit your startup pitch and face 4 ruthless AI investor personas who will dissect every number,
            challenge every assumption, and force you to earn your deal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              id="enter-tank-btn"
              onClick={() => navigate('/pitch')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 glow-btn animate-in"
              style={{
                backgroundColor: 'var(--color-accent)',
                boxShadow: '0 0 40px var(--color-accent-dim)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 60px var(--color-accent-dim)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 40px var(--color-accent-dim)';
              }}
            >
              Enter the Tank
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/about')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-200 animate-in stagger-1"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <HelpCircle className="w-4 h-4" />
              Learn how it works
            </button>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="glass-card p-5 text-center animate-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl font-black text-gradient">{stat.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.unit}</div>
              <div className="text-sm font-medium text-[var(--color-text)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shark lineup */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-6 text-center">
            Meet the Panel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(SHARK_PROFILES).map((shark, i) => (
              <div
                key={shark.id}
                className="glass-card-hover p-4 text-center cursor-default animate-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 border ${shark.gradient}`}
                >
                  {shark.emoji}
                </div>
                <div className={`text-sm font-semibold ${shark.color}`}>{shark.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{shark.title}</div>
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {shark.focus.slice(0, 2).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(234, 88, 12, 0.08)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {f}
                    </span>
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
            <div
              key={i}
              className="glass-card p-5 flex items-start gap-4 animate-in group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform"
                style={{
                  backgroundColor: 'var(--color-accent-dim)',
                  color: 'var(--color-accent)',
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">{label}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-24 text-center">
        <div className="max-w-3xl mx-auto glass-card p-8">
          <h2 className="text-2xl font-black text-[var(--color-text)] mb-4">
            Ready to Face the Sharks?
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Submit your pitch and get instant, unfiltered feedback from
            institutional-grade AI investors.
          </p>
          <button
            onClick={() => navigate('/pitch')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105 animate-in"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Start Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
