import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoLocation } from '../types';
import { searchLocations } from '../services/weatherService';

interface Props {
  onSelect: (loc: GeoLocation) => void;
  onUseMyLocation: () => void;
  loading: boolean;
  geoLoading: boolean;
  geoError: string | null;
}

export default function SearchBar({ onSelect, onUseMyLocation, loading, geoLoading, geoError }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearchDone(false);
      return;
    }
    setSearching(true);
    setSearchDone(false);
    try {
      const res = await searchLocations(q);
      setResults(res);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearchDone(true);
    }
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void doSearch(val), 350);
    },
    [doSearch],
  );

  const handleSelect = (loc: GeoLocation) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setSearchDone(false);
    onSelect(loc);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showNoResults = searchDone && !searching && results.length === 0 && query.trim().length >= 2;

  return (
    <div className="search-area" ref={containerRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search a city in the UK, Netherlands, or Denmark…"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search location"
        />
        {(searching || loading) && <span className="search-spinner" />}
      </div>

      <button
        className="geo-btn"
        onClick={onUseMyLocation}
        disabled={geoLoading}
        aria-label="Use my current location"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
        <span>{geoLoading ? 'Locating…' : 'Use my location'}</span>
      </button>

      {geoError && <p className="geo-error">{geoError}</p>}

      <p className="search-hint">
        We use your location only to fetch the weather. Coordinates are not stored or saved.
      </p>

      {open && results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map((loc) => (
            <li key={loc.id} className="search-result-item" onClick={() => handleSelect(loc)} role="option">
              <span className="result-name">{loc.name}</span>
              <span className="result-region">
                {[loc.admin1, loc.country].filter(Boolean).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <div className="search-empty">
          No results found{query ? ` for "${query}"` : ''}. Try a different city name — results are limited to the UK, Netherlands, and Denmark.
        </div>
      )}
    </div>
  );
}
