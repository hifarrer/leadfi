import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { planId } = body

    // Validate input
    if (planId !== null && planId !== undefined) {
      // Check if plan exists
      const plan = await prisma.plan.findUnique({
        where: { id: planId }
      })

      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        )
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        planId: planId || null
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true
          }
        }
      }
    })

    // Serialize plan if it exists
    const serializedPlan = updatedUser.plan ? {
      id: updatedUser.plan.id,
      name: updatedUser.plan.name,
      monthlyPrice: updatedUser.plan.monthlyPrice.toNumber(),
      yearlyPrice: updatedUser.plan.yearlyPrice.toNumber()
    } : null

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      plan: serializedPlan,
      planId: updatedUser.planId
    })
  } catch (error) {
    console.error('Admin user plan update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user plan' },
      { status: 500 }
    )
  }
}

