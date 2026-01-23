import React from 'react';
import type { Satellite } from '../../types/satellite';

interface FavoritesListProps {
  favorites: Array<{ noradId: string; satellite?: Satellite }>;
  onSelect: (noradId: string) => void;
  currentSatelliteId?: string;
}

/**
 * T058: FavoritesList component
 * Displays list of favorited satellites
 */
export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onSelect,
  currentSatelliteId,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No favorites yet</p>
        <p className="text-sm mt-1">
          Click the heart icon to save satellites
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-list">
      <h2 className="text-lg font-semibold p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        Favorites
      </h2>
      <ul role="list" aria-label="favorites">
        {favorites.map(({ noradId, satellite }) => {
          const isActive = noradId === currentSatelliteId;
          
          return (
            <li key={noradId}>
              <button
                type="button"
                onClick={() => onSelect(noradId)}
                className={`
                  w-full text-left p-4 border-b border-gray-100 dark:border-gray-800
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                  ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}
                `}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {satellite?.name || `Satellite ${noradId}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      NORAD ID: {noradId}
                    </p>
                  </div>
                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
