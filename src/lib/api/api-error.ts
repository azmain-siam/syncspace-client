import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/domain';

/**
 * Extracts a user-friendly error message from an unknown error or AxiosError.
 * Properly handles backend validation errors where `message` is an array of strings.
 */
export function formatApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.',
): string {
  if (!error) return fallbackMessage;

  if (error instanceof AxiosError) {
    const errorData = error.response?.data as Partial<ApiErrorResponse> | undefined;

    if (errorData?.message) {
      if (Array.isArray(errorData.message)) {
        // Filter empty strings and join distinct messages
        const uniqueMessages = Array.from(new Set(errorData.message.filter(Boolean)));
        return uniqueMessages.join('. ');
      }
      if (typeof errorData.message === 'string' && errorData.message.trim()) {
        return errorData.message.trim();
      }
    }

    if (errorData?.error && typeof errorData.error === 'string') {
      return errorData.error;
    }

    // Network or client-side axios error message
    if (error.message && typeof error.message === 'string') {
      if (error.message.toLowerCase().includes('network error')) {
        return 'Unable to connect to the server. Please check your internet connection or try again later.';
      }
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  return fallbackMessage;
}

/**
 * Parses full error details including status code and all error messages.
 */
export function getApiErrorDetails(error: unknown): {
  statusCode?: number;
  message: string;
  errors: string[];
} {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as Partial<ApiErrorResponse> | undefined;
    const statusCode = error.response?.status;

    let messages: string[] = [];
    if (Array.isArray(errorData?.message)) {
      messages = errorData.message.filter(Boolean);
    } else if (typeof errorData?.message === 'string') {
      messages = [errorData.message];
    } else if (typeof errorData?.error === 'string') {
      messages = [errorData.error];
    } else if (error.message) {
      messages = [error.message];
    }

    return {
      statusCode,
      message: formatApiErrorMessage(error),
      errors: messages,
    };
  }

  return {
    statusCode: undefined,
    message: formatApiErrorMessage(error),
    errors: [formatApiErrorMessage(error)],
  };
}
