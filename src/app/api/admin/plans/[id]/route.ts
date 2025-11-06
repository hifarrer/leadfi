import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import { Prisma } from '@prisma/client'
import type { InputJsonValue } from '@prisma/client/runtime/library'

export async function GET(
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

    const plan = await prisma.plan.findUnique({
      where: { id }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Convert Decimal types to numbers for JSON serialization
    const serializedPlan = {
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice.toNumber(),
      yearlyPrice: plan.yearlyPrice.toNumber(),
      features: plan.features as string[],
      isPopular: plan.isPopular,
      displayOrder: plan.displayOrder,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    }

    return NextResponse.json(serializedPlan)
  } catch (error) {
    console.error('Admin plan get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}

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
    const { name, monthlyPrice, yearlyPrice, features, isPopular, displayOrder } = body

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name
    }
    if (monthlyPrice !== undefined) {
      updateData.monthlyPrice = new Prisma.Decimal(monthlyPrice)
    }
    if (yearlyPrice !== undefined) {
      updateData.yearlyPrice = new Prisma.Decimal(yearlyPrice)
    }
    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return NextResponse.json(
          { error: 'Features must be an array' },
          { status: 400 }
        )
      }
      updateData.features = features as InputJsonValue
    }
    if (isPopular !== undefined) {
      updateData.isPopular = isPopular
    }
    if (displayOrder !== undefined) {
      updateData.displayOrder = displayOrder
    }

    // Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: updateData
    })

    // Convert Decimal types to numbers for JSON serialization
    const serializedPlan = {
      id: updatedPlan.id,
      name: updatedPlan.name,
      monthlyPrice: updatedPlan.monthlyPrice.toNumber(),
      yearlyPrice: updatedPlan.yearlyPrice.toNumber(),
      features: updatedPlan.features as string[],
      isPopular: updatedPlan.isPopular,
      displayOrder: updatedPlan.displayOrder,
      createdAt: updatedPlan.createdAt.toISOString(),
      updatedAt: updatedPlan.updatedAt.toISOString()
    }

    return NextResponse.json(serializedPlan)
  } catch (error) {
    console.error('Admin plan update error:', error)
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Delete plan
    await prisma.plan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Plan deleted successfully' })
  } catch (error) {
    console.error('Admin plan delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}

