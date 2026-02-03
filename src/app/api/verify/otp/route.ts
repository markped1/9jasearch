import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, target, token, type, businessId } = body;

        // ACTION: SEND
        if (action === 'send') {
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            // Ensure only one active token exists for this target/type at a time
            await prisma.verificationToken.deleteMany({
                where: { target, type }
            });

            await prisma.verificationToken.create({
                data: { target, token: otp, type, expiresAt }
            });

            // MOCK SENDING (In production, use Twilio/AWS SNS for Mobile or Nodemailer/Resend for Email)
            console.log(`[VERIFICATION] Sent ${type} OTP: ${otp} to ${target}`);

            return NextResponse.json({ success: true, message: 'OTP sent successfully' });
        }

        // ACTION: VERIFY
        if (action === 'verify') {
            const storedToken = await prisma.verificationToken.findFirst({
                where: { target, token, type }
            });

            if (!storedToken) {
                return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
            }

            if (new Date() > storedToken.expiresAt) {
                return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
            }

            // Cleanup used token
            await prisma.verificationToken.delete({ where: { id: storedToken.id } });

            // If we have a businessId, check if ALL verifications are done
            if (businessId) {
                // In a robust app, we'd track specific verification states (e.g. mobileVerified, emailVerified)
                // For this MVP, we'll mark as PENDING_APPROVAL once both steps are passed in the UI
                await prisma.business.update({
                    where: { id: businessId },
                    data: { status: 'PENDING_APPROVAL' }
                });
                console.log(`[VERIFICATION] Business ${businessId} moved to PENDING_APPROVAL`);
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('OTP API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
