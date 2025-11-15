import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Get Stripe settings
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    if (!settings?.stripeSecretKey || !settings.stripeWebhookSecret) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(settings.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })

    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        settings.stripeWebhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.metadata) {
          const { userId, planId } = session.metadata

          if (userId && planId) {
            // Update user's plan
            await prisma.user.update({
              where: { id: userId },
              data: { planId: planId }
            })

            console.log(`User ${userId} subscribed to plan ${planId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        if (subscription.metadata?.userId && subscription.metadata?.planId) {
          const { userId, planId } = subscription.metadata

          // Update user's plan
          await prisma.user.update({
            where: { id: userId },
            data: { planId: planId }
          })

          console.log(`User ${userId} subscription updated to plan ${planId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        if (subscription.metadata?.userId) {
          const { userId } = subscription.metadata

          // Remove user's plan (set to null)
          await prisma.user.update({
            where: { id: userId },
            data: { planId: null }
          })

          console.log(`User ${userId} subscription canceled`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          if (subscription.metadata?.userId && subscription.metadata?.planId) {
            const { userId, planId } = subscription.metadata

            // Ensure user's plan is up to date
            await prisma.user.update({
              where: { id: userId },
              data: { planId: planId }
            })

            console.log(`Payment succeeded for user ${userId}, plan ${planId}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          if (subscription.metadata?.userId) {
            const { userId } = subscription.metadata
            console.log(`Payment failed for user ${userId}`)
            // You might want to send an email notification here
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

