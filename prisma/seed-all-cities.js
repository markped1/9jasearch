/**
 * 9jaSearch — Comprehensive Nigeria OSM Seeder
 * Covers all 36 states + FCT — every major city and town
 * Run: node prisma/seed-all-cities.js
 */
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

// All Nigerian cities not yet seeded (existing: Lagos, Abuja, PH, Kano, Ibadan,
// Enugu, Benin City, Kaduna, Owerri, Warri, Abeokuta, Calabar, Uyo, Maiduguri,
// Jos, Ilorin, Asaba, Akure, Osogbo, Sokoto, Katsina, Zaria, Aba, Onitsha,
// Makurdi, Yola, Lokoja)
const CITIES = [
  // Abia
  { name: 'Umuahia',       state: 'Abia',          bbox: [5.50, 7.44, 5.56, 7.52] },
  // Adamawa
  { name: 'Jimeta',        state: 'Adamawa',        bbox: [9.26, 12.44, 9.32, 12.50] },
  { name: 'Numan',         state: 'Adamawa',        bbox: [9.45, 12.02, 9.50, 12.07] },
  // Akwa Ibom
  { name: 'Eket',          state: 'Akwa Ibom',      bbox: [4.63, 7.91, 4.70, 7.97] },
  { name: 'Ikot Ekpene',   state: 'Akwa Ibom',      bbox: [5.17, 7.70, 5.23, 7.76] },
  { name: 'Oron',          state: 'Akwa Ibom',      bbox: [4.79, 8.22, 4.84, 8.27] },
  // Anambra
  { name: 'Awka',          state: 'Anambra',        bbox: [6.19, 7.06, 6.25, 7.12] },
  { name: 'Nnewi',         state: 'Anambra',        bbox: [6.00, 6.98, 6.06, 7.04] },
  { name: 'Ekwulobia',     state: 'Anambra',        bbox: [6.07, 7.14, 6.12, 7.19] },
  // Bauchi
  { name: 'Bauchi',        state: 'Bauchi',         bbox: [10.29, 9.80, 10.36, 9.87] },
  { name: 'Azare',         state: 'Bauchi',         bbox: [11.67, 10.18, 11.72, 10.23] },
  // Bayelsa
  { name: 'Yenagoa',       state: 'Bayelsa',        bbox: [4.90, 6.24, 4.97, 6.31] },
  { name: 'Brass',         state: 'Bayelsa',        bbox: [4.31, 6.22, 4.36, 6.27] },
  // Benue
  { name: 'Otukpo',        state: 'Benue',          bbox: [7.17, 8.12, 7.22, 8.17] },
  { name: 'Gboko',         state: 'Benue',          bbox: [7.32, 9.00, 7.37, 9.05] },
  { name: 'Katsina-Ala',   state: 'Benue',          bbox: [6.99, 9.27, 7.04, 9.32] },
  // Borno
  { name: 'Biu',           state: 'Borno',          bbox: [10.60, 12.19, 10.65, 12.24] },
  { name: 'Nguru',         state: 'Yobe',           bbox: [12.87, 10.44, 12.92, 10.49] },
  // Cross River
  { name: 'Ikom',          state: 'Cross River',    bbox: [5.96, 8.70, 6.01, 8.75] },
  { name: 'Ogoja',         state: 'Cross River',    bbox: [6.65, 8.78, 6.70, 8.83] },
  // Delta
  { name: 'Sapele',        state: 'Delta',          bbox: [5.88, 5.67, 5.93, 5.72] },
  { name: 'Ughelli',       state: 'Delta',          bbox: [5.49, 5.97, 5.54, 6.02] },
  { name: 'Agbor',         state: 'Delta',          bbox: [6.24, 6.18, 6.29, 6.23] },
  { name: 'Kwale',         state: 'Delta',          bbox: [5.69, 6.43, 5.74, 6.48] },
  // Ebonyi
  { name: 'Abakaliki',     state: 'Ebonyi',         bbox: [6.31, 8.09, 6.37, 8.15] },
  { name: 'Afikpo',        state: 'Ebonyi',         bbox: [5.88, 7.92, 5.93, 7.97] },
  // Edo
  { name: 'Auchi',         state: 'Edo',            bbox: [7.06, 6.25, 7.11, 6.30] },
  { name: 'Uromi',         state: 'Edo',            bbox: [6.72, 6.32, 6.77, 6.37] },
  // Ekiti
  { name: 'Ado Ekiti',     state: 'Ekiti',          bbox: [7.60, 5.20, 7.66, 5.26] },
  { name: 'Ikere Ekiti',   state: 'Ekiti',          bbox: [7.49, 5.23, 7.54, 5.28] },
  // FCT extra areas
  { name: 'Gwagwalada',    state: 'FCT',            bbox: [8.93, 7.07, 8.98, 7.12] },
  { name: 'Kuje',          state: 'FCT',            bbox: [8.87, 7.22, 8.92, 7.27] },
  // Gombe
  { name: 'Gombe',         state: 'Gombe',          bbox: [10.27, 11.15, 10.33, 11.21] },
  { name: 'Kumo',          state: 'Gombe',          bbox: [10.04, 11.21, 10.09, 11.26] },
  // Imo
  { name: 'Orlu',          state: 'Imo',            bbox: [5.78, 7.03, 5.83, 7.08] },
  { name: 'Okigwe',        state: 'Imo',            bbox: [5.84, 7.34, 5.89, 7.39] },
  // Jigawa
  { name: 'Dutse',         state: 'Jigawa',         bbox: [11.78, 9.33, 11.83, 9.38] },
  { name: 'Hadejia',       state: 'Jigawa',         bbox: [12.45, 10.03, 12.50, 10.08] },
  { name: 'Gumel',         state: 'Jigawa',         bbox: [12.62, 9.38, 12.67, 9.43] },
  // Kaduna extra
  { name: 'Kafanchan',     state: 'Kaduna',         bbox: [9.58, 8.28, 9.63, 8.33] },
  { name: 'Kagoro',        state: 'Kaduna',         bbox: [9.60, 8.38, 9.65, 8.43] },
  // Kano extra
  { name: 'Wudil',         state: 'Kano',           bbox: [11.79, 8.84, 11.84, 8.89] },
  { name: 'Rano',          state: 'Kano',           bbox: [11.55, 8.57, 11.60, 8.62] },
  // Katsina extra
  { name: 'Daura',         state: 'Katsina',        bbox: [13.03, 8.22, 13.08, 8.27] },
  { name: 'Funtua',        state: 'Katsina',        bbox: [11.52, 7.31, 11.57, 7.36] },
  // Kebbi
  { name: 'Birnin Kebbi',  state: 'Kebbi',          bbox: [12.44, 4.19, 12.49, 4.24] },
  { name: 'Argungu',       state: 'Kebbi',          bbox: [12.74, 4.52, 12.79, 4.57] },
  // Kogi
  { name: 'Okene',         state: 'Kogi',           bbox: [7.54, 6.22, 7.59, 6.27] },
  { name: 'Kabba',         state: 'Kogi',           bbox: [7.83, 6.07, 7.88, 6.12] },
  { name: 'Idah',          state: 'Kogi',           bbox: [7.10, 6.72, 7.15, 6.77] },
  // Kwara extra
  { name: 'Offa',          state: 'Kwara',          bbox: [8.14, 4.71, 8.19, 4.76] },
  { name: 'Lafiagi',       state: 'Kwara',          bbox: [8.87, 5.41, 8.92, 5.46] },
  // Lagos extra areas
  { name: 'Badagry',       state: 'Lagos',          bbox: [6.40, 2.87, 6.45, 2.92] },
  { name: 'Epe',           state: 'Lagos',          bbox: [6.58, 3.97, 6.63, 4.02] },
  { name: 'Ikorodu',       state: 'Lagos',          bbox: [6.60, 3.49, 6.65, 3.54] },
  // Nasarawa
  { name: 'Lafia',         state: 'Nasarawa',       bbox: [8.48, 8.49, 8.53, 8.54] },
  { name: 'Keffi',         state: 'Nasarawa',       bbox: [8.84, 7.87, 8.89, 7.92] },
  { name: 'Akwanga',       state: 'Nasarawa',       bbox: [8.91, 8.40, 8.96, 8.45] },
  // Niger
  { name: 'Minna',         state: 'Niger',          bbox: [9.60, 6.53, 9.66, 6.59] },
  { name: 'Bida',          state: 'Niger',          bbox: [9.07, 5.99, 9.12, 6.04] },
  { name: 'Suleja',        state: 'Niger',          bbox: [9.17, 7.17, 9.22, 7.22] },
  { name: 'Kontagora',     state: 'Niger',          bbox: [10.39, 5.46, 10.44, 5.51] },
  // Ogun extra
  { name: 'Sagamu',        state: 'Ogun',           bbox: [6.83, 3.63, 6.88, 3.68] },
  { name: 'Ijebu Ode',     state: 'Ogun',           bbox: [6.81, 3.91, 6.86, 3.96] },
  { name: 'Ilaro',         state: 'Ogun',           bbox: [6.88, 3.00, 6.93, 3.05] },
  // Ondo extra
  { name: 'Ondo',          state: 'Ondo',           bbox: [7.09, 4.83, 7.14, 4.88] },
  { name: 'Owo',           state: 'Ondo',           bbox: [7.19, 5.58, 7.24, 5.63] },
  { name: 'Okitipupa',     state: 'Ondo',           bbox: [6.50, 4.78, 6.55, 4.83] },
  // Osun extra
  { name: 'Ile-Ife',       state: 'Osun',           bbox: [7.46, 4.55, 7.51, 4.60] },
  { name: 'Ede',           state: 'Osun',           bbox: [7.73, 4.43, 7.78, 4.48] },
  { name: 'Ilesha',        state: 'Osun',           bbox: [7.62, 4.73, 7.67, 4.78] },
  // Oyo extra
  { name: 'Ogbomosho',     state: 'Oyo',            bbox: [8.12, 4.24, 8.17, 4.29] },
  { name: 'Oyo',           state: 'Oyo',            bbox: [7.85, 3.93, 7.90, 3.98] },
  { name: 'Iseyin',        state: 'Oyo',            bbox: [7.97, 3.59, 8.02, 3.64] },
  // Plateau extra
  { name: 'Shendam',       state: 'Plateau',        bbox: [8.88, 9.54, 8.93, 9.59] },
  { name: 'Pankshin',      state: 'Plateau',        bbox: [9.33, 9.43, 9.38, 9.48] },
  // Rivers extra
  { name: 'Bonny',         state: 'Rivers',         bbox: [4.44, 7.15, 4.49, 7.20] },
  { name: 'Degema',        state: 'Rivers',         bbox: [4.74, 6.77, 4.79, 6.82] },
  { name: 'Ahoada',        state: 'Rivers',         bbox: [5.10, 6.63, 5.15, 6.68] },
  // Sokoto extra
  { name: 'Tambuwal',      state: 'Sokoto',         bbox: [12.40, 5.06, 12.45, 5.11] },
  // Taraba
  { name: 'Jalingo',       state: 'Taraba',         bbox: [8.88, 11.36, 8.93, 11.41] },
  { name: 'Wukari',        state: 'Taraba',         bbox: [7.86, 9.77, 7.91, 9.82] },
  // Yobe
  { name: 'Damaturu',      state: 'Yobe',           bbox: [11.74, 11.96, 11.79, 12.01] },
  { name: 'Potiskum',      state: 'Yobe',           bbox: [11.70, 11.07, 11.75, 11.12] },
  // Zamfara
  { name: 'Gusau',         state: 'Zamfara',        bbox: [12.15, 6.65, 12.20, 6.70] },
  { name: 'Kaura Namoda',  state: 'Zamfara',        bbox: [12.59, 6.59, 12.64, 6.64] },
];

const OSM_TO_CATEGORY = {
  restaurant:'Restaurants & Cafes', cafe:'Restaurants & Cafes',
  fast_food:'Fast Food & Bukas', bar:'Bars & Cocktail Lounges',
  pub:'Pubs & Beer Parlours', nightclub:'Nightclubs & Lounges',
  hotel:'Hotels & Resorts', motel:'Motels & Inns',
  guest_house:'Guest Houses & Lodges', hostel:'Guest Houses & Lodges',
  bakery:'Bakery & Confectionery', ice_cream:'Ice Cream & Desserts',
  supermarket:'Supermarkets & Hypermarkets', convenience:'Mini Marts & Kiosks',
  marketplace:'Open Markets & Stalls', clothes:'Fashion & Clothing',
  shoes:'Shoes & Footwear', jewelry:'Jewellery & Watches',
  electronics:'Electronics & Gadgets', mobile_phone:'Mobile Phone Shops',
  computer:'Computer Shops', books:'Bookshops', toys:'Toy Shops',
  furniture:'Furniture & Decor', hardware:'Nails, Bolts & Hardware',
  paint:'Paints & Coatings', florist:'Flower Shops & Florists',
  cosmetics:'Cosmetics & Beauty Products', optician:'Eye Clinics & Opticians',
  sports:'Sports Equipment', bicycle:'Bicycle Sales & Repairs',
  pet:'Pet Shops & Supplies', stationery:'Stationery & Art Supplies',
  fabric:'Fabrics & Textiles', wholesale:'Wholesale & Distribution',
  hospital:'Hospitals & Clinics', clinic:'Hospitals & Clinics',
  doctors:'General Practitioners (GP)', dentist:'Dental Clinics',
  pharmacy:'Pharmacies & Chemists', veterinary:'Veterinary Services',
  physiotherapist:'Physiotherapy & Rehab', laboratory:'Diagnostic & Lab Services',
  school:'Nursery & Primary Schools', university:'Universities & Polytechnics',
  college:'Universities & Polytechnics', kindergarten:'Creches & Daycare Centres',
  library:'Libraries', bank:'Commercial Banks', atm:'POS Services & Agents',
  bureau_de_change:'Forex & Bureau de Change',
  car_repair:'Auto Repairs & Mechanics', car_wash:'Car Wash & Detailing',
  fuel:'Filling Stations & Petrol Stations', tyres:'Tyre Services & Vulcanisers',
  laundry:'Dry Cleaning & Laundry', hairdresser:'Beauty Salons & Hair Salons',
  barber:'Barbing Salons', massage:'Massage Therapy', spa:'Spas & Wellness Centres',
  gym:'Gyms & Fitness Centres', nail_salon:'Nail Technicians & Nail Salons',
  tailor:'Tailoring & Fashion Design', photo:'Photography & Video',
  travel_agency:'Travel Agencies', estate_agent:'Real Estate Agents',
  copyshop:'Business Centres (Xerox & Printing)',
  internet_cafe:'Cybercafes & Business Centres',
  post_office:'Post Offices', courier:'Logistics & Courier Services',
  security:'Security Companies', cleaning:'Domestic Cleaning Services',
  pest_control:'Fumigation & Pest Control', electrician:'Electricians',
  plumber:'Plumbers', locksmith:'Key Cutting & Locksmith',
  event_venue:'Event Halls & Venues', catering:'Catering Services',
  printing:'Printing & Publishing', solar_energy:'Solar & Renewable Energy',
  generator:'Generator Sales', construction:'Construction & Engineering',
  architect:'Architects', interior_design:'Interior Design',
  cinema:'Cinemas & Movie Theatres', swimming_pool:'Swimming Pools',
  sports_centre:'Sports Complexes', stadium:'Stadiums',
  park:'Recreational Parks', zoo:'Zoos & Wildlife Parks',
  museum:'Museums & Cultural Centres', art_gallery:'Art Galleries',
  betting:'Sports Betting Shops', place_of_worship:'Churches',
  church:'Churches', mosque:'Mosques',
  taxi:'Taxi & Cab Services', car_rental:'Car Hire & Rentals',
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': '9jaSearch-Seeder/2.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80);
}

function makeUniqSlug(base, existing) {
  let slug = base, i = 2;
  while (existing.has(slug)) slug = `${base}-${i++}`;
  existing.add(slug);
  return slug;
}

function guessCategory(tags) {
  const checks = [tags.amenity, tags.shop, tags.tourism, tags.leisure, tags.office, tags.craft, tags.healthcare];
  for (const val of checks) {
    if (val && OSM_TO_CATEGORY[val]) return OSM_TO_CATEGORY[val];
  }
  const name = (tags.name || '').toLowerCase();
  if (name.includes('hospital') || name.includes('clinic')) return 'Hospitals & Clinics';
  if (name.includes('pharmacy') || name.includes('chemist')) return 'Pharmacies & Chemists';
  if (name.includes('bank')) return 'Commercial Banks';
  if (name.includes('school') || name.includes('college')) return 'Nursery & Primary Schools';
  if (name.includes('church') || name.includes('parish')) return 'Churches';
  if (name.includes('mosque') || name.includes('masjid')) return 'Mosques';
  if (name.includes('hotel') || name.includes('lodge')) return 'Hotels & Resorts';
  if (name.includes('restaurant') || name.includes('eatery')) return 'Restaurants & Cafes';
  if (name.includes('supermarket')) return 'Supermarkets & Hypermarkets';
  if (name.includes('filling') || name.includes('petrol') || name.includes('fuel')) return 'Filling Stations & Petrol Stations';
  if (name.includes('salon') || name.includes('hair')) return 'Beauty Salons & Hair Salons';
  if (name.includes('barber')) return 'Barbing Salons';
  if (name.includes('market')) return 'Open Markets & Stalls';
  if (name.includes('suya')) return 'Suya & Pepper Soup Spots';
  if (name.includes('mechanic') || name.includes('auto')) return 'Auto Repairs & Mechanics';
  if (name.includes('solar')) return 'Solar & Renewable Energy';
  if (name.includes('security')) return 'Security Companies';
  if (name.includes('law') || name.includes('chambers')) return 'Legal Services & Law Firms';
  if (name.includes('estate') || name.includes('property')) return 'Real Estate Agents';
  if (name.includes('logistics') || name.includes('courier')) return 'Logistics & Courier Services';
  if (name.includes('bakery') || name.includes('bread')) return 'Bakery & Confectionery';
  if (name.includes('pharmacy')) return 'Pharmacies & Chemists';
  if (name.includes('university') || name.includes('polytechnic')) return 'Universities & Polytechnics';
  return null;
}

function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.replace(/[\s\-().]/g, '');
  if (p.startsWith('0')) p = '+234' + p.slice(1);
  if (p.startsWith('234') && !p.startsWith('+')) p = '+' + p;
  if (!p.startsWith('+')) return null;
  return p.slice(0, 20);
}

function guessHours(tags) {
  const oh = tags.opening_hours || '';
  const match = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (match) return { open: match[1], close: match[2] };
  return { open: '08:00', close: '18:00' };
}

async function fetchCity(city) {
  const [s, w, n, e] = city.bbox;
  const query = `[out:json][timeout:60];(node["amenity"]["name"](${s},${w},${n},${e});node["shop"]["name"](${s},${w},${n},${e});node["tourism"]["name"](${s},${w},${n},${e});node["leisure"]["name"](${s},${w},${n},${e});way["amenity"]["name"](${s},${w},${n},${e});way["shop"]["name"](${s},${w},${n},${e}););out center tags 500;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const data = await httpsGet(url);
    return data.elements || [];
  } catch (err) {
    console.warn(`  ⚠️  ${city.name}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   9jaSearch — All Nigeria Cities OSM Seeder          ║');
  console.log(`║   ${CITIES.length} cities across all 36 states + FCT          ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const existing = await prisma.business.findMany({ select: { slug: true } });
  const slugSet = new Set(existing.map(b => b.slug));
  console.log(`📦 ${slugSet.size} businesses already in database\n`);

  let totalImported = 0;
  let totalFailed = 0;

  for (let i = 0; i < CITIES.length; i++) {
    const city = CITIES[i];
    console.log(`\n[${i + 1}/${CITIES.length}] 🏙️  ${city.name}, ${city.state}`);

    // Polite delay — 4s between requests
    if (i > 0) await sleep(4000);

    const elements = await fetchCity(city);
    console.log(`  📍 ${elements.length} elements found`);

    let cityCount = 0;
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || '';
      if (!name || name.length < 3) continue;

      const category = guessCategory(tags);
      if (!category) continue;

      let lat = el.lat, lng = el.lon;
      if (!lat && el.center) { lat = el.center.lat; lng = el.center.lon; }
      if (!lat) continue;

      const baseSlug = slugify(`${name}-${city.name}`);
      const slug = makeUniqSlug(baseSlug, slugSet);

      const rawPhone = tags.phone || tags['contact:phone'] || '';
      const phone = formatPhone(rawPhone) || `+234${Math.floor(700000000 + Math.random() * 99999999)}`;
      const emailSlug = slugify(name).replace(/-/g, '').slice(0, 20);
      const email = tags.email || tags['contact:email'] || `info@${emailSlug}.ng`;
      const website = tags.website || tags['contact:website'] || null;
      const houseNum = tags['addr:housenumber'] || '';
      const street = tags['addr:street'] || '';
      const address = [houseNum, street].filter(Boolean).join(' ') || `${name}, ${city.name}`;
      const { open, close } = guessHours(tags);

      let finalCategory = category;
      if (tags.religion === 'muslim' || tags.religion === 'islam') finalCategory = 'Mosques';
      if (tags.religion === 'christian') finalCategory = 'Churches';

      try {
        await prisma.business.create({
          data: {
            name, slug, category: finalCategory,
            description: `${name} is a ${finalCategory.toLowerCase()} located in ${city.name}, ${city.state}, Nigeria.`,
            address, city: city.name, state: city.state,
            phone, email, website, lat, lng,
            openingTime: open, closingTime: close,
            isActive: true, isVerified: false, status: 'APPROVED', tier: 'FREE',
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            reviewCount: Math.floor(Math.random() * 30),
            tags: JSON.stringify([finalCategory]), images: '[]',
          }
        });
        cityCount++;
        totalImported++;
      } catch (err) {
        if (!err.message.includes('Unique constraint')) {
          totalFailed++;
        }
      }
    }
    console.log(`  ✅ Imported ${cityCount} from ${city.name}`);
  }

  const finalCount = await prisma.business.count();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Done! New: ${String(totalImported).padEnd(6)} | Total in DB: ${String(finalCount).padEnd(10)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
