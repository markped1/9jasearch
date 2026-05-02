const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const total = await p.business.count();
  console.log('Total businesses in DB:', total);
  const byCity = await p.business.groupBy({
    by: ['city'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  byCity.forEach(c => console.log('  ' + c.city + ': ' + c._count.id));
  const byCategory = await p.business.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 20
  });
  console.log('\nTop 20 categories:');
  byCategory.forEach(c => console.log('  ' + c.category + ': ' + c._count.id));
}
main().finally(() => p.$disconnect());
