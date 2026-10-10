import { PitchFormData } from '../types/index';
import { API_BASE } from '../types/constants';

interface SubmitResponse {
  sessionId: string;
  pitchId: string;
  overallScore?: number;
  message: string;
}

function getErrorMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  if ('error' in body && typeof body.error === 'string') return body.error;
  if ('message' in body && typeof body.message === 'string') return body.message;
  return undefined;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const reason = error instanceof Error ? ` (${error.message})` : '';
    throw new Error(
      `Could not reach the API at ${url}.${reason} Check VITE_API_BASE, the Render service, and its CORS_ORIGIN setting.`,
    );
  }

  const responseText = await response.text();
  let responseBody: unknown;
  try {
    responseBody = JSON.parse(responseText) as unknown;
  } catch {
    responseBody = undefined;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(responseBody) ??
        `API request failed with HTTP ${response.status} ${response.statusText}. Check that VITE_API_BASE points to the Render backend.`,
    );
  }

  if (responseBody === undefined) {
    throw new Error(
      `The API at ${url} returned an invalid response. Check that VITE_API_BASE points to the Render backend and that the backend is running.`,
    );
  }

  return responseBody as T;
}

export async function submitStructuredPitch(data: PitchFormData): Promise<SubmitResponse> {
  return post<SubmitResponse>('/pitch/submit', data);
}


export async function submitTextPitch(
  pitchText: string,
  companyName: string,
  askAmount: number,
  equityOffered: number,
): Promise<SubmitResponse> {
  return post<SubmitResponse>('/pitch/text', {
    pitchText,
    companyName,
    askAmount,
    equityOffered,
  });
}


export function createSessionStream(sessionId: string): EventSource {
  return new EventSource(`${API_BASE}/session/${sessionId}/stream`);
}
