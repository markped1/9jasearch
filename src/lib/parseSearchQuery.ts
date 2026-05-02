/**
 * Shared query parser — used by both the homepage and search page.
 * Extracts a Nigerian city/area from a natural language query.
 *
 * Examples:
 *   "hotel in Lagos"      → { cleanQuery: "hotel",       city: "Lagos" }
 *   "mechanics Abuja"     → { cleanQuery: "mechanics",   city: "Abuja" }
 *   "restaurants near me" → { cleanQuery: "restaurants", city: "__NEARME__" }
 *   "banks"               → { cleanQuery: "banks",       city: "" }
 */

export const NIGERIAN_CITIES = [
  // Major cities
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu',
  'Benin City', 'Kaduna', 'Owerri', 'Warri', 'Abeokuta', 'Calabar',
  'Uyo', 'Maiduguri', 'Jos', 'Ilorin', 'Asaba', 'Akure', 'Osogbo',
  'Sokoto', 'Katsina', 'Zaria', 'Aba', 'Onitsha', 'Makurdi', 'Yola',
  'Lokoja', 'Lafia', 'Bauchi', 'Gombe', 'Jalingo', 'Damaturu',
  'Dutse', 'Birnin Kebbi', 'Gusau', 'Ado Ekiti',
  // Lagos areas
  'Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Mushin',
  'Festac', 'Apapa', 'Ikorodu', 'Badagry', 'Epe', 'Ajah', 'Sangotedo',
  'Gbagada', 'Ojodu', 'Berger', 'Ojota', 'Maryland', 'Isolo', 'Oshodi',
  'Agege', 'Alimosho', 'Iyana Ipaja', 'Dopemu', 'Egbeda', 'Magodo',
  'Ketu', 'Mile 2', 'Orile', 'Badia', 'Ajegunle',
  // Abuja areas
  'Wuse', 'Maitama', 'Garki', 'Asokoro', 'Gwarinpa', 'Kubwa',
  'Jabi', 'Utako', 'Wuse 2', 'Central Area', 'Lugbe', 'Kuje',
  // PH areas
  'GRA', 'Rumuola', 'Rumuokoro', 'Trans Amadi', 'Diobu', 'Rumuigbo',
  // Other areas
  'Nnewi', 'Awka', 'Umuahia', 'Abakaliki', 'Ogoja', 'Eket',
];

// Sort longest first so "Port Harcourt" matches before "Port"
const SORTED_CITIES = [...NIGERIAN_CITIES].sort((a, b) => b.length - a.length);

export interface ParsedQuery {
  cleanQuery: string;
  city: string;
}

export function parseSearchQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim();
  if (!trimmed) return { cleanQuery: '', city: '' };

  // Near me
  if (/near me|close to me|around me/i.test(trimmed)) {
    const clean = trimmed
      .replace(/near me|close to me|around me/gi, '')
      .trim()
      .replace(/\s+/g, ' ');
    return { cleanQuery: clean, city: '__NEARME__' };
  }

  for (const city of SORTED_CITIES) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: "in Lagos", "at Lagos", "near Lagos", "Lagos" standalone
    const withPrep = new RegExp(`\\b(?:in|at|near|around)\\s+${escaped}\\b`, 'i');
    const standalone = new RegExp(`(?:^|[\\s,])${escaped}(?:[\\s,]|$)`, 'i');

    if (withPrep.test(trimmed) || standalone.test(trimmed)) {
      const clean = trimmed
        .replace(withPrep, '')
        .replace(standalone, ' ')
        .trim()
        .replace(/\s+/g, ' ');
      return { cleanQuery: clean, city };
    }
  }

  return { cleanQuery: trimmed, city: '' };
}

/** Build URL search params from a parsed query */
export function buildSearchUrl(
  raw: string,
  extra: Record<string, string> = {}
): string {
  const { cleanQuery, city } = parseSearchQuery(raw);
  const params = new URLSearchParams();

  if (city === '__NEARME__') {
    // Caller must handle geolocation separately
    if (cleanQuery) params.set('q', cleanQuery);
    params.set('nearme', '1');
  } else {
    if (cleanQuery) params.set('q', cleanQuery);
    if (city) params.set('location', city);
  }

  for (const [k, v] of Object.entries(extra)) {
    if (v) params.set(k, v);
  }

  return `/search?${params.toString()}`;
}
