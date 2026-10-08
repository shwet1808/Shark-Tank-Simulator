import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LayoutGrid, Loader2, AlertCircle } from 'lucide-react';
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

  // Handle structured form submission
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

  // Handle free-text pitch submission
  async function handleTextSubmit(data: {
    pitchText: string;
    companyName: string;
    askAmount: number;
    equityOffered: number;
  }) {
    setIsSubmitting(true);
    setError(null);
    try {
      reset();
      const res = await submitTextPitch(
        data.pitchText,
        data.companyName,
        data.askAmount,
        data.equityOffered,
      );
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
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1
            className="text-3xl font-black tracking-tight text-gradient"
            style={{ color: 'var(--color-text)' }}
          >
            Submit Your Pitch
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            Choose how you want to present your startup to the sharks.
          </p>
        </div>

        {/* Mode selector */}
        <div
          className="flex gap-2 mb-8 p-1 rounded-xl border w-fit"
          style={{
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            id="mode-structured"
            onClick={() => setMode('structured')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'structured'
                ? 'text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            style={
              mode === 'structured' ? { backgroundColor: 'var(--color-accent)' } : {}
            }
          >
            <LayoutGrid className="w-4 h-4" />
            Structured Form
          </button>
          <button
            id="mode-text"
            onClick={() => setMode('text')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'text'
                ? 'text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            style={
              mode === 'text' ? { backgroundColor: 'var(--color-accent)' } : {}
            }
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

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: 'rgba(17, 17, 19, 0.8)',
            }}>
            <div className="glass-card p-8 text-center max-w-sm mx-auto border" style={{ borderColor: 'var(--color-border)' }}>
              <Loader2
                className="w-10 h-10 animate-spin mx-auto mb-4"
                style={{ color: 'var(--color-accent)' }}
              />
              <div className="font-semibold text-[var(--color-text)]">Briefing the Sharks</div>
              <div className="text-[var(--color-text-muted)] text-sm mt-1">
                Preparing your session...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
