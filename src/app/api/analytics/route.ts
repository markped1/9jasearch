import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Track an engagement event
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessId, eventType, metadata } = body;

        if (!businessId || !eventType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Valid event types
        const validTypes = ['page_view', 'call_click', 'whatsapp_click', 'website_click', 'directions_click'];
        if (!validTypes.includes(eventType)) {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        // Create analytics event
        const event = await prisma.analyticsEvent.create({
            data: {
                businessId,
                eventType,
                metadata: metadata ? JSON.stringify(metadata) : null,
            }
        });

        return NextResponse.json({ success: true, id: event.id });
    } catch (error) {
        console.error('Analytics Tracking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Get analytics for a business
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const period = searchParams.get('period') || '7d'; // 7d, 30d, all

    if (!businessId) {
        return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    try {
        // Calculate date range
        let dateFilter = {};
        const now = new Date();
        if (period === '7d') {
            dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        } else if (period === '30d') {
            dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        }

        // Get all events for this business
        const events = await prisma.analyticsEvent.findMany({
            where: {
                businessId,
                ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
            },
            orderBy: { createdAt: 'desc' }
        });

        // Aggregate stats
        const stats = {
            totalViews: events.filter(e => e.eventType === 'page_view').length,
            callClicks: events.filter(e => e.eventType === 'call_click').length,
            whatsappClicks: events.filter(e => e.eventType === 'whatsapp_click').length,
            websiteClicks: events.filter(e => e.eventType === 'website_click').length,
            directionsClicks: events.filter(e => e.eventType === 'directions_click').length,
            totalEngagements: events.length,
        };

        // Daily breakdown for charts
        const dailyData: Record<string, any> = {};
        events.forEach(event => {
            const day = event.createdAt.toISOString().split('T')[0];
            if (!dailyData[day]) {
                dailyData[day] = { views: 0, calls: 0, whatsapp: 0 };
            }
            if (event.eventType === 'page_view') dailyData[day].views++;
            if (event.eventType === 'call_click') dailyData[day].calls++;
            if (event.eventType === 'whatsapp_click') dailyData[day].whatsapp++;
        });

        return NextResponse.json({
            stats,
            dailyData: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
            period
        });
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
