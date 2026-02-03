const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEMO_BUSINESSES = [
    {
        name: 'Eko Hotels & Suites',
        category: 'Hotels',
        address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island',
        city: 'Lagos',
        state: 'Lagos',
        phone: '+234 800 123 4567',
        email: 'info@ekohotels.com',
        rating: 4.8,
        reviews: 1250,
        isVerified: true,
        isActive: true,
        status: 'APPROVED',
        openingTime: 'Open 24 hours',
        closingTime: '',
        tags: ['Luxury Hotel', 'Pool', 'Spa'],
        lat: 6.4253,
        lng: 3.4411
    },
    {
        name: 'Chicken Republic',
        category: 'Restaurants',
        address: 'Adetokunbo Ademola Cres, Wuse 2',
        city: 'Abuja',
        state: 'FCT',
        phone: '+234 800 777 7777',
        email: 'wuse2@chicken-republic.com',
        rating: 4.5,
        reviews: 890,
        isVerified: true,
        isActive: true,
        status: 'APPROVED',
        openingTime: '9:00 AM',
        closingTime: '9:00 PM',
        tags: ['Dine-in', 'Takeaway', 'Delivery'],
        lat: 9.0765,
        lng: 7.4985
    },
    {
        name: 'Dangote Cement Depot',
        category: 'Manufacturing',
        address: 'Obajana Plant Road',
        city: 'Lokoja',
        state: 'Kogi',
        phone: '+234 810 000 0000',
        email: 'depot@dangote.com',
        rating: 4.2,
        reviews: 45,
        isVerified: true,
        isActive: true,
        status: 'APPROVED',
        openingTime: '7:00 AM',
        closingTime: '5:00 PM',
        tags: ['Wholesale', 'Cement', 'Logistics'],
        lat: 7.8004,
        lng: 6.7436
    },
    {
        name: 'Mama Nkechi Kitchen',
        category: 'Restaurants',
        address: '15 Douglas Road',
        city: 'Owerri',
        state: 'Imo',
        phone: '+234 901 234 5678',
        email: 'mama.nkechi@food.ng',
        rating: 4.9,
        reviews: 320,
        isVerified: true,
        isActive: true,
        status: 'APPROVED',
        openingTime: '8:00 AM',
        closingTime: '8:00 PM',
        tags: ['Local Delicacies', 'Catering'],
        lat: 5.4851,
        lng: 7.0358
    },
    {
        name: 'FixIt Mechanics',
        category: 'Automotive',
        address: 'Ladipo Market Road',
        city: 'Lagos',
        state: 'Lagos',
        phone: '+234 700 227 3498',
        email: 'fixit@ladipo.ng',
        rating: 4.0,
        reviews: 15,
        isVerified: false,
        isActive: true,
        status: 'APPROVED',
        openingTime: '8:00 AM',
        closingTime: '6:00 PM',
        tags: ['Repairs', 'Maintenance'],
        lat: 6.5482,
        lng: 3.3404
    },
    {
        name: 'Zenith Bank HQ',
        category: 'Finance',
        address: 'Plot 84 Ajose Adeogun Street, VI',
        city: 'Lagos',
        state: 'Lagos',
        phone: '+234 1 278 7000',
        email: 'corporate@zenithbank.com',
        rating: 4.6,
        reviews: 2100,
        isVerified: true,
        isActive: true,
        status: 'APPROVED',
        openingTime: '8:00 AM',
        closingTime: '4:00 PM',
        tags: ['Banking', 'ATM', 'Financial Services'],
        lat: 6.4281,
        lng: 3.4376
    }
];

async function main() {
    console.log('Start seeding...');

    // Create a default community user for reviews
    const defaultUser = await prisma.user.upsert({
        where: { email: 'community@eaglesearch.ng' },
        update: {},
        create: {
            email: 'community@eaglesearch.ng',
            name: 'Community Member',
            role: 'USER'
        }
    });
    console.log('Default user created:', defaultUser.id);
    for (const b of DEMO_BUSINESSES) {
        const slug = b.name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        await prisma.business.upsert({
            where: { slug },
            update: {
                email: b.email,
                isActive: b.isActive,
                status: 'APPROVED',
                isFeatured: b.name === 'Eko Hotels & Suites' || b.name === 'Zenith Bank HQ',
                sponsoredUntil: (b.name === 'Eko Hotels & Suites' || b.name === 'Zenith Bank HQ')
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : null,
                lat: b.lat,
                lng: b.lng
            },
            create: {
                name: b.name,
                slug,
                category: b.category,
                address: b.address,
                city: b.city,
                state: b.state,
                phone: b.phone,
                email: b.email,
                rating: b.rating,
                reviewCount: b.reviews,
                isVerified: b.isVerified,
                isActive: b.isActive,
                status: 'APPROVED',
                openingTime: b.openingTime,
                closingTime: b.closingTime,
                tags: JSON.stringify(b.tags),
                tier: b.isVerified ? 'VERIFIED' : 'FREE',
                isFeatured: b.name === 'Eko Hotels & Suites' || b.name === 'Zenith Bank HQ',
                sponsoredUntil: (b.name === 'Eko Hotels & Suites' || b.name === 'Zenith Bank HQ')
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : null,
                lat: b.lat,
                lng: b.lng
            },
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
