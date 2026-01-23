/**
 * T079: Loading skeleton components
 * Provides visual feedback during data loading
 */

export interface SkeletonProps {
  /** Width of skeleton (CSS value) */
  width?: string;
  /** Height of skeleton (CSS value) */
  height?: string;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Basic skeleton loader
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${roundedClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for satellite card
 */
export function SatelliteCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 ${className}`}
      data-testid="satellite-card-skeleton"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <Skeleton width="60%" height="1.5rem" />
        <Skeleton width="2.5rem" height="2.5rem" rounded="full" />
      </div>

      {/* Position info */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="40%" height="1rem" />
        </div>
        <div className="flex justify-between">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="35%" height="1rem" />
        </div>
        <div className="flex justify-between">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="38%" height="1rem" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <Skeleton height="2.5rem" className="flex-1" />
        <Skeleton height="2.5rem" className="flex-1" />
      </div>
    </div>
  );
}

/**
 * Skeleton for favorites list item
 */
export function FavoriteItemSkeleton() {
  return (
    <div className="border-b border-gray-100 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height="1.25rem" />
          <Skeleton width="40%" height="0.875rem" />
        </div>
        <Skeleton width="1.5rem" height="1.5rem" rounded="full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for pass prediction item
 */
export function PassItemSkeleton() {
  return (
    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="50%" height="1.25rem" />
          <Skeleton width="60%" height="0.875rem" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Skeleton width="90%" height="0.875rem" />
            <Skeleton width="90%" height="0.875rem" />
            <Skeleton width="90%" height="0.875rem" />
            <Skeleton width="90%" height="0.875rem" />
          </div>
        </div>
        <Skeleton width="3rem" height="3rem" rounded="full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for map loading
 */
export function MapSkeleton() {
  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Skeleton width="12rem" height="12rem" rounded="full" className="mx-auto mb-4" />
          <Skeleton width="10rem" height="1.5rem" className="mx-auto" />
        </div>
      </div>
    </div>
  );
}
