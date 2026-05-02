import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const existing = await prisma.business.findUnique({ where: { id } });
        if (!existing || existing.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            name, description, email, phone, whatsapp,
            address, website, openingTime, closingTime,
            images, logo, coverImage
        } = body;

        const updatedBusiness = await prisma.business.update({
            where: { id },
            data: {
                name,
                description,
                email,
                phone,
                whatsapp,
                address,
                website,
                openingTime,
                closingTime,
                images,
                logo,
                coverImage
            }
        });

        return NextResponse.json(updatedBusiness);
    } catch (error) {
        console.error('Update Business Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
