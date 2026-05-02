const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const businesses = [
    // Banking
    { name: "Access Bank Plc", phone: "07003000000", category: "Banking", address: "Lagos, Nigeria", city: "Lagos", state: "Lagos", description: "Leading financial institution in Nigeria." },
    { name: "First Bank of Nigeria", phone: "070034778", category: "Banking", address: "Lagos, Nigeria", city: "Lagos", state: "Lagos", description: "First Bank of Nigeria Limited." },
    { name: "GTBank", phone: "08029002900", category: "Banking", address: "Lagos, Nigeria", city: "Lagos", state: "Lagos", description: "Guaranty Trust Bank." },
    { name: "Zenith Bank", phone: "0700936484", category: "Banking", address: "Lagos, Nigeria", city: "Lagos", state: "Lagos", description: "Strategic financial partners." },
    { name: "UBA", phone: "07002255822", category: "Banking", address: "Lagos, Nigeria", city: "Lagos", state: "Lagos", description: "Africa's Global Bank." },

    // Technology & Telecom
    { name: "Interswitch", phone: "017008888", category: "Technology", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "Payment processing and infrastructure." },
    { name: "MTN Nigeria", phone: "08031000180", category: "Telecommunications", address: "Falomo, Ikoyi", city: "Lagos", state: "Lagos", description: "Largest mobile operator in Nigeria." },
    { name: "Airtel Nigeria", phone: "08021500111", category: "Telecommunications", address: "Banana Island", city: "Lagos", state: "Lagos", description: "Telecommunications service provider." },
    { name: "Globacom", phone: "08050020121", category: "Telecommunications", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "Glo Mobile - Grandmasters of Data." },

    // Hospitality
    { name: "Eko Hotel & Suites", phone: "012772700", category: "Hospitality", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "Luxury hotel and conference centre." },
    { name: "Lagos Continental", phone: "012366666", category: "Hospitality", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "5-star hotel in Lagos." },
    { name: "Sheraton Lagos Hotel", phone: "012800100", category: "Hospitality", address: "Ikeja", city: "Lagos", state: "Lagos", description: "Premium hotel in Ikeja." },

    // Retail & Supermarkets
    { name: "ShopRite Nigeria", phone: "012955888", category: "Retail", address: "Ikeja City Mall", city: "Lagos", state: "Lagos", description: "Leading supermarket chain." },
    { name: "Spar Nigeria", phone: "07007727644", category: "Retail", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "Hypermarket and department store." },
    { name: "Prince Ebeano Supermarket", phone: "08033044414", category: "Retail", address: "Lekki Phase 1", city: "Lagos", state: "Lagos", description: "One-stop shop for groceries and household items." },
    { name: "Justrite Superstore", phone: "08023199999", category: "Retail", address: "Ota", city: "Ogun", state: "Ogun", description: "Neighborhood supermarket chain." },

    // Logistics
    { name: "GIG Logistics", phone: "08139851120", category: "Logistics", address: "Gbagada", city: "Lagos", state: "Lagos", description: "Fastest delivery service in Nigeria." },
    { name: "DHL Nigeria", phone: "08039000002", category: "Logistics", address: "Isolo", city: "Lagos", state: "Lagos", description: "International courier and logistics." },
    { name: "Red Star Express", phone: "012715670", category: "Logistics", address: "Oshodi", city: "Lagos", state: "Lagos", description: "Licensee of FedEx in Nigeria." },

    // Healthcare
    { name: "Reddington Hospital", phone: "012715341", category: "Healthcare", address: "Victoria Island", city: "Lagos", state: "Lagos", description: "Multi-specialist hospital." },
    { name: "Lagoon Hospitals", phone: "012918200", category: "Healthcare", address: "Ikoyi", city: "Lagos", state: "Lagos", description: "Pioneers in advanced medical care." },
    { name: "St. Nicholas Hospital", phone: "08022908484", category: "Healthcare", address: "Lagos Island", city: "Lagos", state: "Lagos", description: "Leading private hospital." },

    // Education
    { name: "University of Lagos", phone: "012345678", category: "Education", address: "Akoka", city: "Lagos", state: "Lagos", description: "First choice and the nation's pride." },
    { name: "Covenant University", phone: "08055555555", category: "Education", address: "Ota", city: "Ogun", state: "Ogun", description: "Leading private university." },
    { name: "Greensprings School", phone: "07045502424", category: "Education", address: "Lekki", city: "Lagos", state: "Lagos", description: "World-class education." },

    // Manufacturing
    { name: "Dangote Group", phone: "08003264683", category: "Manufacturing", address: "Ikoyi", city: "Lagos", state: "Lagos", description: "Diversified conglomerate." },
    { name: "7Up Bottling Company", phone: "08056900900", category: "Manufacturing", address: "Ijora", city: "Lagos", state: "Lagos", description: "Beverage manufacturing." }
];

async function main() {
    console.log(`Starting import of ${businesses.length} businesses...`);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 Days from now

    // Default password for claimed accounts (optional)
    const password = await bcrypt.hash('password123', 10);

    for (const biz of businesses) {
        const slug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const email = `contact@${slug}.com`; // Placeholder email

        try {
            // 1. Create User first
            const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    email,
                    name: biz.name,
                    password,
                    role: 'BUSINESS',
                    permissions: ''
                }
            });

            // 2. Create Business with ownerId
            const business = await prisma.business.upsert({
                where: { slug },
                update: {
                    ownerId: user.id,
                    lat: 6.5244, // Update existing records too if needed
                    lng: 3.3792
                },
                create: {
                    name: biz.name,
                    slug,
                    email,
                    phone: biz.phone,
                    category: biz.category,
                    description: biz.description,
                    address: biz.address,
                    city: biz.city,
                    state: biz.state,
                    lat: 6.5244, // Default to Lagos for visibility
                    lng: 3.3792,
                    openingTime: "08:00",
                    closingTime: "18:00",
                    isActive: true, // ENSURE IT IS ACTIVE
                    isVerified: true,
                    isFeatured: true, // GIVE THEM FREE TRIAL
                    sponsoredUntil: expiryDate,
                    tier: 'FREE',
                    images: "[]",
                    rating: 5.0,
                    reviewCount: 1,
                    ownerId: user.id
                }
            });

            console.log(`Imported: ${business.name} [${business.category}]`);

            // SIMULATE SMS SENDING
            console.log(`[SMS SIMULATION] To: ${biz.phone} | Body: Welcome to EagleSearch! We've added your business '${biz.name}' with a 30-DAY FREE TRIAL of our Premium features. Upgrade or reach out to claim your listing. Login: ${email}`);

            // Log to SMS Log if possible
            await prisma.sMSLog.create({
                data: {
                    recipient: biz.phone,
                    message: `Welcome to EagleSearch! 30-Day Free Trial started.`,
                    status: 'SENT',
                    type: 'WELCOME_TRIAL'
                }
            });

        } catch (e) {
            console.error(`Failed to import ${biz.name}:`, e.message);
        }
    }

    console.log('Import complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
