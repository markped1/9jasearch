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
        const { rating, comment, guestName } = body;

        if (!rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine the user: use guestName for anonymous reviews
        let userId: string;

        if (guestName && guestName.trim()) {
            // Anonymous review — create/find a guest user by a unique email
            const guestEmail = `guest_${Date.now()}@9jasearch.ng`;
            const guestUser = await prisma.user.create({
                data: {
                    email: guestEmail,
                    name: guestName.trim(),
                    role: 'USER'
                }
            });
            userId = guestUser.id;
        } else {
            // Fall back to community user for backward compatibility
            let communityUser = await prisma.user.findFirst({
                where: { email: 'community@eaglesearch.ng' }
            });

            if (!communityUser) {
                communityUser = await prisma.user.create({
                    data: {
                        email: 'community@eaglesearch.ng',
                        name: 'Community Member',
                        role: 'USER'
                    }
                });
            }
            userId = communityUser.id;
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                businessId: id,
                userId
            }
        });

        // Update business rating stats
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
