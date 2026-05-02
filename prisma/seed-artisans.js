/**
 * 9jaSearch — Artisan & Tradesperson Seeder
 * Seeds plumbers, electricians, carpenters, cooks, nannies,
 * dry cleaners, tailors, painters, welders, and more
 * across all major Nigerian cities.
 */

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const CITIES = [
  { name: 'Lagos',         state: 'Lagos',        lat: 6.5244,  lng: 3.3792  },
  { name: 'Abuja',         state: 'FCT',           lat: 9.0579,  lng: 7.4951  },
  { name: 'Port Harcourt', state: 'Rivers',        lat: 4.8156,  lng: 7.0498  },
  { name: 'Kano',          state: 'Kano',          lat: 12.0022, lng: 8.5920  },
  { name: 'Ibadan',        state: 'Oyo',           lat: 7.3775,  lng: 3.9470  },
  { name: 'Enugu',         state: 'Enugu',         lat: 6.4584,  lng: 7.5464  },
  { name: 'Benin City',    state: 'Edo',           lat: 6.3350,  lng: 5.6270  },
  { name: 'Kaduna',        state: 'Kaduna',        lat: 10.5105, lng: 7.4165  },
  { name: 'Owerri',        state: 'Imo',           lat: 5.4851,  lng: 7.0358  },
  { name: 'Warri',         state: 'Delta',         lat: 5.5167,  lng: 5.7500  },
  { name: 'Abeokuta',      state: 'Ogun',          lat: 7.1557,  lng: 3.3451  },
  { name: 'Calabar',       state: 'Cross River',   lat: 4.9757,  lng: 8.3417  },
  { name: 'Uyo',           state: 'Akwa Ibom',     lat: 5.0510,  lng: 7.9328  },
  { name: 'Jos',           state: 'Plateau',       lat: 9.8965,  lng: 8.8583  },
  { name: 'Ilorin',        state: 'Kwara',         lat: 8.4966,  lng: 4.5426  },
  { name: 'Maiduguri',     state: 'Borno',         lat: 11.8333, lng: 13.1500 },
  { name: 'Aba',           state: 'Abia',          lat: 5.1066,  lng: 7.3667  },
  { name: 'Onitsha',       state: 'Anambra',       lat: 6.1667,  lng: 6.7833  },
  { name: 'Sokoto',        state: 'Sokoto',        lat: 13.0622, lng: 5.2339  },
  { name: 'Akure',         state: 'Ondo',          lat: 7.2526,  lng: 5.1986  },
];

// Artisan templates — each will be multiplied across cities
// name uses {city} placeholder
const ARTISAN_TEMPLATES = [
  // ── Plumbing ──
  {
    names: ['{city} Plumbing Services', 'ProPipe Plumbers {city}', '{city} Pipe & Drain Experts',
            'QuickFix Plumbing {city}', 'Master Plumbers {city}'],
    category: 'Plumbing & Pipefitting',
    tags: ['Plumbing', 'Pipe Repair', 'Drainage', 'Borehole', 'Water Supply'],
    description: 'Professional plumbing services including pipe installation, repairs, drainage, and borehole connections. Available 24/7 for emergencies.',
    openingTime: '07:00', closingTime: '19:00',
  },
  // ── Electricians ──
  {
    names: ['{city} Electrical Works', 'PowerLine Electricians {city}', '{city} Wiring Experts',
            'SafeVolt Electrical {city}', 'BrightSpark Electricians {city}'],
    category: 'Electrical Installation',
    tags: ['Electrical', 'Wiring', 'Installation', 'Repairs', 'Solar Wiring'],
    description: 'Licensed electricians for home and commercial wiring, installations, repairs, and solar panel connections. COREN certified.',
    openingTime: '07:00', closingTime: '18:00',
  },
  // ── Carpenters ──
  {
    names: ['{city} Carpentry Works', 'WoodCraft {city}', '{city} Furniture Makers',
            'MasterCraft Carpenters {city}', '{city} Woodwork & Joinery'],
    category: 'Carpenters & Woodwork',
    tags: ['Carpentry', 'Furniture', 'Woodwork', 'Doors', 'Cabinets'],
    description: 'Expert carpenters for furniture making, door fitting, ceiling work, wardrobes, and custom woodwork. Quality craftsmanship guaranteed.',
    openingTime: '08:00', closingTime: '18:00',
  },
  // ── Painters ──
  {
    names: ['{city} Painting Services', 'ColorPro Painters {city}', '{city} Wall Finishing',
            'BrushMaster Painters {city}', 'PaintRight {city}'],
    category: 'Painters & Decorators',
    tags: ['Painting', 'Decorating', 'Wall Finishing', 'Texture', 'Exterior'],
    description: 'Professional painters and decorators for interior and exterior painting, texture finishes, and wall decorations. Quality paints used.',
    openingTime: '07:00', closingTime: '18:00',
  },
  // ── Welders ──
  {
    names: ['{city} Welding & Fabrication', 'IronWorks {city}', '{city} Metal Fabricators',
            'SteelCraft {city}', '{city} Gate & Grill Makers'],
    category: 'Welding & Fabrication',
    tags: ['Welding', 'Fabrication', 'Gates', 'Grills', 'Steel Works'],
    description: 'Professional welders and metal fabricators for gates, grills, roofing frames, and custom metalwork. All types of welding available.',
    openingTime: '08:00', closingTime: '18:00',
  },
  // ── Dry Cleaners ──
  {
    names: ['{city} Dry Cleaners', 'FreshPress Laundry {city}', '{city} Laundry & Dry Clean',
            'CleanStar Laundry {city}', 'SpotFree Dry Cleaners {city}'],
    category: 'Dry Cleaning & Laundry',
    tags: ['Dry Cleaning', 'Laundry', 'Ironing', 'Pressing', 'Delivery'],
    description: 'Professional dry cleaning and laundry services. We handle suits, native wear, bedding, and delicate fabrics. Free pickup and delivery available.',
    openingTime: '08:00', closingTime: '19:00',
  },
  // ── Tailors ──
  {
    names: ['{city} Tailoring Hub', 'StitchPro Tailors {city}', '{city} Fashion Tailors',
            'NativeCraft Tailors {city}', '{city} Bespoke Tailoring'],
    category: 'Tailoring & Fashion Design',
    tags: ['Tailoring', 'Native Wear', 'Ankara', 'Suits', 'Alterations'],
    description: 'Expert tailors for native wear, suits, Ankara, lace, and casual clothing. Alterations and repairs also available. Fast turnaround.',
    openingTime: '09:00', closingTime: '18:00',
  },
  // ── Cooks / Caterers ──
  {
    names: ['{city} Home Cooks & Caterers', 'MamaChef Catering {city}', '{city} Private Chefs',
            'HomeMeal Caterers {city}', '{city} Event Catering Services'],
    category: 'Catering Services',
    tags: ['Catering', 'Home Cooking', 'Private Chef', 'Events', 'Meal Prep'],
    description: 'Professional home cooks and caterers for parties, events, and daily meal preparation. Nigerian and continental dishes. Hygiene certified.',
    openingTime: '07:00', closingTime: '20:00',
  },
  // ── Nannies / Domestic Staff ──
  {
    names: ['{city} Nanny & Domestic Agency', 'TrustCare Nannies {city}', '{city} Home Help Agency',
            'SafeHands Nannies {city}', '{city} Domestic Staff Services'],
    category: 'Home Care & Nursing',
    tags: ['Nanny', 'Babysitter', 'Domestic Staff', 'Housekeeper', 'Caregiver'],
    description: 'Verified nannies, babysitters, housekeepers, and domestic staff. All staff are background-checked and trained. Live-in and live-out available.',
    openingTime: '08:00', closingTime: '18:00',
  },
  // ── AC Technicians ──
  {
    names: ['{city} AC Repairs & Services', 'CoolTech AC {city}', '{city} Air Conditioning Experts',
            'FrostFix AC {city}', 'ArcticCool Services {city}'],
    category: 'AC & Refrigeration Services',
    tags: ['AC Repair', 'Air Conditioning', 'Refrigeration', 'Installation', 'Servicing'],
    description: 'Expert AC and refrigeration technicians. Installation, repairs, gas refilling, and routine servicing for all brands. Same-day service available.',
    openingTime: '08:00', closingTime: '18:00',
  },
  // ── Tilers ──
  {
    names: ['{city} Tiling Services', 'TileKing {city}', '{city} Floor & Wall Tilers',
            'ProTile {city}', '{city} Tiling & Flooring Experts'],
    category: 'Tiling & Flooring',
    tags: ['Tiling', 'Flooring', 'Wall Tiles', 'Floor Tiles', 'Marble'],
    description: 'Professional tilers for floor and wall tiling, marble laying, and flooring installations. Residential and commercial projects.',
    openingTime: '07:00', closingTime: '18:00',
  },
  // ── Fumigators ──
  {
    names: ['{city} Fumigation Services', 'PestAway {city}', '{city} Pest Control Experts',
            'BugFree Fumigation {city}', 'CleanHome Pest Control {city}'],
    category: 'Fumigation & Pest Control',
    tags: ['Fumigation', 'Pest Control', 'Rodents', 'Termites', 'Cockroaches'],
    description: 'Licensed fumigation and pest control services. We eliminate cockroaches, rodents, termites, bedbugs, and all pests. NAFDAC approved chemicals.',
    openingTime: '08:00', closingTime: '17:00',
  },
  // ── Cleaners ──
  {
    names: ['{city} Cleaning Services', 'SparkleClean {city}', '{city} Home & Office Cleaners',
            'ProClean Services {city}', 'ShineRight Cleaners {city}'],
    category: 'Domestic Cleaning Services',
    tags: ['Cleaning', 'Home Cleaning', 'Office Cleaning', 'Deep Clean', 'Post-Construction'],
    description: 'Professional cleaning services for homes, offices, and post-construction sites. Deep cleaning, regular cleaning, and one-off cleans available.',
    openingTime: '07:00', closingTime: '18:00',
  },
  // ── Bricklayers ──
  {
    names: ['{city} Bricklaying & Masonry', 'SolidBuild {city}', '{city} Block Layers',
            'MasterMason {city}', '{city} Construction & Masonry'],
    category: 'Bricklayers & Masons',
    tags: ['Bricklaying', 'Masonry', 'Block Laying', 'Concrete', 'Construction'],
    description: 'Experienced bricklayers and masons for new builds, extensions, and repairs. Block laying, concrete work, and plastering services.',
    openingTime: '07:00', closingTime: '17:00',
  },
  // ── Roofing ──
  {
    names: ['{city} Roofing Contractors', 'RoofPro {city}', '{city} Roof Repairs & Installation',
            'TopShield Roofing {city}', '{city} Roofing Specialists'],
    category: 'Roofing Contractors',
    tags: ['Roofing', 'Roof Repair', 'Roof Installation', 'Waterproofing', 'Gutters'],
    description: 'Professional roofing contractors for new installations, repairs, and waterproofing. All roofing types: zinc, aluminium, clay tiles, and concrete.',
    openingTime: '07:00', closingTime: '17:00',
  },
  // ── Interior Designers ──
  {
    names: ['{city} Interior Design Studio', 'SpaceStyle {city}', '{city} Home Decor & Design',
            'LuxeInteriors {city}', '{city} Interior Decorators'],
    category: 'Interior Design',
    tags: ['Interior Design', 'Home Decor', 'Space Planning', 'Furniture', 'Renovation'],
    description: 'Creative interior designers transforming homes and offices. Full design service from concept to completion. 3D visualisation available.',
    openingTime: '09:00', closingTime: '17:00',
  },
  // ── Solar Installers ──
  {
    names: ['{city} Solar Installation', 'SunPower Solar {city}', '{city} Solar & Inverter Systems',
            'GreenEnergy Solar {city}', '{city} Renewable Energy Solutions'],
    category: 'Solar & Renewable Energy',
    tags: ['Solar', 'Inverter', 'Battery', 'Installation', 'Renewable Energy'],
    description: 'Complete solar energy solutions — panels, inverters, batteries, and installation. Residential and commercial systems. Free site assessment.',
    openingTime: '08:00', closingTime: '17:00',
  },
  // ── Generator Repairs ──
  {
    names: ['{city} Generator Repairs', 'GenFix {city}', '{city} Generator Servicing',
            'PowerFix Generators {city}', '{city} Gen Maintenance Services'],
    category: 'Generator Repairs & Servicing',
    tags: ['Generator Repair', 'Servicing', 'Maintenance', 'Rewinding', 'Spare Parts'],
    description: 'Expert generator repairs and servicing for all brands — Mikano, Perkins, Lister, Honda, Elemax. Routine maintenance and emergency repairs.',
    openingTime: '08:00', closingTime: '18:00',
  },
  // ── Makeup Artists ──
  {
    names: ['{city} Makeup Artists', 'GlowUp MUA {city}', '{city} Bridal Makeup Studio',
            'BeautyGlow {city}', '{city} Professional Makeup'],
    category: 'Makeup Artists',
    tags: ['Makeup', 'Bridal Makeup', 'MUA', 'Gele Tying', 'Beauty'],
    description: 'Professional makeup artists for weddings, events, photoshoots, and everyday glam. Bridal packages available. Home service offered.',
    openingTime: '08:00', closingTime: '20:00',
  },
  // ── Barbers ──
  {
    names: ['{city} Barbing Salon', 'SharpCuts {city}', '{city} Gents Barbers',
            'FreshCut Barbers {city}', '{city} Classic Barbershop'],
    category: 'Barbing Salons',
    tags: ['Barbing', 'Haircut', 'Shaving', 'Beard Trim', 'Grooming'],
    description: 'Professional barbing salon for men and boys. Haircuts, beard trims, shaving, and grooming. Walk-ins welcome.',
    openingTime: '08:00', closingTime: '20:00',
  },
  // ── Dispatch Riders ──
  {
    names: ['{city} Dispatch Riders', 'SpeedRun Delivery {city}', '{city} Bike Courier Services',
            'FastTrack Dispatch {city}', '{city} Same-Day Delivery'],
    category: 'Dispatch Riders',
    tags: ['Dispatch', 'Delivery', 'Courier', 'Same Day', 'Bike Delivery'],
    description: 'Fast and reliable dispatch riders for same-day delivery of documents, packages, food, and goods across the city.',
    openingTime: '07:00', closingTime: '21:00',
  },
  // ── Driving Schools ──
  {
    names: ['{city} Driving School', 'SafeDrive Academy {city}', '{city} Learners Driving School',
            'RoadMaster Driving {city}', '{city} Auto Driving Academy'],
    category: 'Driving Schools',
    tags: ['Driving School', 'Learners', 'FRSC', 'Driving Lessons', 'License'],
    description: 'Certified driving school with experienced instructors. Manual and automatic vehicles. FRSC-approved. Flexible lesson schedules.',
    openingTime: '08:00', closingTime: '17:00',
  },
  // ── Event Planners ──
  {
    names: ['{city} Event Planners', 'GrandAffair Events {city}', '{city} Party Planners',
            'CelebratePro {city}', '{city} Event Management'],
    category: 'Event Planning & Management',
    tags: ['Event Planning', 'Weddings', 'Birthdays', 'Corporate Events', 'Decoration'],
    description: 'Full-service event planning and management for weddings, birthdays, corporate events, and parties. Decoration, catering, and entertainment packages.',
    openingTime: '09:00', closingTime: '18:00',
  },
  // ── Security Guards ──
  {
    names: ['{city} Security Services', 'GuardPro Security {city}', '{city} Armed Security',
            'ShieldForce Security {city}', '{city} Security & Surveillance'],
    category: 'Security Companies',
    tags: ['Security', 'Guards', 'CCTV', 'Surveillance', 'Armed Escort'],
    description: 'Licensed security company providing armed and unarmed guards, CCTV installation, and access control for homes and businesses.',
    openingTime: '00:00', closingTime: '23:59',
  },
  // ── Landscapers ──
  {
    names: ['{city} Landscaping & Gardening', 'GreenThumb {city}', '{city} Garden Services',
            'LawnPro {city}', '{city} Landscape Designers'],
    category: 'Landscaping & Gardening',
    tags: ['Landscaping', 'Gardening', 'Lawn Care', 'Tree Trimming', 'Garden Design'],
    description: 'Professional landscaping and gardening services. Lawn mowing, tree trimming, garden design, and maintenance contracts available.',
    openingTime: '07:00', closingTime: '17:00',
  },
  // ── Photographers ──
  {
    names: ['{city} Photography Studio', 'SnapPro Photos {city}', '{city} Event Photographers',
            'LensArt Photography {city}', '{city} Wedding Photographers'],
    category: 'Photography & Video',
    tags: ['Photography', 'Videography', 'Wedding', 'Events', 'Portrait'],
    description: 'Professional photographers and videographers for weddings, events, portraits, and commercial shoots. Drone photography available.',
    openingTime: '09:00', closingTime: '18:00',
  },
  // ── Tutors ──
  {
    names: ['{city} Home Tutors', 'LearnRight Tutors {city}', '{city} Lesson Teachers',
            'BrightMind Tutors {city}', '{city} WAEC & JAMB Tutors'],
    category: 'Private Tutors & Lesson Teachers',
    tags: ['Tutoring', 'Home Lessons', 'WAEC', 'JAMB', 'Primary School'],
    description: 'Qualified home tutors for primary, secondary, and university students. WAEC, JAMB, and NECO preparation. All subjects covered.',
    openingTime: '08:00', closingTime: '19:00',
  },
  // ── Movers ──
  {
    names: ['{city} Moving & Relocation', 'EasyMove {city}', '{city} House Movers',
            'SafeMove Logistics {city}', '{city} Packing & Moving Services'],
    category: 'Moving & Relocation Services',
    tags: ['Moving', 'Relocation', 'Packing', 'House Move', 'Office Move'],
    description: 'Professional moving and relocation services. Packing, loading, transportation, and unpacking. Careful handling of all items.',
    openingTime: '07:00', closingTime: '18:00',
  },
];

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 90);
}

function jitter(coord, range = 0.05) {
  return coord + (Math.random() - 0.5) * range;
}

function randomPhone() {
  const prefixes = ['0803', '0806', '0810', '0813', '0816', '0703', '0706', '0802', '0805', '0808'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000000 + Math.random() * 8999999);
  return `+234${prefix.slice(1)}${num}`;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   9jaSearch — Artisan & Tradesperson Seeder          ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const existing = await p.business.findMany({ select: { slug: true } });
  const slugSet = new Set(existing.map(b => b.slug));
  console.log(`📦 ${slugSet.size} businesses already in database\n`);

  let total = 0;

  for (const city of CITIES) {
    let cityCount = 0;

    for (const template of ARTISAN_TEMPLATES) {
      // Pick 2-3 random names from the template for this city
      const shuffled = [...template.names].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);

      for (const nameTemplate of picks) {
        const name = nameTemplate.replace(/{city}/g, city.name);
        const baseSlug = slugify(name);

        // Make unique slug
        let slug = baseSlug;
        let i = 2;
        while (slugSet.has(slug)) slug = `${baseSlug}-${i++}`;
        slugSet.add(slug);

        const emailSlug = slugify(name).replace(/-/g, '').slice(0, 20);
        const phone = randomPhone();

        try {
          await p.business.create({
            data: {
              name,
              slug,
              category: template.category,
              description: template.description,
              address: `${name}, ${city.name}`,
              city: city.name,
              state: city.state,
              phone,
              email: `info@${emailSlug}.ng`,
              lat: jitter(city.lat),
              lng: jitter(city.lng),
              openingTime: template.openingTime,
              closingTime: template.closingTime,
              isActive: true,
              isVerified: false,
              status: 'APPROVED',
              tier: 'FREE',
              rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
              reviewCount: Math.floor(Math.random() * 30),
              tags: JSON.stringify(template.tags),
              images: '[]',
            }
          });
          cityCount++;
          total++;
        } catch (err) {
          if (!err.message.includes('Unique constraint')) {
            console.warn(`  ⚠️  ${name}: ${err.message}`);
          }
        }
      }
    }

    console.log(`  ✅ ${city.name}: +${cityCount} artisans`);
  }

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Done! Total artisans added: ${String(total).padEnd(22)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main().catch(console.error).finally(() => p.$disconnect());
