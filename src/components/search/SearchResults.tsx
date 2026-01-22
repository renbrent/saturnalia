import type { Satellite } from '../../types/satellite';

export interface SearchResultsProps {
  /** Search results to display */
  results: Satellite[];
  /** Currently highlighted index */
  highlightedIndex: number;
  /** Callback when a satellite is selected */
  onSelect: (satellite: Satellite) => void;
  /** Callback when an item is highlighted (via hover) */
  onHighlight: (index: number) => void;
  /** Whether a search has been performed */
  hasSearched: boolean;
  /** Whether search is in progress */
  isLoading: boolean;
}

/**
 * Dropdown list of search results
 */
export function SearchResults({
  results,
  highlightedIndex,
  onSelect,
  onHighlight,
  hasSearched,
  isLoading,
}: SearchResultsProps) {
  // Show nothing while loading initial search
  if (isLoading && results.length === 0) {
    return (
      <div
        id="search-results"
        data-testid="search-results"
        className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        role="listbox"
      >
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      </div>
    );
  }

  // Show no results message
  if (hasSearched && results.length === 0) {
    return (
      <div
        id="search-results"
        data-testid="search-results"
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        role="listbox"
      >
        <div data-testid="no-results-message" className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No satellites found</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Try searching for "ISS", "Hubble", or "Starlink"
          </p>
        </div>
      </div>
    );
  }

  // Show results
  if (results.length > 0) {
    return (
      <div
        id="search-results"
        data-testid="search-results"
        className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        role="listbox"
      >
        {results.map((satellite, index) => (
          <button
            key={satellite.noradId}
            onClick={() => onSelect(satellite)}
            onMouseEnter={() => onHighlight(index)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              index === highlightedIndex
                ? 'bg-satellite-50 dark:bg-satellite-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            data-testid="search-result-item"
            data-highlighted={index === highlightedIndex}
            role="option"
            aria-selected={index === highlightedIndex}
          >
            {/* Satellite icon */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-satellite-100 text-satellite-600 dark:bg-satellite-900/30 dark:text-satellite-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="9" y="9" width="6" height="6" rx="1" strokeWidth="2" />
                <line x1="3" y1="12" x2="8" y2="12" strokeWidth="2" />
                <line x1="16" y1="12" x2="21" y2="12" strokeWidth="2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                {satellite.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NORAD ID: {satellite.noradId}
              </p>
            </div>
          </button>
        ))}
        {results.length >= 20 && (
          <div className="border-t border-gray-200 px-4 py-2 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Showing first 20 results. Try a more specific search.
          </div>
        )}
      </div>
    );
  }

  return null;
}
