import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    return NextResponse.json({ status: 'API Reachable', message: 'Use POST to create a business' });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, category, description, address, city, state,
            email, phone, whatsapp, website, openingTime, closingTime,
            // KYC fields
            kyc
        } = body;

        const missing = [];
        if (!name) missing.push('name');
        if (!category) missing.push('category');
        if (!email) missing.push('email');
        if (!address) missing.push('address');
        if (!city) missing.push('city');
        if (!phone) missing.push('phone');
        if (!state) missing.push('state');

        if (missing.length > 0) {
            return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
        }

        const baseSlug = name.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        if (!baseSlug) return NextResponse.json({ error: 'Invalid business name' }, { status: 400 });

        let slug = baseSlug;
        let count = 1;
        while (await prisma.business.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count++}`;
        }

        const business = await prisma.business.create({
            data: {
                name, slug, category,
                description: description || '',
                email, address, city, state, phone,
                whatsapp: whatsapp || '',
                website: website || null,
                openingTime: openingTime || '08:00',
                closingTime: closingTime || '18:00',
                isVerified: false,
                isActive: false,
                status: 'PENDING_OTP',
                tier: 'FREE',
                tags: '[]',
            }
        });

        // Save KYC record if provided
        if (kyc && (kyc.nin || kyc.cacNumber)) {
            await prisma.kYCRecord.create({
                data: {
                    businessId: business.id,
                    businessSize: kyc.businessSize || 'small',
                    nin: kyc.nin || null,
                    ninName: kyc.ninName || null,
                    cacNumber: kyc.cacNumber || null,
                    cacName: kyc.cacName || null,
                    taxId: kyc.taxId || null,
                    directorName: kyc.directorName || null,
                    directorPhone: kyc.directorPhone || null,
                    status: 'PENDING',
                }
            });

            // Save uploaded documents to VerificationRequest
            if (kyc.docs && (kyc.docs.idCard || kyc.docs.cacCert)) {
                await prisma.verificationRequest.create({
                    data: {
                        businessId: business.id,
                        status: 'PENDING',
                        documents: JSON.stringify(kyc.docs),
                    }
                });
            }
        }

        return NextResponse.json(business);
    } catch (error: any) {
        console.error('Create Business Error:', error);
        return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
    }
}
