require('dotenv').config({ path: '.env' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedPlans() {
  try {
    console.log('🌱 Seeding plans...')

    // Check if plans already exist
    const existingPlans = await prisma.plan.count()
    if (existingPlans > 0) {
      console.log('⚠️  Plans already exist. Skipping seed.')
      return
    }

    // Create initial plans
    const plans = [
      {
        name: 'Free',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          '2 searches per month',
          '50 records per search',
          'Export to CSV & JSON',
          'Search history'
        ],
        isPopular: false,
        displayOrder: 0
      },
      {
        name: 'Basic',
        monthlyPrice: 15,
        yearlyPrice: 150, // $15/month * 10 months (20% discount for yearly)
        features: [
          '100 searches per month',
          '100 records per search',
          'Export to CSV & JSON',
          'Search history',
          'Priority support'
        ],
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Ultra',
        monthlyPrice: 25,
        yearlyPrice: 250, // $25/month * 10 months (20% discount for yearly)
        features: [
          '1,000 searches per month',
          '1,000 records per search',
          'Export to CSV & JSON',
          'Search history',
          'Priority support',
          'Advanced filters'
        ],
        isPopular: false,
        displayOrder: 2
      }
    ]

    for (const plan of plans) {
      await prisma.plan.create({
        data: plan
      })
      console.log(`✅ Created plan: ${plan.name}`)
    }

    console.log('🎉 Plans seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding plans:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedPlans()

