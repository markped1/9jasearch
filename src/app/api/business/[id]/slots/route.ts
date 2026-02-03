
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { // params is Promise!
    try {
        const { id } = await params; // Resolve params
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date'); // YYYY-MM-DD

        if (!dateStr) return NextResponse.json({ error: 'Missing date' }, { status: 400 });

        const business = await prisma.business.findUnique({
            where: { id }
        });

        if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

        // Logic:
        // 1. Get opening/closing times (defaults 9am - 5pm if missing)
        // 2. Generate all 30min slots for the day.
        // 3. Filter out past times if today.
        // 4. Filter out bookings.

        const startHour = parseInt(business.openingTime || '09:00');
        const endHour = parseInt(business.closingTime || '17:00');
        // Simple int parsing (9:00 -> 9).

        const slots = [];
        const baseDate = new Date(dateStr);

        for (let h = startHour; h < endHour; h++) {
            // :00
            const slot1 = new Date(baseDate);
            slot1.setHours(h, 0, 0, 0);
            slots.push(slot1);

            // :30
            const slot2 = new Date(baseDate);
            slot2.setHours(h, 30, 0, 0);
            slots.push(slot2);
        }

        // Fetch bookings for this day
        const dayStart = new Date(dateStr);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dateStr);
        dayEnd.setHours(23, 59, 59, 999);

        const bookings = await prisma.appointment.findMany({
            where: {
                businessId: id,
                date: {
                    gte: dayStart,
                    lte: dayEnd
                },
                status: { not: 'CANCELLED' }
            }
        });

        // Filter available
        const takenTimes = bookings.map(b => b.date.getTime());
        const available = slots.filter(s => {
            // if today, check if past
            if (new Date().toDateString() === s.toDateString() && s < new Date()) return false;
            return !takenTimes.includes(s.getTime());
        });

        // Format
        const result = available.map(d => ({
            iso: d.toISOString(),
            label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
