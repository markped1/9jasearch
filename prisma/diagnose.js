const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Check plumbers
  const plumbers = await p.business.findMany({
    where: {
      AND: [
        { isActive: true },
        { OR: [
          { name: { contains: 'plumb' } },
          { category: { contains: 'plumb' } },
          { description: { contains: 'plumb' } },
        ]}
      ]
    },
    take: 5,
    select: { name: true, city: true, category: true }
  });
  console.log('Plumber results:', plumbers.length);
  plumbers.forEach(b => console.log(' -', b.name, '|', b.city, '|', b.category));

  // 2. Check Lagos city filter
  const lagos = await p.business.findMany({
    where: { AND: [{ isActive: true }, { city: { contains: 'Lagos' } }] },
    take: 5,
    select: { name: true, city: true, category: true }
  });
  console.log('\nLagos businesses:', lagos.length);
  lagos.forEach(b => console.log(' -', b.name, '|', b.city));

  // 3. Check what artisan categories exist
  const artisans = await p.business.groupBy({
    by: ['category'],
    where: {
      category: {
        in: [
          'Plumbing & Pipefitting', 'Electrical Installation', 'Dry Cleaning & Laundry',
          'Domestic Cleaning Services', 'Tailoring & Fashion Design', 'Barbing Salons',
          'Beauty Salons & Hair Salons', 'Auto Repairs & Mechanics', 'Welding & Fabrication',
          'Carpenters & Woodwork', 'Painters & Decorators', 'Catering Services'
        ]
      }
    },
    _count: { id: true }
  });
  console.log('\nArtisan categories in DB:');
  artisans.forEach(a => console.log(' -', a.category, ':', a._count.id));

  // 4. Sample Lagos + plumbing search (what the API does)
  const combined = await p.business.findMany({
    where: {
      AND: [
        { isActive: true },
        { OR: [
          { name: { contains: 'plumb' } },
          { category: { contains: 'plumb' } },
          { description: { contains: 'plumb' } },
          { tags: { contains: 'plumb' } },
        ]},
        { OR: [
          { city: { contains: 'Lagos' } },
          { state: { contains: 'Lagos' } },
        ]}
      ]
    },
    take: 5,
    select: { name: true, city: true, category: true }
  });
  console.log('\nPlumbers in Lagos:', combined.length);
  combined.forEach(b => console.log(' -', b.name, '|', b.city));
}

main().catch(console.error).finally(() => p.$disconnect());
