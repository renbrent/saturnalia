import { useState, useCallback, useEffect, useRef } from 'react';
import type { Satellite } from '../../types/satellite';
import { searchByName } from '../../services/celestrak';
import { SEARCH_DEBOUNCE_MS } from '../../constants';
import { SearchResults } from './SearchResults';

export interface SearchBarProps {
  /** Callback when a satellite is selected */
  onSelect: (satellite: Satellite) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Search bar component with debounced satellite search
 */
export function SearchBar({ onSelect, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Satellite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search with request cancellation
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Cancel any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setHasSearched(false);
    setError(null);
    
    try {
      const searchResults = await searchByName(searchQuery, abortControllerRef.current.signal);
      setResults(searchResults);
      setIsOpen(true);
      setHasSearched(true);
      setHighlightedIndex(-1);
    } catch (err) {
      // Ignore abort errors (expected when cancelling stale requests)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Search failed:', err);
      setResults([]);
      setError('Search failed. Please try again.');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Set new debounce
    debounceRef.current = window.setTimeout(() => {
      performSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  }, [performSearch]);

  // Handle satellite selection
  const handleSelect = useCallback((satellite: Satellite) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    setError(null);
    onSelect(satellite);
  }, [onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, results, highlightedIndex, handleSelect]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || (hasSearched && query.trim())) {
              setIsOpen(true);
            }
          }}
          placeholder="Search satellites..."
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-satellite-500 focus:outline-none focus:ring-2 focus:ring-satellite-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          data-testid="search-input"
          aria-label="Search satellites"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          role="combobox"
        />
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Loading indicator */}
        {isLoading && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            data-testid="search-loading"
          >
            <svg
              className="h-5 w-5 animate-spin text-satellite-500"
              fill="none"
              viewBox="0 0 24 24"
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
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <SearchResults
          results={results}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelect}
          onHighlight={setHighlightedIndex}
          hasSearched={hasSearched}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
