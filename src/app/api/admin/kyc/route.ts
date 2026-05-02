import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET — fetch all KYC records with business info
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        const records = await prisma.kYCRecord.findMany({
            where: status === 'ALL' ? {} : { status },
            orderBy: { createdAt: 'desc' },
            include: {
                // We join manually since no relation defined — fetch business separately
            }
        });

        // Enrich with business data and documents
        const enriched = await Promise.all(records.map(async (r) => {
            const business = await prisma.business.findUnique({
                where: { id: r.businessId },
                select: { id: true, name: true, category: true, city: true, state: true, email: true, phone: true, status: true, createdAt: true }
            });
            // Get uploaded documents
            const verReq = await prisma.verificationRequest.findFirst({
                where: { businessId: r.businessId },
                orderBy: { createdAt: 'desc' }
            });
            return { ...r, business, documents: verReq?.documents || null };
        }));

        return NextResponse.json({ records: enriched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch KYC records' }, { status: 500 });
    }
}

// POST — approve or reject a KYC record
export async function POST(request: Request) {
    try {
        const { kycId, action, note } = await request.json();
        // action: 'APPROVE' | 'REJECT'

        if (!kycId || !action) {
            return NextResponse.json({ error: 'kycId and action required' }, { status: 400 });
        }

        const kyc = await prisma.kYCRecord.findUnique({ where: { id: kycId } });
        if (!kyc) return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });

        // Update KYC status
        await prisma.kYCRecord.update({
            where: { id: kycId },
            data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                reviewNote: note || null,
                reviewedAt: new Date(),
            }
        });

        // If approved — mark business as verified and active
        if (action === 'APPROVE') {
            await prisma.business.update({
                where: { id: kyc.businessId },
                data: {
                    isVerified: true,
                    isActive: true,
                    status: 'APPROVED',
                }
            });
        }

        // If rejected — mark business as rejected
        if (action === 'REJECT') {
            await prisma.business.update({
                where: { id: kyc.businessId },
                data: {
                    status: 'REJECTED',
                    isActive: false,
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}
