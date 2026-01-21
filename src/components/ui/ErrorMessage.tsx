import type { AppError, AppErrorCode } from '../../types/state';

export interface ErrorMessageProps {
  /** Error object or string message */
  error: AppError | string | null;
  /** Callback to dismiss error */
  onDismiss?: () => void;
  /** Visual variant */
  variant?: 'inline' | 'banner' | 'toast';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get user-friendly message for error code
 */
function getErrorMessage(code: AppErrorCode): string {
  const messages: Record<AppErrorCode, string> = {
    TLE_FETCH_FAILED: 'Unable to fetch satellite data. Please try again.',
    SATELLITE_NOT_FOUND: 'Satellite not found. Please check the ID and try again.',
    POSITION_CALCULATION_FAILED: 'Unable to calculate satellite position.',
    LOCATION_PERMISSION_DENIED: 'Location access denied. Please enable location permissions.',
    GEOCODING_FAILED: 'Unable to find location. Please try a different search.',
    STORAGE_FULL: 'Storage is full. Some data may not be saved.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  };
  return messages[code];
}

/**
 * Error message display component
 */
export function ErrorMessage({
  error,
  onDismiss,
  variant = 'inline',
  className = '',
}: ErrorMessageProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message || getErrorMessage(error.code);

  const baseStyles = 'rounded-lg p-4';

  const variantStyles = {
    inline: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    banner:
      'bg-red-600 text-white fixed top-0 left-0 right-0 z-50 rounded-none',
    toast:
      'bg-red-600 text-white shadow-lg fixed bottom-4 right-4 z-50 max-w-sm',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {typeof error !== 'string' && error.details !== undefined && (
            <p className="mt-1 text-xs opacity-80">
              {error.details instanceof Error ? error.details.message : String(error.details)}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded p-1 hover:bg-black/10"
            aria-label="Dismiss error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state component for when there's no data
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className = '',
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-600">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
