const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const DEMO_BUSINESSES = [
    // Lagos
    {
        name: 'Eko Hotels & Suites',
        category: 'Hotels & Resorts',
        description: 'Luxury 5-star hotel on Victoria Island, Lagos. Featuring world-class amenities, pools, spa, and multiple restaurants.',
        address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 800 123 4567', email: 'info@ekohotels.com', website: 'https://ekohotels.com',
        whatsapp: '+2348001234567',
        rating: 4.8, reviewCount: 1250,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '00:00', closingTime: '23:59',
        tags: JSON.stringify(['Luxury', 'Pool', 'Spa', 'Conference', 'Restaurant']),
        tier: 'PLATINUM', isFeatured: true,
        lat: 6.4253, lng: 3.4411
    },
    {
        name: 'Chicken Republic Victoria Island',
        category: 'Fast Food & Bukas',
        description: 'Nigeria\'s favourite fast food chain. Serving crispy chicken, burgers, rice, and more.',
        address: '23 Adeola Odeku Street, Victoria Island',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 800 777 7777', email: 'vi@chicken-republic.com',
        rating: 4.5, reviewCount: 890,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '09:00', closingTime: '21:00',
        tags: JSON.stringify(['Dine-in', 'Takeaway', 'Delivery', 'Fast Food']),
        tier: 'GOLD', isFeatured: false,
        lat: 6.4281, lng: 3.4219
    },
    {
        name: 'Zenith Bank HQ',
        category: 'Commercial Banks',
        description: 'Zenith Bank Plc headquarters. Full banking services, ATM, loans, and corporate banking.',
        address: 'Plot 84 Ajose Adeogun Street, Victoria Island',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 1 278 7000', email: 'corporate@zenithbank.com', website: 'https://zenithbank.com',
        rating: 4.6, reviewCount: 2100,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '08:00', closingTime: '16:00',
        tags: JSON.stringify(['Banking', 'ATM', 'Loans', 'Corporate Banking']),
        tier: 'PLATINUM', isFeatured: true,
        lat: 6.4281, lng: 3.4376
    },
    {
        name: 'FixIt Auto Mechanics',
        category: 'Auto Repairs & Mechanics',
        description: 'Expert auto mechanics specialising in Japanese and European cars. Engine overhaul, diagnostics, and servicing.',
        address: 'Ladipo Market Road, Mushin',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 700 227 3498', email: 'fixit@ladipo.ng',
        rating: 4.0, reviewCount: 156,
        isVerified: false, isActive: true, status: 'APPROVED',
        openingTime: '08:00', closingTime: '18:00',
        tags: JSON.stringify(['Car Repairs', 'Engine Overhaul', 'Diagnostics']),
        tier: 'FREE', isFeatured: false,
        lat: 6.5482, lng: 3.3404
    },
    {
        name: 'Domino\'s Pizza Lekki',
        category: 'Pizza & Pasta Restaurants',
        description: 'Fresh hot pizza delivered to your door. Order online or dine in at our Lekki Phase 1 outlet.',
        address: '4 Admiralty Way, Lekki Phase 1',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 700 366 6467', email: 'lekki@dominos.ng', website: 'https://dominos.ng',
        rating: 4.3, reviewCount: 540,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '10:00', closingTime: '22:00',
        tags: JSON.stringify(['Pizza', 'Delivery', 'Dine-in', 'Online Order']),
        tier: 'GOLD', isFeatured: false,
        lat: 6.4474, lng: 3.4553
    },
    {
        name: 'Balogun Market Traders Association',
        category: 'Open Markets & Stalls',
        description: 'Lagos\'s largest open market. Fabrics, electronics, food, clothing, and everything in between.',
        address: 'Balogun Street, Lagos Island',
        city: 'Lagos', state: 'Lagos',
        phone: '+234 802 345 6789', email: 'info@balogunmarket.ng',
        rating: 4.1, reviewCount: 3200,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '07:00', closingTime: '18:00',
        tags: JSON.stringify(['Market', 'Fabrics', 'Electronics', 'Wholesale']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 6.4530, lng: 3.3958
    },

    // Abuja
    {
        name: 'Transcorp Hilton Abuja',
        category: 'Hotels & Resorts',
        description: 'Abuja\'s premier 5-star hotel. Business and leisure facilities, multiple restaurants, and conference centres.',
        address: '1 Aguiyi Ironsi Street, Maitama',
        city: 'Abuja', state: 'FCT',
        phone: '+234 9 461 3000', email: 'reservations@transcorphilton.com', website: 'https://transcorphilton.com',
        rating: 4.7, reviewCount: 1800,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '00:00', closingTime: '23:59',
        tags: JSON.stringify(['Luxury', 'Conference', 'Pool', 'Spa', 'Restaurant']),
        tier: 'PLATINUM', isFeatured: true,
        lat: 9.0820, lng: 7.4891
    },
    {
        name: 'Chicken Republic Wuse 2',
        category: 'Fast Food & Bukas',
        description: 'Crispy chicken, burgers, and rice meals. Quick service and delivery available.',
        address: 'Adetokunbo Ademola Crescent, Wuse 2',
        city: 'Abuja', state: 'FCT',
        phone: '+234 800 777 7778', email: 'wuse2@chicken-republic.com',
        rating: 4.4, reviewCount: 670,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '09:00', closingTime: '21:00',
        tags: JSON.stringify(['Fast Food', 'Dine-in', 'Takeaway']),
        tier: 'GOLD', isFeatured: false,
        lat: 9.0765, lng: 7.4985
    },
    {
        name: 'Wuse Market',
        category: 'Open Markets & Stalls',
        description: 'Abuja\'s busiest market. Fresh produce, clothing, electronics, and household goods.',
        address: 'Wuse Zone 5',
        city: 'Abuja', state: 'FCT',
        phone: '+234 803 456 7890', email: 'info@wusemarket.ng',
        rating: 4.0, reviewCount: 980,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '07:00', closingTime: '18:00',
        tags: JSON.stringify(['Market', 'Fresh Produce', 'Clothing', 'Electronics']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 9.0579, lng: 7.4951
    },

    // Port Harcourt
    {
        name: 'Novotel Port Harcourt',
        category: 'Hotels & Resorts',
        description: 'Modern 4-star hotel in the heart of Port Harcourt. Business facilities, pool, and restaurant.',
        address: '1 Stadium Road, Port Harcourt',
        city: 'Port Harcourt', state: 'Rivers',
        phone: '+234 84 230 000', email: 'reservations@novotelph.com',
        rating: 4.5, reviewCount: 720,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '00:00', closingTime: '23:59',
        tags: JSON.stringify(['Hotel', 'Pool', 'Business', 'Restaurant']),
        tier: 'PLATINUM', isFeatured: true,
        lat: 4.8156, lng: 7.0498
    },
    {
        name: 'Mama Nkechi Kitchen',
        category: 'Restaurants & Cafes',
        description: 'Authentic Igbo cuisine. Ofe onugbu, oha soup, egusi, and fresh catfish pepper soup.',
        address: '15 Douglas Road',
        city: 'Owerri', state: 'Imo',
        phone: '+234 901 234 5678', email: 'mama.nkechi@food.ng',
        rating: 4.9, reviewCount: 320,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '08:00', closingTime: '20:00',
        tags: JSON.stringify(['Local Food', 'Igbo Cuisine', 'Catering', 'Pepper Soup']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 5.4851, lng: 7.0358
    },

    // Kano
    {
        name: 'Kano Suya Palace',
        category: 'Suya & Pepper Soup Spots',
        description: 'The best suya in Kano. Grilled beef, ram, and chicken suya with fresh tomatoes and onions.',
        address: 'Bompai Road, Nassarawa GRA',
        city: 'Kano', state: 'Kano',
        phone: '+234 803 111 2222', email: 'suyapalace@kano.ng',
        rating: 4.8, reviewCount: 450,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '16:00', closingTime: '23:00',
        tags: JSON.stringify(['Suya', 'Grilled Meat', 'Takeaway', 'Northern Food']),
        tier: 'GOLD', isFeatured: false,
        lat: 12.0022, lng: 8.5920
    },
    {
        name: 'Kano Central Mosque',
        category: 'Mosques',
        description: 'One of the largest mosques in West Africa. Friday prayers, Islamic education, and community services.',
        address: 'Emir\'s Palace Road, Kano City',
        city: 'Kano', state: 'Kano',
        phone: '+234 64 630 000', email: 'info@kanocentralmosque.ng',
        rating: 4.9, reviewCount: 5600,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '05:00', closingTime: '21:00',
        tags: JSON.stringify(['Mosque', 'Islamic Centre', 'Friday Prayers', 'Education']),
        tier: 'FREE', isFeatured: false,
        lat: 12.0022, lng: 8.5919
    },

    // Ibadan
    {
        name: 'Bodija Market',
        category: 'Open Markets & Stalls',
        description: 'Ibadan\'s largest food market. Fresh vegetables, meat, fish, and farm produce at wholesale prices.',
        address: 'Bodija Market Road',
        city: 'Ibadan', state: 'Oyo',
        phone: '+234 805 678 9012', email: 'info@bodijamarket.ng',
        rating: 4.2, reviewCount: 1100,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '06:00', closingTime: '18:00',
        tags: JSON.stringify(['Market', 'Fresh Produce', 'Wholesale', 'Farm Produce']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 7.4167, lng: 3.9000
    },
    {
        name: 'University of Ibadan Teaching Hospital',
        category: 'Hospitals & Clinics',
        description: 'Premier teaching hospital in Nigeria. Specialist care, surgery, diagnostics, and emergency services.',
        address: 'Queen Elizabeth Road, Ibadan',
        city: 'Ibadan', state: 'Oyo',
        phone: '+234 2 241 0088', email: 'info@uith.edu.ng', website: 'https://uith.edu.ng',
        rating: 4.3, reviewCount: 890,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '00:00', closingTime: '23:59',
        tags: JSON.stringify(['Hospital', 'Teaching Hospital', 'Emergency', 'Specialist']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 7.3964, lng: 3.9017
    },

    // Enugu
    {
        name: 'Coal City Pharmacy',
        category: 'Pharmacies & Chemists',
        description: 'Licensed pharmacy with a wide range of drugs, supplements, and medical supplies. Qualified pharmacists on duty.',
        address: '12 Ogui Road',
        city: 'Enugu', state: 'Enugu',
        phone: '+234 42 256 789', email: 'coalcitypharmacy@enugu.ng',
        rating: 4.6, reviewCount: 230,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '08:00', closingTime: '20:00',
        tags: JSON.stringify(['Pharmacy', 'Drugs', 'Supplements', 'Medical Supplies']),
        tier: 'GOLD', isFeatured: false,
        lat: 6.4584, lng: 7.5464
    },

    // Benin City
    {
        name: 'Benin City Solar Solutions',
        category: 'Solar & Renewable Energy',
        description: 'Complete solar installation services. Panels, inverters, batteries, and maintenance for homes and businesses.',
        address: '45 Akpakpava Road',
        city: 'Benin City', state: 'Edo',
        phone: '+234 806 789 0123', email: 'info@beninsolarsolutions.ng',
        rating: 4.7, reviewCount: 180,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '08:00', closingTime: '17:00',
        tags: JSON.stringify(['Solar', 'Inverter', 'Battery', 'Renewable Energy', 'Installation']),
        tier: 'GOLD', isFeatured: false,
        lat: 6.3350, lng: 5.6270
    },

    // Kaduna
    {
        name: 'Kaduna Tailoring Hub',
        category: 'Tailoring & Fashion Design',
        description: 'Expert tailors for native wear, suits, and casual clothing. Ankara, lace, and kaftan specialists.',
        address: '7 Ahmadu Bello Way',
        city: 'Kaduna', state: 'Kaduna',
        phone: '+234 807 890 1234', email: 'tailoringhub@kaduna.ng',
        rating: 4.5, reviewCount: 290,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '09:00', closingTime: '18:00',
        tags: JSON.stringify(['Tailoring', 'Native Wear', 'Ankara', 'Suits', 'Fashion']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 10.5105, lng: 7.4165
    },

    // Dangote
    {
        name: 'Dangote Cement Depot Lokoja',
        category: 'Building Materials',
        description: 'Authorised Dangote cement distributor. Bulk and retail supply for construction projects.',
        address: 'Obajana Plant Road',
        city: 'Lokoja', state: 'Kogi',
        phone: '+234 810 000 0000', email: 'depot@dangote.com',
        rating: 4.2, reviewCount: 45,
        isVerified: true, isActive: true, status: 'APPROVED',
        openingTime: '07:00', closingTime: '17:00',
        tags: JSON.stringify(['Cement', 'Building Materials', 'Wholesale', 'Construction']),
        tier: 'VERIFIED', isFeatured: false,
        lat: 7.8004, lng: 6.7436
    },
];

async function main() {
    console.log('🌱 Starting seed...');

    // ── 1. Admin account ──────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@Eagle2024', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@eaglesearch.ng' },
        update: { password: adminPassword, role: 'ADMIN', name: 'Eagle Admin' },
        create: {
            email: 'admin@eaglesearch.ng',
            name: 'Eagle Admin',
            password: adminPassword,
            role: 'ADMIN',
        }
    });
    console.log('✅ Admin created:', admin.email);

    // ── 2. Community user for reviews ─────────────────────────────────
    const communityUser = await prisma.user.upsert({
        where: { email: 'community@eaglesearch.ng' },
        update: {},
        create: {
            email: 'community@eaglesearch.ng',
            name: 'Community Member',
            role: 'USER'
        }
    });
    console.log('✅ Community user created:', communityUser.id);

    // ── 3. Businesses ─────────────────────────────────────────────────
    for (const b of DEMO_BUSINESSES) {
        const slug = b.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const business = await prisma.business.upsert({
            where: { slug },
            update: {
                isActive: true,
                status: 'APPROVED',
                rating: b.rating,
                reviewCount: b.reviewCount,
                isFeatured: b.isFeatured,
                sponsoredUntil: b.isFeatured
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    : null,
            },
            create: {
                name: b.name,
                slug,
                category: b.category,
                description: b.description,
                address: b.address,
                city: b.city,
                state: b.state,
                phone: b.phone,
                email: b.email,
                website: b.website || null,
                whatsapp: b.whatsapp || null,
                rating: b.rating,
                reviewCount: b.reviewCount,
                isVerified: b.isVerified,
                isActive: b.isActive,
                status: b.status,
                openingTime: b.openingTime,
                closingTime: b.closingTime,
                tags: b.tags,
                tier: b.tier,
                isFeatured: b.isFeatured,
                sponsoredUntil: b.isFeatured
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    : null,
                lat: b.lat,
                lng: b.lng,
            },
        });
        console.log(`  ✅ ${business.name} (${business.city})`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────────────');
    console.log('🔐 Admin Login Details:');
    console.log('   URL:      http://localhost:3000/admin');
    console.log('   Email:    admin@eaglesearch.ng');
    console.log('   Password: Admin@Eagle2024');
    console.log('─────────────────────────────────────────');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
