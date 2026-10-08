import { PitchFormData } from '../types/index';
import { API_BASE } from '../types/constants';

interface SubmitResponse {
  sessionId: string;
  pitchId: string;
  overallScore?: number;
  message: string;
}

export async function submitStructuredPitch(data: PitchFormData): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/pitch/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Server error: ${res.status}`);
  }

  return res.json();
}


export async function submitTextPitch(
  pitchText: string,
  companyName: string,
  askAmount: number,
  equityOffered: number,
): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/pitch/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pitchText, companyName, askAmount, equityOffered }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Server error: ${res.status}`);
  }

  return res.json();
}


export function createSessionStream(sessionId: string): EventSource {
  return new EventSource(`${API_BASE}/session/${sessionId}/stream`);
}
