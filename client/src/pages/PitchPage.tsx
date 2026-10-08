import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, LayoutGrid, Loader2, AlertCircle } from 'lucide-react';
import { submitStructuredPitch, submitTextPitch } from '../services/api';
import { useSessionStore } from '../stores/sessionStore';
import StructuredPitchForm from '../components/StructuredPitchForm';
import TextPitchForm from '../components/TextPitchForm';

type InputMode = 'structured' | 'text';

export default function PitchPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>('structured');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSessionId, reset } = useSessionStore();

  async function handleStructuredSubmit(data: Parameters<typeof submitStructuredPitch>[0]) {
    setIsSubmitting(true);
    setError(null);
    try {
      reset();
      const res = await submitStructuredPitch(data);
      setSessionId(res.sessionId);
      navigate(`/tank/${res.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit pitch');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTextSubmit(data: { pitchText: string; companyName: string; askAmount: number; equityOffered: number }) {
    setIsSubmitting(true);
    setError(null);
    try {
      reset();
      const res = await submitTextPitch(data.pitchText, data.companyName, data.askAmount, data.equityOffered);
      setSessionId(res.sessionId);
      navigate(`/tank/${res.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit pitch');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/40 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🦈</span>
          <span className="text-sm font-semibold text-zinc-300">Pitch Intake</span>
        </div>
        <div className="w-16" />
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gradient">Submit Your Pitch</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Choose how you want to present your startup to the sharks.
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-8 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800 w-fit">
          <button
            id="mode-structured"
            onClick={() => setMode('structured')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'structured'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Structured Form
          </button>
          <button
            id="mode-text"
            onClick={() => setMode('text')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'text'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Pitch Text
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Forms */}
        {mode === 'structured' ? (
          <StructuredPitchForm onSubmit={handleStructuredSubmit} isSubmitting={isSubmitting} />
        ) : (
          <TextPitchForm onSubmit={handleTextSubmit} isSubmitting={isSubmitting} />
        )}

        {/* Submitting overlay indicator */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-8 text-center max-w-sm mx-auto">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto mb-4" />
              <div className="text-zinc-100 font-semibold">Briefing the Sharks</div>
              <div className="text-zinc-500 text-sm mt-1">Preparing your session...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
