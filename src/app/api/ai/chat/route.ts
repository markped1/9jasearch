import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNigeriaKnowledge } from '@/lib/nigeriaKnowledge';

export const dynamic = 'force-dynamic';

// ── Nigerian cities for location extraction ──────────────────────
const NIGERIAN_CITIES = [
  'Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Benin City',
  'Kaduna','Owerri','Warri','Abeokuta','Calabar','Uyo','Maiduguri','Jos',
  'Ilorin','Asaba','Akure','Osogbo','Sokoto','Katsina','Zaria','Aba',
  'Onitsha','Makurdi','Yola','Lokoja','Bauchi','Gombe','Yenagoa','Minna',
  'Awka','Nnewi','Abakaliki','Umuahia','Lafia','Keffi','Ogbomosho',
  'Ile-Ife','Ilesha','Sagamu','Ijebu Ode','Ado Ekiti','Owo','Ondo',
  // Lagos areas
  'Ikeja','Lekki','Victoria Island','Surulere','Yaba','Mushin','Festac',
  'Apapa','Ikorodu','Badagry','Epe','Ajah','Gbagada','Maryland','Isolo',
  'Oshodi','Agege','Iyana Ipaja','Ketu','Ojota','Berger',
  // Abuja areas
  'Wuse','Maitama','Garki','Asokoro','Gwarinpa','Kubwa','Jabi','Utako',
  'Wuse 2','Central Area','Lugbe','Gwagwalada',
  // PH areas
  'GRA','Rumuola','Trans Amadi','Diobu',
];

// ── Category keyword map ─────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  hotel: 'Hotels & Resorts', hotels: 'Hotels & Resorts',
  lodge: 'Hotels & Resorts', accommodation: 'Hotels & Resorts',
  restaurant: 'Restaurants & Cafes', restaurants: 'Restaurants & Cafes',
  food: 'Restaurants & Cafes', eat: 'Restaurants & Cafes', eatery: 'Restaurants & Cafes',
  'fast food': 'Fast Food & Bukas', buka: 'Fast Food & Bukas',
  mechanic: 'Auto Repairs & Mechanics', mechanics: 'Auto Repairs & Mechanics',
  'car repair': 'Auto Repairs & Mechanics',
  hospital: 'Hospitals & Clinics', clinic: 'Hospitals & Clinics',
  doctor: 'General Practitioners (GP)', doctors: 'General Practitioners (GP)',
  pharmacy: 'Pharmacies & Chemists', chemist: 'Pharmacies & Chemists',
  bank: 'Commercial Banks', banks: 'Commercial Banks',
  school: 'Nursery & Primary Schools', university: 'Universities & Polytechnics',
  supermarket: 'Supermarkets & Hypermarkets', market: 'Open Markets & Stalls',
  church: 'Churches', mosque: 'Mosques',
  salon: 'Beauty Salons & Hair Salons', barber: 'Barbing Salons',
  gym: 'Gyms & Fitness Centres', fitness: 'Gyms & Fitness Centres',
  plumber: 'Plumbing & Pipefitting', electrician: 'Electrical Installation',
  lawyer: 'Legal Services & Law Firms', solicitor: 'Legal Services & Law Firms',
  petrol: 'Filling Stations & Petrol Stations', fuel: 'Filling Stations & Petrol Stations',
  filling: 'Filling Stations & Petrol Stations',
  solar: 'Solar & Renewable Energy', generator: 'Generator Sales',
  tailor: 'Tailoring & Fashion Design', seamstress: 'Tailoring & Fashion Design',
  carpenter: 'Carpenters & Woodwork', plumbing: 'Plumbing & Pipefitting',
  security: 'Security Companies', cleaning: 'Domestic Cleaning Services',
  catering: 'Catering Services', caterer: 'Catering Services',
  photographer: 'Photography & Video', photography: 'Photography & Video',
  suya: 'Suya & Pepper Soup Spots', bakery: 'Bakery & Confectionery',
  pharmacy2: 'Pharmacies & Chemists', spa: 'Spas & Wellness Centres',
  massage: 'Massage Therapy', delivery: 'Dispatch Riders',
  logistics: 'Logistics & Courier Services', courier: 'Logistics & Courier Services',
  'real estate': 'Real Estate Agents', property: 'Real Estate Agents',
  accountant: 'Accounting & Auditing', accounting: 'Accounting & Auditing',
  // Products people want to buy
  cement: 'Building Materials', 'iron rod': 'Building Materials',
  'iron rods': 'Building Materials', 'roofing sheet': 'Roofing Materials',
  zinc: 'Roofing Materials', block: 'Block Industry', blocks: 'Block Industry',
  tile: 'Tiles & Flooring', tiles: 'Tiles & Flooring', paint: 'Paints & Coatings',
  wood: 'Carpenters & Woodwork', timber: 'Carpenters & Woodwork',
  pipe: 'Plumbing Materials', pipes: 'Plumbing Materials',
  wire: 'Electrical Materials', cables: 'Electrical Materials',
  door: 'Doors & Windows', doors: 'Doors & Windows',
  window: 'Doors & Windows', windows: 'Doors & Windows',
  toilet: 'Sanitary Wares', bathroom: 'Sanitary Wares',
  rice: 'Farm Produce Sellers', beans: 'Farm Produce Sellers',
  yam: 'Farm Produce Sellers', tomato: 'Fresh Vegetable Sellers',
  tomatoes: 'Fresh Vegetable Sellers', pepper: 'Fresh Vegetable Sellers',
  fish: 'Fresh Fish Sellers', chicken: 'Chicken & Poultry Sellers',
  meat: 'Fresh Meat Sellers', egg: 'Egg Sellers', eggs: 'Egg Sellers',
  'palm oil': 'Palm Oil Sellers', crayfish: 'Crayfish & Stockfish Sellers',
  phone: 'Mobile Phone Shops', laptop: 'Computer Shops',
  fridge: 'Household Appliances', freezer: 'Household Appliances',
  'washing machine': 'Household Appliances', 'air conditioner': 'AC & Refrigeration Services',
  tyre: 'Tyre Services & Vulcanisers', tyres: 'Tyre Services & Vulcanisers',
  'spare parts': 'Car Spare Parts', 'spare part': 'Car Spare Parts',
  diesel: 'Filling Stations & Petrol Stations',
  gas: 'Gas & Cooking Fuel', 'cooking gas': 'Gas & Cooking Fuel',
  'solar panel': 'Solar & Renewable Energy', inverter: 'Inverter & Battery Sales',
  stationery: 'Stationery & Art Supplies', book: 'Bookshops', books: 'Bookshops',
  photocopy: 'Business Centres (Xerox & Printing)', xerox: 'Business Centres (Xerox & Printing)',
  mattress: 'Bedding & Mattresses', furniture: 'Furniture & Decor',
  drug: 'Pharmacies & Chemists', drugs: 'Pharmacies & Chemists',
  medicine: 'Pharmacies & Chemists', fertilizer: 'Fertiliser & Agro-Chemicals',
  'building material': 'Building Materials', 'building materials': 'Building Materials',
};

// ── Extract city from message ────────────────────────────────────
function extractCity(msg: string): string | null {
  const lower = msg.toLowerCase();
  const sorted = [...NIGERIAN_CITIES].sort((a, b) => b.length - a.length);
  for (const city of sorted) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  return null;
}

// ── Extract category from message ───────────────────────────────
function extractCategory(msg: string): string | null {
  const lower = msg.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return null;
}

// ── Detect intent ────────────────────────────────────────────────
function detectIntent(msg: string): string {
  const lower = msg.toLowerCase();
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|yo)\b/.test(lower)) return 'greeting';
  if (/\b(recommend|suggest|best|top|good|nice|popular|rated)\b/.test(lower)) return 'recommend';
  if (/\b(find|search|looking for|where|show me|i need|i want|get me|locate)\b/.test(lower)) return 'search';
  if (/\b(how|what|who|when|why|tell me about|explain|describe)\b/.test(lower)) return 'info';
  if (/\b(add|list|register|submit|put)\b.*\b(business|company|shop|store)\b/.test(lower)) return 'add_business';
  if (/\b(price|cost|how much|fee|charge|rate)\b/.test(lower)) return 'pricing';
  if (/\b(contact|call|phone|whatsapp|email|reach)\b/.test(lower)) return 'contact';
  if (/\b(open|closed|hours|time|when.*open)\b/.test(lower)) return 'hours';
  if (/\b(near me|close to me|around me|nearby)\b/.test(lower)) return 'nearby';
  if (/\b(thank|thanks|thank you|appreciate)\b/.test(lower)) return 'thanks';
  if (/\b(bye|goodbye|see you|later|exit)\b/.test(lower)) return 'bye';
  return 'search'; // default to search
}

// ── Search businesses ────────────────────────────────────────────
async function searchBusinesses(query: string, city: string | null, category: string | null, limit = 5) {
  const where: any = { isActive: true };
  const conditions: any[] = [];

  if (category) {
    conditions.push({ category: { contains: category } });
  }
  if (query && query.length > 2) {
    conditions.push(
      { name: { contains: query } },
      { category: { contains: query } },
      { description: { contains: query } },
      { tags: { contains: query } }
    );
  }
  if (conditions.length > 0) where.OR = conditions;

  if (city) {
    where.city = { contains: city };
  }

  return prisma.business.findMany({
    where,
    take: limit,
    orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }],
    select: {
      id: true, name: true, slug: true, category: true,
      city: true, rating: true, phone: true,
      openingTime: true, closingTime: true,
      images: true, logo: true, address: true,
      isVerified: true,
    }
  });
}

// ── Format business list as text ─────────────────────────────────
function formatBusinessList(businesses: any[], intro: string): string {
  if (businesses.length === 0) return '';
  const list = businesses.map((b, i) =>
    `${i + 1}. **${b.name}**${b.isVerified ? ' ✅' : ''}\n   📍 ${b.address || b.city}\n   ⭐ ${b.rating?.toFixed(1) || 'N/A'} | 📞 ${b.phone}`
  ).join('\n\n');
  return `${intro}\n\n${list}`;
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ text: 'Please type a message.', type: 'text' });
    }

    const msg = message.trim();
    const lower = msg.toLowerCase();
    const intent = detectIntent(msg);
    const city = extractCity(msg);
    const category = extractCategory(msg);

    // ── Greeting ──────────────────────────────────────────────────
    if (intent === 'greeting') {
      return NextResponse.json({
        text: `Hello! 👋 Welcome to 9jaSearch — Nigeria's business search engine.\n\nI can help you:\n• 🏨 Find hotels, restaurants, mechanics, hospitals\n• 📍 Search by city — "hotels in Ikeja"\n• ⭐ Get recommendations — "best restaurant in Lekki"\n• ℹ️ Answer questions about businesses\n\nWhat are you looking for today?`,
        type: 'text'
      });
    }

    // ── Thanks ────────────────────────────────────────────────────
    if (intent === 'thanks') {
      return NextResponse.json({ text: "You're welcome! 😊 Is there anything else I can help you find?", type: 'text' });
    }

    // ── Bye ───────────────────────────────────────────────────────
    if (intent === 'bye') {
      return NextResponse.json({ text: "Goodbye! 👋 Come back anytime you need to find a business in Nigeria.", type: 'text' });
    }

    // ── Add business ──────────────────────────────────────────────
    if (intent === 'add_business') {
      return NextResponse.json({
        text: `To list your business on 9jaSearch:\n\n1. Click **"+ Add Business"** at the top of the page\n2. Fill in your business details (name, category, address, phone)\n3. Verify your identity via bank account\n4. Your listing goes live after review\n\nIt's free to list! 🎉`,
        type: 'text'
      });
    }

    // ── Pricing ───────────────────────────────────────────────────
    if (intent === 'pricing') {
      return NextResponse.json({
        text: `9jaSearch listing plans:\n\n🆓 **Free** — Basic listing, shows in search\n🥇 **Gold** — Featured placement, priority in results\n💎 **Platinum** — Top of search, verified badge, analytics\n\nVisit our [Pricing page](/pricing) for full details.`,
        type: 'text'
      });
    }

    // ── Nearby ────────────────────────────────────────────────────
    if (intent === 'nearby') {
      const cleanQuery = lower.replace(/near me|close to me|around me|nearby/g, '').trim();
      const nearCategory = extractCategory(cleanQuery);
      return NextResponse.json({
        text: `To find businesses near you, use the 📍 button on the search bar — it uses your GPS location to find the closest ${nearCategory || 'businesses'}.\n\nOr type your area, e.g. "${cleanQuery || 'hotels'} in Ikeja"`,
        type: 'text'
      });
    }

    // ── Recommend / Search ────────────────────────────────────────
    if (intent === 'recommend' || intent === 'search') {
      // Strip purchase intent words
      const intentWords = /\b(buy|purchase|get|find|where to|where can i|i want|i need|looking for|need to buy|want to buy|how to get|price of|cost of)\b/gi;
      let cleanQuery = msg.replace(intentWords, ' ').replace(/\s+/g, ' ').trim();

      // Use category if found, otherwise use cleaned query
      const searchTerm = category || cleanQuery;
      const businesses = await searchBusinesses(cleanQuery, city, category, 5);

      if (businesses.length > 0) {
        const locationStr = city ? ` in ${city}` : '';
        const categoryStr = category || cleanQuery;
        const intro = intent === 'recommend'
          ? `Here are my top recommendations for **${categoryStr}${locationStr}** ⭐`
          : `I found ${businesses.length} result${businesses.length > 1 ? 's' : ''} for **${categoryStr}${locationStr}**:`;

        return NextResponse.json({
          text: intro,
          results: businesses,
          type: 'results'
        });
      }

      // No results — try broader search
      if (city && !category) {
        const broader = await searchBusinesses('', city, null, 5);
        if (broader.length > 0) {
          return NextResponse.json({
            text: `I couldn't find an exact match, but here are popular businesses in **${city}**:`,
            results: broader,
            type: 'results'
          });
        }
      }

      // Still nothing
      return NextResponse.json({
        text: `I couldn't find "${cleanQuery}"${city ? ` in ${city}` : ''} in our database yet.\n\n💡 Try:\n• A broader term (e.g. "hotel" instead of a specific name)\n• A different city\n• [Search the full directory](/search?q=${encodeURIComponent(cleanQuery)}${city ? `&location=${city}` : ''})`,
        type: 'text'
      });
    }

    // ── Info / General questions ──────────────────────────────────
    if (intent === 'info') {
      // Check Nigeria knowledge base FIRST with the full message
      const knowledge = getNigeriaKnowledge(msg);
      if (knowledge) {
        return NextResponse.json({ text: knowledge, type: 'text' });
      }

      // What is 9jaSearch?
      if (lower.includes('9jasearch') || lower.includes('this site') || lower.includes('this app') || lower.includes('this platform')) {
        return NextResponse.json({
          text: `**9jaSearch** is Nigeria's business search engine 🇳🇬\n\nWe help you find verified businesses, services, and professionals across all 36 states.\n\n• 8,000+ businesses listed\n• Search by name, category, or city\n• Real addresses, phone numbers & maps\n• Reviews and ratings\n• Free to search, free to list\n\nType what you're looking for and I'll find it!`,
          type: 'text'
        });
      }

      // How to search
      if (lower.includes('how') && (lower.includes('search') || lower.includes('find') || lower.includes('use'))) {
        return NextResponse.json({
          text: `**How to search on 9jaSearch:**\n\n1. Type what you need in the search bar\n2. Add a city for local results\n   e.g. *"hotel in Ikeja"* or *"mechanic in Abuja"*\n3. Use the 📍 button to find businesses near you\n4. Filter by rating, verified status, or category\n\nYou can also ask me directly! 😊`,
          type: 'text'
        });
      }

      // If asking about a specific business by name
      if (msg.length > 3) {
        const businesses = await searchBusinesses(msg, city, null, 3);
        if (businesses.length > 0) {
          return NextResponse.json({
            text: `Here's what I found for **"${msg}"**:`,
            results: businesses,
            type: 'results'
          });
        }
      }

      return NextResponse.json({
        text: `I'm not sure about that specific question, but I can help you find businesses in Nigeria.\n\nTry asking:\n• "Find a hotel in Lagos"\n• "Best mechanic in Abuja"\n• "Recommend a restaurant in Lekki"\n• "Hospitals in Port Harcourt"`,
        type: 'text'
      });
    }

    // ── Default fallback — try knowledge base then search ────────
    const knowledge = getNigeriaKnowledge(msg);
    if (knowledge) {
      return NextResponse.json({ text: knowledge, type: 'text' });
    }

    const businesses = await searchBusinesses(msg, city, category, 5);
    if (businesses.length > 0) {
      return NextResponse.json({
        text: `Here's what I found for **"${msg}"**:`,
        results: businesses,
        type: 'results'
      });
    }

    return NextResponse.json({
      text: `I'm not sure how to help with that. Try asking me to find a specific business or service, like:\n\n• "Hotels in Ikeja"\n• "Best mechanic in Lagos"\n• "Pharmacy near Wuse 2"`,
      type: 'text'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      text: 'Sorry, I ran into an error. Please try again.',
      type: 'text'
    });
  }
}
