import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tuition.com' },
    update: {
      role: 'ADMIN' // Just in case it existed as something else
    },
    create: {
      email: 'admin@tuition.com',
      name: 'System Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  
  console.log('Admin user seeded securely:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
