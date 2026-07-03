
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = 'codguru@stephud.com'
  const password = 'CoDMobile2026!'
  const name = 'CoD Guide Master'
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('User already exists, skipping creation')
    console.log('User ID:', existing.id)
    return
  }
  
  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      termsAcceptedAt: new Date(),
    }
  })
  console.log('Created user:', user.email, 'ID:', user.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
