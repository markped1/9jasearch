
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { businessId, date, serviceName, price, notes } = body;

        // Validation: Check if slot is taken?
        const existing = await prisma.appointment.findFirst({
            where: {
                businessId,
                date: new Date(date),
                status: 'CONFIRMED'
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Slot already taken' }, { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                userId: session.user.id,
                businessId,
                date: new Date(date),
                serviceName,
                price: parseFloat(price) || 0,
                notes,
                status: 'CONFIRMED'
            }
        });

        return NextResponse.json(appointment);

    } catch (error) {
        console.error('Booking Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId'); // For Owner View

        let where: any = {};

        if (businessId) {
            // Check ownership
            const business = await prisma.business.findUnique({ where: { id: businessId } });
            if (!business || business.ownerId !== session.user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            where = { businessId };
        } else {
            // User's own bookings
            where = { userId: session.user.id };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                business: { select: { name: true, phone: true } },
                user: { select: { name: true, image: true, email: true } }
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(appointments);

    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
