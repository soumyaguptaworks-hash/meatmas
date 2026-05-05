import { PrismaClient, Role, AppContext } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('changeme', 10);

  const seeds = [
    {
      email: 'admin@meatmaster.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      appContext: AppContext.ADMIN,
    },
    {
      email: 'factory@meatmaster.com',
      name: 'Factory Manager',
      password: hashedPassword,
      role: Role.MANAGER,
      appContext: AppContext.FACTORY,
    },
    {
      email: 'pos@meatmaster.com',
      name: 'POS Operator',
      password: hashedPassword,
      role: Role.POS_OPERATOR,
      appContext: AppContext.POS,
    },
  ];

  for (const seed of seeds) {
    await prisma.user.upsert({
      where: { email: seed.email },
      update: { password: hashedPassword },
      create: seed,
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
