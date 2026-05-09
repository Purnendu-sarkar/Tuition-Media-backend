import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 3 });
  console.log("Here are some User IDs from your Database:");
  users.forEach(u => console.log(`Name: ${u.name} | Role: ${u.role} | ID: ${u.id}`));
}

main().finally(() => prisma.$disconnect());
