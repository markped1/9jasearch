/**
 * Bank Account KYC Verification via Flutterwave
 *
 * Uses Flutterwave's FREE account verification API to confirm
 * a business owner's identity through their bank account.
 *
 * The bank has already KYC'd the account holder — so if the
 * name on the account matches the registered name, identity
 * is confirmed automatically with zero manual review.
 *
 * API: GET https://api.flutterwave.com/v3/accounts/resolve
 * Cost: FREE
 * Docs: https://developer.flutterwave.com/docs/verify-a-bank-account
 *
 * Setup:
 *  1. Sign up at https://dashboard.flutterwave.com
 *  2. Go to Settings → API Keys
 *  3. Copy your Secret Key and add to .env as FLUTTERWAVE_SECRET_KEY
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const NIGERIAN_BANKS = [
    { name: 'Access Bank',                        code: '044' },
    { name: 'Citibank Nigeria',                   code: '023' },
    { name: 'Ecobank Nigeria',                    code: '050' },
    { name: 'Fidelity Bank',                      code: '070' },
    { name: 'First Bank of Nigeria',              code: '011' },
    { name: 'First City Monument Bank (FCMB)',    code: '214' },
    { name: 'Guaranty Trust Bank (GTBank)',       code: '058' },
    { name: 'Heritage Bank',                      code: '030' },
    { name: 'Jaiz Bank',                          code: '301' },
    { name: 'Keystone Bank',                      code: '082' },
    { name: 'Kuda Bank',                          code: '50211' },
    { name: 'Lotus Bank',                         code: '303' },
    { name: 'Moniepoint MFB',                     code: '50515' },
    { name: 'OPay',                               code: '999992' },
    { name: 'PalmPay',                            code: '999991' },
    { name: 'Polaris Bank',                       code: '076' },
    { name: 'Providus Bank',                      code: '101' },
    { name: 'Stanbic IBTC Bank',                  code: '221' },
    { name: 'Standard Chartered Bank',            code: '068' },
    { name: 'Sterling Bank',                      code: '232' },
    { name: 'Taj Bank',                           code: '302' },
    { name: 'Titan Trust Bank',                   code: '102' },
    { name: 'Union Bank of Nigeria',              code: '032' },
    { name: 'United Bank for Africa (UBA)',       code: '033' },
    { name: 'Unity Bank',                         code: '215' },
    { name: 'VFD Microfinance Bank',              code: '566' },
    { name: 'Wema Bank',                          code: '035' },
    { name: 'Zenith Bank',                        code: '057' },
    { name: 'Carbon (One Finance)',               code: '565' },
    { name: 'Rubies MFB',                         code: '125' },
    { name: 'Sparkle MFB',                        code: '51310' },
    { name: 'Parallex Bank',                      code: '104' },
    { name: 'Coronation Merchant Bank',           code: '559' },
    { name: 'Nova Merchant Bank',                 code: '561' },
    { name: 'Globus Bank',                        code: '00103' },
    { name: 'Paga',                               code: '100002' },
];

/** Fuzzy name match — handles middle name differences, order swaps */
function nameMatches(submitted: string, bankName: string): boolean {
    if (!submitted || !bankName) return false;
    const a = submitted.toLowerCase().trim();
    const b = bankName.toLowerCase().trim();
    if (a === b) return true;

    const wordsA = a.split(/\s+/).filter(w => w.length > 1);
    const wordsB = b.split(/\s+/).filter(w => w.length > 1);
    const matchCount = wordsA.filter(w =>
        wordsB.some(wb => wb.includes(w) || w.includes(wb))
    ).length;

    // At least 2 words match OR 60% of submitted words match
    return matchCount >= 2 || (wordsA.length > 0 && matchCount / wordsA.length >= 0.6);
}

// GET — return bank list for the dropdown
export async function GET() {
    return NextResponse.json({ banks: NIGERIAN_BANKS });
}

// POST — verify account and auto-approve KYC if name matches
export async function POST(request: Request) {
    try {
        const { accountNumber, bankCode, registeredName, businessId } = await request.json();

        if (!accountNumber || !bankCode || !registeredName) {
            return NextResponse.json({
                error: 'accountNumber, bankCode and registeredName are required'
            }, { status: 400 });
        }

        if (accountNumber.replace(/\D/g, '').length !== 10) {
            return NextResponse.json({ error: 'Account number must be exactly 10 digits' }, { status: 400 });
        }

        const fwKey = process.env.FLUTTERWAVE_SECRET_KEY;
        if (!fwKey) {
            return NextResponse.json({
                error: 'Flutterwave secret key not configured.',
                hint: 'Add FLUTTERWAVE_SECRET_KEY to your .env file. Get it free at https://dashboard.flutterwave.com → Settings → API Keys',
            }, { status: 503 });
        }

        // ── Call Flutterwave account resolution API ──────────────────
        const res = await fetch(
            `https://api.flutterwave.com/v3/accounts/resolve`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${fwKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_number: accountNumber.replace(/\D/g, ''),
                    account_bank: bankCode,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 'success') {
            return NextResponse.json({
                verified: false,
                status: 'not_found',
                message: data.message || 'Account not found. Please check your account number and bank selection.',
            });
        }

        const bankAccountName: string = data.data?.account_name || '';
        const matched = nameMatches(registeredName, bankAccountName);

        const result = {
            verified: matched,
            status: matched ? 'verified' : 'name_mismatch',
            bankAccountName,
            accountNumber: data.data?.account_number,
            message: matched
                ? `✅ Verified! Bank account name "${bankAccountName}" matches your registered name.`
                : `⚠️ Name mismatch. Your bank account is registered as "${bankAccountName}" but you entered "${registeredName}". Please use the account in your own name, or update your business name to match.`,
        };

        // ── Save result to KYC record ────────────────────────────────
        if (businessId) {
            const existing = await prisma.kYCRecord.findUnique({ where: { businessId } });

            const kycStatus = matched ? 'APPROVED' : 'REJECTED';
            const note = `Flutterwave bank verification: ${result.message}`;

            if (existing) {
                await prisma.kYCRecord.update({
                    where: { businessId },
                    data: { status: kycStatus, reviewNote: note, reviewedAt: new Date() }
                });
            } else {
                await prisma.kYCRecord.create({
                    data: {
                        businessId,
                        businessSize: 'small',
                        status: kycStatus,
                        reviewNote: note,
                        reviewedAt: new Date(),
                    }
                });
            }

            // ── Auto-activate business if verified ───────────────────
            if (matched) {
                await prisma.business.update({
                    where: { id: businessId },
                    data: { isVerified: true, isActive: true, status: 'APPROVED' }
                });
            }
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Flutterwave bank verify error:', error);
        return NextResponse.json({
            error: 'Verification failed',
            details: error.message
        }, { status: 500 });
    }
}
