import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.planId) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      )
    }

    // Get Stripe settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    if (!settings?.stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(settings.stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
    })

    // Find the user's active subscription in Stripe
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
    })

    // Find subscription with matching metadata
    const userSubscription = subscriptions.data.find(
      sub => sub.metadata?.userId === user.id && sub.status !== 'canceled'
    )

    if (!userSubscription) {
      // If no subscription found in Stripe, just remove plan from database
      await prisma.user.update({
        where: { id: user.id },
        data: { planId: null }
      })

      return NextResponse.json({ 
        message: 'Subscription canceled',
        canceled: true 
      })
    }

    // Cancel the subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(
      userSubscription.id,
      {
        cancel_at_period_end: true,
      }
    )

    return NextResponse.json({ 
      message: 'Subscription will be canceled at the end of the billing period',
      canceled: false,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: canceledSubscription.current_period_end
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

