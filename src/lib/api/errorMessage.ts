import axios, { type AxiosError } from 'axios';

interface ErrorPayloadLike {
  message?: string | string[];
  error?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractMessageField = (data: unknown): string | null => {
  if (!isRecord(data)) {
    return null;
  }
  const payload = data as ErrorPayloadLike;
  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }
  if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
    return payload.message.trim();
  }
  if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
    return payload.error.trim();
  }
  return null;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Unable to process authentication request',
): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;

    const responseMessage = extractMessageField(axiosError.response?.data);
    if (responseMessage !== null) {
      return responseMessage;
    }

    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error: backend unreachable or blocked by CORS';
    }
    if (typeof axiosError.message === 'string' && axiosError.message.length > 0) {
      return axiosError.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallback;
}
