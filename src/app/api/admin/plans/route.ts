import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import { Prisma } from '@prisma/client'
import type { InputJsonValue } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
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

    // Get all plans ordered by displayOrder
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
    console.error('Admin plans list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, monthlyPrice, yearlyPrice, stripeMonthlyPriceId, stripeYearlyPriceId, features, isPopular, displayOrder } = body

    // Validate input
    if (!name || monthlyPrice === undefined || yearlyPrice === undefined || !features) {
      return NextResponse.json(
        { error: 'Name, monthlyPrice, yearlyPrice, and features are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Features must be an array' },
        { status: 400 }
      )
    }

    // Create plan
    const plan = await prisma.plan.create({
      data: {
        name,
        monthlyPrice: new Prisma.Decimal(monthlyPrice),
        yearlyPrice: new Prisma.Decimal(yearlyPrice),
        stripeMonthlyPriceId: stripeMonthlyPriceId || null,
        stripeYearlyPriceId: stripeYearlyPriceId || null,
        features: features as InputJsonValue,
        isPopular: isPopular || false,
        displayOrder: displayOrder || 0
      }
    })

    // Convert Decimal types to numbers for JSON serialization
    const serializedPlan = {
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
    }

    return NextResponse.json(serializedPlan, { status: 201 })
  } catch (error) {
    console.error('Admin plan create error:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}

