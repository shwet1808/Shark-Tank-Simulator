import { Crosshair, BrainCircuit, Activity } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16 animate-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient mb-6">
          The Polite Feedback Echo Chamber Ends Here
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          Friends and family will tell you your startup "sounds cool!". Real venture capitalists will quietly pass because your unit economics don't scale. We built SharkTank Sim to bridge that gap.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="glass-card p-8 animate-in stagger-1">
          <div className="w-12 h-12 rounded-lg mb-6 flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <Activity className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[var(--color-text)]">The Problem</h2>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
            Early-stage founders lack access to real institutional feedback. Without brutal honesty about your moat, market size, and customer acquisition costs, you risk building a product no one wants to fund. The "Polite Feedback Echo Chamber" is a silent killer of startups.
          </p>
        </div>

        <div className="glass-card p-8 animate-in stagger-2">
          <div className="w-12 h-12 rounded-lg mb-6 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Crosshair className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[var(--color-text)]">Our Solution</h2>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
            An AI-powered, high-pressure investor panel that strips away politeness. We cross-examine founders across 12 essential startup pillars using 4 distinct multi-agent personas, delivering unfiltered, institutional-grade feedback before you step into a real boardroom.
          </p>
        </div>
      </div>

      <div className="w-full mt-12 glass-card p-8 text-center animate-in stagger-3">
        <BrainCircuit className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Powered by Advanced LLMs</h3>
        <p className="text-[var(--color-text-muted)] text-sm max-w-xl mx-auto">
          Our simulator uses one configured AI model for every shark response, review, and final memo so feedback stays consistent from pitch to decision.
        </p>
      </div>
    </div>
  );
}
