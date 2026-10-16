import { createContext } from 'react';

export interface ErrorState {
  message: string;
  technical?: string;
  fullPage: boolean;
}

export interface ErrorContextValue {
  error: ErrorState | null;
  showError: (opts?: Partial<ErrorState>) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextValue | null>(null);
