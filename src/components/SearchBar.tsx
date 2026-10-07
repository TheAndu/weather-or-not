import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoLocation } from '../types';
import { searchLocations } from '../services/weatherService';

interface Props {
  onSearch: (query: string) => Promise<GeoLocation[]>;
  onSelect: (loc: GeoLocation) => void;
  loading: boolean;
}

export default function SearchBar({ onSelect, loading }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchLocations(q);
      setResults(res);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
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

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search a city…"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search location"
        />
        {(searching || loading) && <span className="search-spinner" />}
      </div>

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
    </div>
  );
}
