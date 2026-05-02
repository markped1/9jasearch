/**
 * 9jaSearch — Automatic KYC Verification Service
 *
 * Uses Prembly IdentityPass API (https://app.prembly.com)
 * Falls back to Dojah if Prembly keys not set.
 *
 * Both have free tiers:
 *   Prembly: 100 free verifications/month
 *   Dojah:   50 free verifications/month
 *
 * Sign up at https://app.prembly.com or https://dojah.io
 * to get your API keys, then add them to .env
 */

export interface KYCResult {
  verified: boolean;
  status: 'verified' | 'failed' | 'not_found' | 'error' | 'pending_manual';
  matchedName?: string;
  matchedDob?: string;
  matchedPhoto?: string; // base64 photo from govt DB
  message: string;
  raw?: any;
}

// ── NIN Verification via Prembly ─────────────────────────────────
export async function verifyNIN(nin: string, name: string): Promise<KYCResult> {
  const apiKey = process.env.PREMBLY_API_KEY;
  const appId  = process.env.PREMBLY_APP_ID;

  if (!apiKey || !appId) {
    // No API keys — fall back to Dojah
    return verifyNINDojah(nin, name);
  }

  try {
    const res = await fetch('https://api.prembly.com/identitypass/verification/nin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'app-id': appId,
      },
      body: JSON.stringify({ number: nin }),
    });

    const data = await res.json();

    if (!res.ok || !data.verification?.status) {
      return { verified: false, status: 'error', message: data.detail || 'Verification service error', raw: data };
    }

    const verified = data.verification.status === 'VERIFIED';
    const returnedName = [
      data.nin_data?.firstname,
      data.nin_data?.middlename,
      data.nin_data?.surname,
    ].filter(Boolean).join(' ');

    // Check if name roughly matches (case-insensitive, partial match)
    const nameMatch = nameMatches(name, returnedName);

    return {
      verified: verified && nameMatch,
      status: verified ? (nameMatch ? 'verified' : 'failed') : 'not_found',
      matchedName: returnedName,
      matchedDob: data.nin_data?.birthdate,
      matchedPhoto: data.nin_data?.photo,
      message: verified
        ? (nameMatch ? `NIN verified. Name matches: ${returnedName}` : `NIN found but name mismatch. Expected: "${name}", Got: "${returnedName}"`)
        : 'NIN not found in NIMC database',
      raw: data,
    };
  } catch (err: any) {
    return { verified: false, status: 'error', message: `Network error: ${err.message}` };
  }
}

// ── NIN via Dojah (fallback) ──────────────────────────────────────
async function verifyNINDojah(nin: string, name: string): Promise<KYCResult> {
  const apiKey = process.env.DOJAH_API_KEY;
  const appId  = process.env.DOJAH_APP_ID;

  if (!apiKey || !appId) {
    return {
      verified: false,
      status: 'pending_manual',
      message: 'No KYC API keys configured. Please add PREMBLY_API_KEY or DOJAH_API_KEY to .env — see https://app.prembly.com',
    };
  }

  try {
    const res = await fetch(`https://api.dojah.io/api/v1/kyc/nin?nin=${nin}`, {
      headers: {
        'Authorization': apiKey,
        'AppId': appId,
      },
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return { verified: false, status: 'not_found', message: data.error || 'NIN not found', raw: data };
    }

    const entity = data.entity;
    const returnedName = [entity?.firstname, entity?.middlename, entity?.surname].filter(Boolean).join(' ');
    const nameMatch = nameMatches(name, returnedName);

    return {
      verified: nameMatch,
      status: nameMatch ? 'verified' : 'failed',
      matchedName: returnedName,
      matchedDob: entity?.birthdate,
      matchedPhoto: entity?.photo,
      message: nameMatch
        ? `NIN verified via Dojah. Name: ${returnedName}`
        : `NIN found but name mismatch. Got: "${returnedName}"`,
      raw: data,
    };
  } catch (err: any) {
    return { verified: false, status: 'error', message: `Dojah error: ${err.message}` };
  }
}

// ── CAC Verification via Prembly ──────────────────────────────────
export async function verifyCAC(rcNumber: string, companyName: string): Promise<KYCResult> {
  const apiKey = process.env.PREMBLY_API_KEY;
  const appId  = process.env.PREMBLY_APP_ID;

  if (!apiKey || !appId) {
    return verifyCACDojah(rcNumber, companyName);
  }

  try {
    const res = await fetch('https://api.prembly.com/identitypass/verification/cac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'app-id': appId,
      },
      body: JSON.stringify({ rc_number: rcNumber }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { verified: false, status: 'error', message: data.detail || 'CAC verification error', raw: data };
    }

    const verified = data.verification?.status === 'VERIFIED';
    const returnedName = data.data?.company_name || '';
    const nameMatch = nameMatches(companyName, returnedName);

    return {
      verified: verified && nameMatch,
      status: verified ? (nameMatch ? 'verified' : 'failed') : 'not_found',
      matchedName: returnedName,
      message: verified
        ? (nameMatch ? `CAC verified. Company: ${returnedName}` : `CAC found but name mismatch. Got: "${returnedName}"`)
        : 'RC number not found in CAC database',
      raw: data,
    };
  } catch (err: any) {
    return { verified: false, status: 'error', message: `CAC verification error: ${err.message}` };
  }
}

// ── CAC via Dojah (fallback) ──────────────────────────────────────
async function verifyCACDojah(rcNumber: string, companyName: string): Promise<KYCResult> {
  const apiKey = process.env.DOJAH_API_KEY;
  const appId  = process.env.DOJAH_APP_ID;

  if (!apiKey || !appId) {
    return {
      verified: false,
      status: 'pending_manual',
      message: 'No KYC API keys configured. Add PREMBLY_API_KEY or DOJAH_API_KEY to .env',
    };
  }

  try {
    const res = await fetch(`https://api.dojah.io/api/v1/kyc/cac?rc_number=${rcNumber}`, {
      headers: { 'Authorization': apiKey, 'AppId': appId },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { verified: false, status: 'not_found', message: data.error || 'CAC not found', raw: data };
    }

    const returnedName = data.entity?.company_name || '';
    const nameMatch = nameMatches(companyName, returnedName);

    return {
      verified: nameMatch,
      status: nameMatch ? 'verified' : 'failed',
      matchedName: returnedName,
      message: nameMatch ? `CAC verified. Company: ${returnedName}` : `Name mismatch. Got: "${returnedName}"`,
      raw: data,
    };
  } catch (err: any) {
    return { verified: false, status: 'error', message: `Dojah CAC error: ${err.message}` };
  }
}

// ── Driver's Licence via Prembly ──────────────────────────────────
export async function verifyDriversLicence(licenceNo: string, name: string): Promise<KYCResult> {
  const apiKey = process.env.PREMBLY_API_KEY;
  const appId  = process.env.PREMBLY_APP_ID;

  if (!apiKey || !appId) {
    return { verified: false, status: 'pending_manual', message: 'No KYC API keys configured' };
  }

  try {
    const res = await fetch('https://api.prembly.com/identitypass/verification/drivers_license', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'app-id': appId,
      },
      body: JSON.stringify({ number: licenceNo }),
    });

    const data = await res.json();
    const verified = data.verification?.status === 'VERIFIED';
    const returnedName = [data.frsc_data?.firstname, data.frsc_data?.lastname].filter(Boolean).join(' ');
    const nameMatch = nameMatches(name, returnedName);

    return {
      verified: verified && nameMatch,
      status: verified ? (nameMatch ? 'verified' : 'failed') : 'not_found',
      matchedName: returnedName,
      matchedPhoto: data.frsc_data?.photo,
      message: verified
        ? (nameMatch ? `Licence verified. Name: ${returnedName}` : `Licence found but name mismatch`)
        : 'Licence number not found',
      raw: data,
    };
  } catch (err: any) {
    return { verified: false, status: 'error', message: err.message };
  }
}

// ── Helper: fuzzy name match ──────────────────────────────────────
function nameMatches(submitted: string, returned: string): boolean {
  if (!submitted || !returned) return false;
  const a = submitted.toLowerCase().trim();
  const b = returned.toLowerCase().trim();
  if (a === b) return true;

  // Check if all words in submitted appear in returned (handles middle name differences)
  const wordsA = a.split(/\s+/).filter(w => w.length > 1);
  const wordsB = b.split(/\s+/).filter(w => w.length > 1);
  const matchCount = wordsA.filter(w => wordsB.includes(w)).length;

  // At least 2 words must match, or 60% of submitted words
  return matchCount >= 2 || (wordsA.length > 0 && matchCount / wordsA.length >= 0.6);
}
