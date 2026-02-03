import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const reviews = await prisma.review.findMany({
            where: { businessId: id },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { rating, comment } = body;

        if (!rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get default user for now (in production this would be from auth)
        const defaultUser = await prisma.user.findFirst({
            where: { email: 'community@eaglesearch.ng' }
        });

        if (!defaultUser) {
            return NextResponse.json({ error: 'System user not found' }, { status: 500 });
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                businessId: id,
                userId: defaultUser.id
            }
        });

        // Update business stats
        const allReviews = await prisma.review.findMany({
            where: { businessId: id },
            select: { rating: true }
        });

        const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        await prisma.business.update({
            where: { id },
            data: {
                rating: avgRating,
                reviewCount: allReviews.length
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Create Review Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
