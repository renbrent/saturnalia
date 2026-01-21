export interface LoadingProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Loading text to display */
  text?: string;
  /** Center in parent */
  center?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Loading spinner component
 */
export function Loading({
  size = 'md',
  text,
  center = false,
  className = '',
}: LoadingProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const containerStyles = center
    ? 'flex flex-col items-center justify-center'
    : 'inline-flex items-center';

  return (
    <div className={`${containerStyles} ${className}`} role="status" aria-label={text || 'Loading'}>
      <svg
        className={`animate-spin text-satellite-600 ${sizeStyles[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className="ml-2 text-gray-600 dark:text-gray-400">{text}</span>
      )}
    </div>
  );
}

/**
 * Full-page loading screen
 */
export function LoadingScreen({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <Loading size="lg" text={text} center />
    </div>
  );
}

/**
 * Loading skeleton for content placeholders
 */
export function Skeleton({
  className = '',
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
