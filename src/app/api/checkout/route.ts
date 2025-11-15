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

    const body = await request.json()
    const { planId, billingPeriod } = body // billingPeriod: 'monthly' | 'yearly'

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: 'Plan ID and billing period are required' },
        { status: 400 }
      )
    }

    if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
      return NextResponse.json(
        { error: 'Billing period must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Get Stripe settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    if (!settings?.stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'monthly' 
      ? plan.stripeMonthlyPriceId 
      : plan.stripeYearlyPriceId

    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${billingPeriod} billing` },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(settings.stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
    })

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingPeriod: billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          billingPeriod: billingPeriod,
        },
      },
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })
  } catch (error: any) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

