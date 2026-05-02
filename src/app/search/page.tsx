'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, SlidersHorizontal, CheckCircle, X,
  Loader2, Navigation, Star, Phone, Globe, MapPin, Clock,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './Search.module.css';
import { parseSearchQuery } from '@/lib/parseSearchQuery';
import { getBusinessStatus } from '@/lib/businessHours';

const PAGE_SIZE = 10;

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13}
          className={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} />
      ))}
    </span>
  );
}

function ResultCard({ biz }: { biz: any }) {
  const status = getBusinessStatus(biz.openingTime || null, biz.closingTime || null);
  const initial = (biz.name || '?').charAt(0).toUpperCase();
  return (
    <div className={styles.resultCard}>
      <div className={styles.resultTop}>
        <div className={`${styles.favicon} ${biz.isFeatured ? styles.faviconFeatured : ''}`}>
          {initial}
        </div>
        <div className={styles.resultMeta}>
          <span className={styles.resultBreadcrumb}>
            9jasearch.ng › <span>{biz.city}</span> › {biz.category}
          </span>
        </div>
        {biz.isFeatured && <span className={styles.featuredTag}>⭐ Featured</span>}
        {biz.isVerified && <span className={styles.verifiedTag}>✓ Verified</span>}
      </div>

      <Link href={`/business/${biz.slug}`} className={styles.resultTitle}>
        {biz.name}
      </Link>

      <div className={styles.resultRating}>
        <span className={styles.ratingNum}>{(biz.rating || 0).toFixed(1)}</span>
        <Stars rating={biz.rating || 0} />
        <span className={styles.reviewCnt}>({biz.reviewCount || 0} reviews)</span>
        <span className={styles.infoDot}>·</span>
        <span>{biz.category}</span>
      </div>

      {biz.description && <p className={styles.resultSnippet}>{biz.description}</p>}

      <div className={styles.resultInfo}>
        <MapPin size={13} />
        <span>{biz.address}{biz.city ? `, ${biz.city}` : ''}</span>
        {biz.phone && (<><span className={styles.infoDot}>·</span><Phone size={13} /><span>{biz.phone}</span></>)}
        <span className={styles.infoDot}>·</span>
        <Clock size={13} />
        <span className={status.label === 'Open' ? styles.statusOpen : styles.statusClosed}>
          {status.label}
        </span>
        {status.secondary && <span>{status.secondary}</span>}
      </div>

      <div className={styles.resultChips}>
        <Link href={`/business/${biz.slug}`} className={styles.chip}>View Details</Link>
        <a href={`tel:${biz.phone}`} className={styles.chip}><Phone size={13} /> Call</a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${biz.address}, ${biz.city}`)}`}
          target="_blank" rel="noopener noreferrer" className={styles.chip}>
          <MapPin size={13} /> Directions
        </a>
        {biz.website && (
          <a href={biz.website} target="_blank" rel="noopener noreferrer" className={styles.chip}>
            <Globe size={13} /> Website
          </a>
        )}
        {biz.whatsapp && (
          <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer" className={styles.chip}>
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} onClick={() => onPage(page - 1)} disabled={page === 1}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className={styles.pageEllipsis}>…</span>
          : <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => onPage(p as number)}>{p}</button>
      )}
      <button className={styles.pageBtn} onClick={() => onPage(page + 1)} disabled={page === totalPages}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultLabel, setResultLabel] = useState('');
  const [page, setPage] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE);
  const pagedResults = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    let q = searchParams.get('q') || '';
    let loc = searchParams.get('location') || '';
    const sort = searchParams.get('sortBy') || 'relevance';
    const ver = searchParams.get('verified') === 'true';
    const lat = searchParams.get('lat') || '';
    const lng = searchParams.get('lng') || '';

    if (q && !loc && !lat) {
      const { cleanQuery, city } = parseSearchQuery(q);
      if (city && city !== '__NEARME__') { q = cleanQuery; loc = city; }
    }

    const display = loc ? (q ? `${q} in ${loc}` : loc) : q;
    setQuery(display);
    setSortBy(sort);
    setVerifiedOnly(ver);
    setPage(1);

    if (q || loc || (lat && lng)) runSearch(q, loc, sort, ver, lat, lng, display);
  }, [searchParams]);

  const runSearch = async (q: string, loc: string, sort: string, verified: boolean, lat = '', lng = '', label = '') => {
    setLoading(true);
    setSearched(true);
    setResultLabel(label || q || loc || (lat ? 'near you' : ''));
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (loc) params.set('location', loc);
      if (sort !== 'relevance') params.set('sortBy', sort);
      if (verified) params.set('verified', 'true');
      if (lat) params.set('lat', lat);
      if (lng) params.set('lng', lng);
      params.set('limit', '100'); // fetch more for pagination

      const res = await fetch(`/api/businesses/search?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) { setAllResults(data); }
      else { setAllResults([]); }
    } catch { setAllResults([]); }
    finally { setLoading(false); }
  };

  const submitSearch = (raw: string) => {
    if (!raw.trim()) return;
    const { cleanQuery, city } = parseSearchQuery(raw);
    if (city === '__NEARME__') { handleNearMe(cleanQuery); return; }
    const params = new URLSearchParams();
    if (cleanQuery) params.set('q', cleanQuery);
    if (city) params.set('location', city);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    if (verifiedOnly) params.set('verified', 'true');
    router.push(`/search?${params.toString()}`);
  };

  const handleNearMe = (baseQuery = '') => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const params = new URLSearchParams();
        if (baseQuery) params.set('q', baseQuery);
        params.set('lat', pos.coords.latitude.toString());
        params.set('lng', pos.coords.longitude.toString());
        router.push(`/search?${params.toString()}`);
      },
      () => { setGeoLoading(false); alert('Could not get your location. Type a city name instead.'); },
      { timeout: 8000 }
    );
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      {/* ── Search bar with logo on left ── */}
      <div className={styles.searchBar}>
        <div className={styles.searchBarInner}>
          {/* App name text beside search bar */}
          <Link href="/" className={styles.logoLink} aria-label="9jaSearch Home">
            <span className={styles.logoText}>9Ja <span className={styles.logoTextAccent}>Search</span></span>
          </Link>

          {/* Search form */}
          <form className={styles.searchForm} onSubmit={e => { e.preventDefault(); submitSearch(query); }}>
            <div className={styles.inputRow}>
              <div className={styles.inputWrap}>
                <Search size={18} className={styles.inputIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.input}
                  placeholder='e.g. "hotel in Lagos", "plumber in Benin"'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  aria-label="Search"
                />
                {query && (
                  <button type="button" className={styles.clearBtn}
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <button type="button" className={styles.nearMeBtn}
                onClick={() => handleNearMe(parseSearchQuery(query).cleanQuery || query)}
                title="Near me" disabled={geoLoading}>
                {geoLoading ? <Loader2 size={18} className={styles.spinner} /> : <Navigation size={18} />}
              </button>

              <button type="submit" className={styles.searchBtn}>
                <Search size={18} />
              </button>

              <button type="button"
                className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
                onClick={() => setShowFilters(f => !f)}>
                <SlidersHorizontal size={18} />
              </button>
            </div>

            {showFilters && (
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Sort by</label>
                  <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviewed</option>
                  </select>
                </div>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
                  <CheckCircle size={14} color="#008751" /> Verified only
                </label>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Results ── */}
      <div className={styles.results}>
        {searched && !loading && (
          <p className={styles.resultCount}>
            {allResults.length > 0
              ? `About ${allResults.length} result${allResults.length !== 1 ? 's' : ''} for "${resultLabel}" — Page ${page} of ${totalPages}`
              : `No results for "${resultLabel}"`}
          </p>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Searching businesses...</p>
          </div>
        )}

        {!loading && searched && allResults.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={48} color="#ccc" />
            <h3>No businesses found</h3>
            <p>Try a different keyword or city, or <a href="/add-business">add a business</a>.</p>
          </div>
        )}

        {!loading && pagedResults.map(biz => <ResultCard key={biz.id} biz={biz} />)}

        {/* Pagination */}
        {!loading && allResults.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
        )}

        {!searched && !loading && (
          <div className={styles.emptyState}>
            <Search size={48} color="#ccc" />
            <h3>Search for anything</h3>
            <p>Try <strong>"hotel in Lagos"</strong>, <strong>"mechanic in Abuja"</strong>, or <strong>"restaurant near me"</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#008751' }} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
