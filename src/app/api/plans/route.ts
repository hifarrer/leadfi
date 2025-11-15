import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all plans ordered by displayOrder (public endpoint)
    const plans = await prisma.plan.findMany({
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Convert Decimal types to numbers for JSON serialization
    const serializedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice.toNumber(),
      yearlyPrice: plan.yearlyPrice.toNumber(),
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId,
      stripeYearlyPriceId: plan.stripeYearlyPriceId,
      features: plan.features as string[],
      isPopular: plan.isPopular,
      displayOrder: plan.displayOrder,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    }))

    return NextResponse.json(serializedPlans)
  } catch (error) {
    console.error('Plans fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

