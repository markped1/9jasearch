const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@Eagle2024', 12);
  const user = await p.user.upsert({
    where: { email: 'admin@eaglesearch.ng' },
    update: { password: hash, role: 'ADMIN', name: 'Admin' },
    create: { email: 'admin@eaglesearch.ng', name: 'Admin', password: hash, role: 'ADMIN' }
  });
  console.log('✅ Admin account ready');
  console.log('   Email:   ', user.email);
  console.log('   Password: Admin@Eagle2024');
  console.log('   Login at: http://localhost:3000/login');
}

main().catch(console.error).finally(() => p.$disconnect());
