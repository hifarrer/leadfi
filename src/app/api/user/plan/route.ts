import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with plan
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true,
            features: true,
            isPopular: true,
            displayOrder: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      planId: user.planId,
      plan: user.plan ? {
        id: user.plan.id,
        name: user.plan.name,
        monthlyPrice: user.plan.monthlyPrice.toNumber(),
        yearlyPrice: user.plan.yearlyPrice.toNumber(),
        features: user.plan.features as string[],
        isPopular: user.plan.isPopular,
        displayOrder: user.plan.displayOrder
      } : null
    })
  } catch (error) {
    console.error('User plan fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user plan' },
      { status: 500 }
    )
  }
}

