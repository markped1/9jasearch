'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Map as MapIcon, List, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './Home.module.css';
import BusinessCard from '@/components/search/BusinessCard';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/search/MapView'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#eee', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export default function Home() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [showMap, setShowMap] = useState(false);

  // Fetch businesses with precise geo-location
  const fetchBusinesses = useCallback(async (searchQuery = '', searchLoc = '', limit = 25, searchCoords?: { lat: number, lng: number } | null) => {
    setLoading(true);
    try {
      let url = `/api/businesses/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`;

      if (searchCoords && searchCoords.lat && searchCoords.lng) {
        url += `&lat=${searchCoords.lat}&lng=${searchCoords.lng}`;
      } else if (searchLoc) {
        url += `&location=${encodeURIComponent(searchLoc)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      // Filter out featured businesses from the main list as they have their own section
      // If doing "near me", we might want to keep everything, but for now stick to pattern
      const filteredData = Array.isArray(data) ? data.filter((b: any) => !b.isFeatured) : [];
      setBusinesses(filteredData);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses(query, location, pageSize, coordinates);
  }, [pageSize]); // Only refetch on page size change

  useEffect(() => {
    // Fetch Top Picks
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/businesses/search?q=&location=&limit=6&featured=true');
        const data = await res.json();
        setFeaturedBusinesses(Array.isArray(data) ? data.filter((b: any) => b.isFeatured) : []);
      } catch (err) {
        console.error("Featured fetch error", err);
      }
    };
    fetchFeatured();

    // Initial loose location check for city name pre-fill (optional)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.suburb || data.address.state;
            if (city && !location) {
              // Just suggest the city, don't force it if user already typed
              // setLocation(city); 
              // We'll leave the input empty to encourage typing or using "Near Me"
            }
          } catch (err) {
            console.error("Geo error", err);
          }
        },
        (error) => console.warn("Location permission denied", error)
      );
    }

    // Initial fetch without location
    fetchBusinesses(query, '', pageSize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear coordinates if user manually typed a location
    if (location) {
      setCoordinates(null);
      fetchBusinesses(query, location, pageSize, null);
    } else {
      fetchBusinesses(query, '', pageSize, coordinates);
    }
  };



  return (
    <main>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Discover Nigeria's <br />
            <span>Best Businesses</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The most trusted platform to find verified professionals, places, and services near you.
          </p>

          <form className={styles.searchContainer} onSubmit={handleSearch}>
            <div className={styles.inputGroup}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="What are you looking for? (e.g. Dry Cleaning)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <MapPin className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Lagos, Abuja, PH..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCoordinates(null); // Clear exact coords if typing
                }}
              />

            </div>
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* Top Picks Carousel [NEW] */}
      {featuredBusinesses.length > 0 && (
        <section className={styles.topPicksSection}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div className={styles.topPicksHeader}>
              <h2 className={styles.topPicksTitle}>✨ Featured Listings</h2>
              <p className={styles.topPicksSubtitle}>Hand-picked premium businesses in your area</p>
            </div>
            <div className={styles.carouselContainer}>
              <div className={styles.carouselTrack}>
                {featuredBusinesses.map(biz => (
                  <div key={biz.id} className={styles.carouselItem}>
                    <BusinessCard business={biz} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section style={{ backgroundColor: '#f0fdf4', padding: '60px 0', minHeight: '600px' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>

          <div className={styles.resultsHeader}>
            <h2 className={styles.sectionTitle}>
              {coordinates ? 'Businesses Near You' : query || location ? 'Search Results' : 'Trusted Businesses'}
            </h2>

            <div className={styles.mapToggle}>
              <span className={styles.toggleLabel}>
                {showMap ? <MapIcon size={18} /> : <List size={18} />}
                <span style={{ marginLeft: '5px' }}>{showMap ? 'Map View' : 'List View'}</span>
              </span>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={showMap}
                  onChange={() => setShowMap(!showMap)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
              <Loader2 className="animate-spin" size={48} color="#008751" />
            </div>
          ) : (
            <>
              {showMap && businesses.length > 0 && (
                <MapView
                  businesses={businesses}
                  center={coordinates ? [coordinates.lat, coordinates.lng] : (businesses[0].lat && businesses[0].lng ? [businesses[0].lat, businesses[0].lng] : [9.0820, 8.6753])}
                />
              )}

              {businesses.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {businesses.map(biz => (
                    <BusinessCard key={biz.id} business={biz} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>
                  <h3>No businesses found nearby.</h3>
                  <p>Try searching for a different area or category.</p>
                </div>
              )}
            </>
          )}

          {businesses.length > 0 && (
            <>
              {/* Pagination Controls */}
              <div className={styles.pagination}>
                {/* Simplified pagination for now */}
                <button
                  className={styles.nextBtn}
                  style={{ margin: '0 auto' }}
                  onClick={() => fetchBusinesses(query, location, pageSize + 25, coordinates)}
                >
                  Load More
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
