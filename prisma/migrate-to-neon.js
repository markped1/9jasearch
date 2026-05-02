/**
 * Fast bulk migration: SQLite → Neon PostgreSQL
 * Uses createMany for bulk inserts instead of one-by-one upserts
 */
const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

const neon = new PrismaClient();
const sqlite = new Database(path.join(__dirname, 'dev.db'), { readonly: true });

function bool(v) { return v === 1 || v === true || v === 'true'; }
function dt(v) { return v ? new Date(v) : new Date(); }

async function migrate() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   9jaSearch — Fast Bulk Migration to Neon            ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── 1. Users ──────────────────────────────────────────────────
  console.log('📦 Users...');
  const users = sqlite.prepare('SELECT * FROM User').all();
  await neon.user.createMany({
    data: users.map(u => ({
      id: u.id, email: u.email, name: u.name,
      password: u.password, role: u.role || 'USER',
      image: u.image,
      createdAt: dt(u.createdAt), updatedAt: dt(u.updatedAt),
    })),
    skipDuplicates: true,
  });
  console.log(`  ✅ ${users.length} users`);

  // ── 2. Businesses in batches of 500 ───────────────────────────
  console.log('📦 Businesses...');
  const businesses = sqlite.prepare('SELECT * FROM Business').all();
  const BATCH = 500;
  let imported = 0;
  for (let i = 0; i < businesses.length; i += BATCH) {
    const batch = businesses.slice(i, i + BATCH).map(b => ({
      id: b.id, name: b.name, slug: b.slug,
      category: b.category || 'General',
      description: b.description,
      email: b.email || `info@${b.slug}.ng`,
      phone: b.phone || '+2340000000000',
      website: b.website, whatsapp: b.whatsapp,
      address: b.address || b.city,
      city: b.city, state: b.state,
      lat: b.lat ? parseFloat(b.lat) : null,
      lng: b.lng ? parseFloat(b.lng) : null,
      isVerified: bool(b.isVerified),
      isActive: bool(b.isActive),
      status: b.status || 'APPROVED',
      tier: b.tier || 'FREE',
      isFeatured: bool(b.isFeatured),
      sponsoredUntil: b.sponsoredUntil ? dt(b.sponsoredUntil) : null,
      openingTime: b.openingTime, closingTime: b.closingTime,
      tags: b.tags, rating: b.rating || 0,
      reviewCount: b.reviewCount || 0,
      images: b.images, logo: b.logo, coverImage: b.coverImage,
      ownerId: b.ownerId,
      createdAt: dt(b.createdAt), updatedAt: dt(b.updatedAt),
    }));
    await neon.business.createMany({ data: batch, skipDuplicates: true });
    imported += batch.length;
    process.stdout.write(`\r  ${imported}/${businesses.length}...`);
  }
  console.log(`\n  ✅ ${imported} businesses`);

  // ── 3. Reviews ────────────────────────────────────────────────
  console.log('📦 Reviews...');
  const reviews = sqlite.prepare('SELECT * FROM Review').all();
  if (reviews.length > 0) {
    await neon.review.createMany({
      data: reviews.map(r => ({
        id: r.id, rating: r.rating, comment: r.comment,
        userId: r.userId, businessId: r.businessId,
        createdAt: dt(r.createdAt),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✅ ${reviews.length} reviews`);

  // ── 4. KYC Records ────────────────────────────────────────────
  console.log('📦 KYC Records...');
  try {
    const kycs = sqlite.prepare('SELECT * FROM KYCRecord').all();
    if (kycs.length > 0) {
      await neon.kYCRecord.createMany({
        data: kycs.map(k => ({
          id: k.id, businessId: k.businessId,
          businessSize: k.businessSize || 'small',
          nin: k.nin, ninName: k.ninName,
          cacNumber: k.cacNumber, cacName: k.cacName,
          taxId: k.taxId, directorName: k.directorName,
          directorPhone: k.directorPhone,
          status: k.status || 'PENDING',
          reviewNote: k.reviewNote,
          reviewedAt: k.reviewedAt ? dt(k.reviewedAt) : null,
          createdAt: dt(k.createdAt), updatedAt: dt(k.updatedAt),
        })),
        skipDuplicates: true,
      });
      console.log(`  ✅ ${kycs.length} KYC records`);
    } else {
      console.log('  ℹ️  No KYC records');
    }
  } catch (e) { console.log('  ℹ️  KYC table empty'); }

  // ── Final count ───────────────────────────────────────────────
  const total = await neon.business.count();
  const totalUsers = await neon.user.count();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ Migration complete!                               ║`);
  console.log(`║     Businesses on Neon: ${String(total).padEnd(28)}║`);
  console.log(`║     Users on Neon:      ${String(totalUsers).padEnd(28)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

migrate()
  .catch(err => { console.error('\n❌ Migration failed:', err.message); process.exit(1); })
  .finally(() => { neon.$disconnect(); sqlite.close(); });
