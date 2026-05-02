import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyNIN, verifyCAC, verifyDriversLicence } from '@/lib/kycVerify';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessId, businessSize, nin, ninName, cacNumber, cacName, idType } = body;

        if (!businessId) {
            return NextResponse.json({ error: 'businessId required' }, { status: 400 });
        }

        let result;

        if (businessSize === 'small') {
            if (!nin) return NextResponse.json({ error: 'NIN required' }, { status: 400 });

            if (idType === 'drivers_license') {
                result = await verifyDriversLicence(nin, ninName);
            } else {
                result = await verifyNIN(nin, ninName);
            }
        } else {
            if (!cacNumber) return NextResponse.json({ error: 'CAC number required' }, { status: 400 });
            result = await verifyCAC(cacNumber, cacName);
        }

        // Update KYC record with result
        const kycRecord = await prisma.kYCRecord.findUnique({ where: { businessId } });

        if (kycRecord) {
            await prisma.kYCRecord.update({
                where: { businessId },
                data: {
                    status: result.verified ? 'APPROVED' : (result.status === 'pending_manual' ? 'PENDING' : 'REJECTED'),
                    reviewNote: result.message,
                    reviewedAt: result.status !== 'pending_manual' ? new Date() : null,
                }
            });
        }

        // If auto-verified — activate the business immediately
        if (result.verified) {
            await prisma.business.update({
                where: { id: businessId },
                data: {
                    isVerified: true,
                    isActive: true,
                    status: 'APPROVED',
                }
            });
        }

        return NextResponse.json({
            verified: result.verified,
            status: result.status,
            message: result.message,
            matchedName: result.matchedName,
            matchedPhoto: result.matchedPhoto,
            autoApproved: result.verified,
        });

    } catch (error: any) {
        console.error('KYC verify error:', error);
        return NextResponse.json({ error: 'Verification failed', details: error.message }, { status: 500 });
    }
}
