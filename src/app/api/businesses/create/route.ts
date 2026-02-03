import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, description, address, city, state, email, phone, whatsapp, website, openingTime, closingTime } = body;

        if (!name || !category || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate slug
        const baseSlug = name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        // Ensure slug uniqueness (simple increment logic)
        let slug = baseSlug;
        let count = 1;
        while (await prisma.business.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const business = await prisma.business.create({
            data: {
                name,
                slug,
                category,
                description,
                email,
                address,
                city,
                state,
                phone,
                whatsapp,
                openingTime,
                closingTime,
                isVerified: false,
                isActive: false,
                status: 'PENDING_OTP',
                tier: 'FREE',
                tags: '[]', // Default empty tags
            }
        });

        return NextResponse.json(business);
    } catch (error) {
        console.error('Create Business Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
