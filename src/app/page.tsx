'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UtensilsCrossed, Hotel, Landmark, ShoppingBag } from 'lucide-react';
import styles from './Home.module.css';
import { buildSearchUrl } from '@/lib/parseSearchQuery';

const QUICK_CATEGORIES = [
  { label: 'Restaurants', Icon: UtensilsCrossed, q: 'restaurants' },
  { label: 'Hotels',      Icon: Hotel,           q: 'hotels'      },
  { label: 'Banks',       Icon: Landmark,        q: 'banks'       },
  { label: 'Shopping',    Icon: ShoppingBag,     q: 'shopping'    },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/businesses/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const names = data.slice(0, 6).map((b: any) => b.name);
          setSuggestions(names);
          setShowSuggestions(names.length > 0);
        }
      } catch { setSuggestions([]); }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const navigate = (raw: string) => {
    if (!raw.trim()) return;
    setShowSuggestions(false);
    const url = buildSearchUrl(raw);
    if (url.includes('nearme=1')) {
      if (!navigator.geolocation) { router.push(url.replace('nearme=1', '')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const params = new URLSearchParams(url.split('?')[1]);
          params.delete('nearme');
          params.set('lat', pos.coords.latitude.toString());
          params.set('lng', pos.coords.longitude.toString());
          router.push(`/search?${params.toString()}`);
        },
        () => router.push(url.replace('&nearme=1', '').replace('nearme=1', '')),
        { timeout: 8000 }
      );
      return;
    }
    router.push(url);
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>

        {/* Logo + tagline */}
        <div className={styles.logoWrap}>
          <div className={styles.heroLogoText}>
            {/* "9Ja" */}
            <span>9Ja</span>
            {/* space */}
            <span>&nbsp;</span>
            {/* "Search" with magnifier above the final "h" */}
            <span className={styles.heroLogoSearchWrap}>
              <span className={styles.heroLogoAccent}>Search</span>
              {/* Magnifier above the "h" at the END of "Search" */}
              <span className={styles.magAboveH}>
                <svg
                  width="43" height="43"
                  viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="10" r="7"
                    stroke="#0B7A3E" strokeWidth="2.5" fill="none"/>
                  <line x1="15.5" y1="15.5" x2="21" y2="21"
                    stroke="#0B7A3E" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </span>
            </span>
          </div>
          <div className={styles.tagline}>
            <div className={styles.taglineLine} />
            <span className={styles.taglineText}>SEARCH NAIJA, FIND MORE.</span>
            <div className={styles.taglineLine} />
          </div>
        </div>

        {/* Search bar */}
        <form
          className={styles.searchForm}
          onSubmit={e => { e.preventDefault(); navigate(query); }}
          autoComplete="off"
        >
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search businesses / services..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              aria-label="Search businesses"
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <Search size={20} color="white" />
            </button>
          </div>

          {/* Autocomplete */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions} role="listbox">
              {suggestions.map((s, i) => (
                <li key={i} role="option" className={styles.suggestionItem}
                  onMouseDown={() => navigate(s)}>
                  <Search size={13} className={styles.suggIcon} />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Category buttons — exactly 4, square, matching design */}
        <div className={styles.chips}>
          {QUICK_CATEGORIES.map(({ label, Icon, q }) => (
            <button
              key={q}
              className={styles.chip}
              onClick={() => navigate(q)}
              type="button"
            >
              <Icon size={20} strokeWidth={1.5} className={styles.chipIcon} />
              {label}
            </button>
          ))}
        </div>

      </section>
    </main>
  );
}
