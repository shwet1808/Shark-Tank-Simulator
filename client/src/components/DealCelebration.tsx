import { useEffect, useRef, useState } from 'react';
import { FinalDeal } from '../types/index';
import { Trophy, Sparkles, X, ArrowRight } from 'lucide-react';

interface Props {
  deal: FinalDeal;
  onViewReport?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle';
  opacity: number;
}

const COLORS = [
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#F97316', // orange
  '#EAB308', // yellow
  '#06B6D4', // cyan
];

export default function DealCelebration({ deal, onViewReport }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate confetti particles
    const particles: Particle[] = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 4,
        size: Math.random() * 8 + 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#10B981',
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1,
      });
    }

    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.985; // friction
        p.rotation += p.vRot;

        if (elapsed > 3500) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (elapsed < 6000 && particles.some((p) => p.opacity > 0)) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Backdrop with subtle dark fade */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={() => setShowModal(false)}
      />

      {/* Celebratory Modal Card */}
      <div
        className="relative z-20 pointer-events-auto max-w-md w-full p-8 rounded-2xl border-2 text-center shadow-2xl animate-in zoom-in-95 duration-300"
        style={{
          background: 'linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(9, 9, 11, 0.98))',
          borderColor: 'rgba(16, 185, 129, 0.5)',
          boxShadow: '0 0 50px rgba(16, 185, 129, 0.25), 0 20px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulsing Trophy Icon */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-amber-400 flex items-center justify-center text-white shadow-lg border border-emerald-400/30">
            <Trophy className="w-10 h-10 text-yellow-100 animate-bounce" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Deal Closed!
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-200 to-emerald-400 tracking-tight mb-2">
          CONGRATULATIONS!
        </h2>

        <p className="text-zinc-300 text-sm font-medium mb-5 leading-relaxed">
          {deal.verdict}
        </p>

        {/* Deal Terms Highlights */}
        {deal.amount && deal.equity ? (
          <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                Investment
              </div>
              <div className="text-lg font-black text-emerald-400">
                ${deal.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                Equity
              </div>
              <div className="text-lg font-black text-amber-400">
                {deal.equity}%
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {onViewReport && (
            <button
              onClick={() => {
                setShowModal(false);
                onViewReport();
              }}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>View Full Deal Report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <button
            onClick={() => setShowModal(false)}
            className="w-full py-2 px-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Review Shark Discussion
          </button>
        </div>
      </div>
    </div>
  );
}
