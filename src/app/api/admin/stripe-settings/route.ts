import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

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

    // Get or create settings (singleton pattern)
    let settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    // If settings don't exist, create them
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'settings',
          stripePublishableKey: null,
          stripeSecretKey: null,
          stripeWebhookSecret: null
        }
      })
    }

    // Return settings (mask secret key for security - only show last 4 characters)
    const maskedSecretKey = settings.stripeSecretKey 
      ? `****${settings.stripeSecretKey.slice(-4)}` 
      : null

    return NextResponse.json({
      stripePublishableKey: settings.stripePublishableKey,
      stripeSecretKey: maskedSecretKey, // Only return masked version
      stripeWebhookSecret: settings.stripeWebhookSecret,
      hasSecretKey: !!settings.stripeSecretKey // Indicate if secret key exists
    })
  } catch (error) {
    console.error('Admin stripe settings get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Stripe settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { stripePublishableKey, stripeSecretKey, stripeWebhookSecret } = body

    // Get current settings
    let settings = await prisma.settings.findUnique({
      where: { id: 'settings' }
    })

    // Prepare update data
    const updateData: any = {}
    
    if (stripePublishableKey !== undefined) {
      updateData.stripePublishableKey = stripePublishableKey?.trim() || null
    }
    
    // Only update secret key if a new value is provided (not masked value)
    if (stripeSecretKey !== undefined && !stripeSecretKey?.startsWith('****')) {
      updateData.stripeSecretKey = stripeSecretKey?.trim() || null
    }
    
    if (stripeWebhookSecret !== undefined) {
      updateData.stripeWebhookSecret = stripeWebhookSecret?.trim() || null
    }

    // Update or create settings
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: 'settings' },
        data: updateData
      })
    } else {
      settings = await prisma.settings.create({
        data: {
          id: 'settings',
          stripePublishableKey: updateData.stripePublishableKey || null,
          stripeSecretKey: updateData.stripeSecretKey || null,
          stripeWebhookSecret: updateData.stripeWebhookSecret || null
        }
      })
    }

    // Return updated settings (mask secret key)
    const maskedSecretKey = settings.stripeSecretKey 
      ? `****${settings.stripeSecretKey.slice(-4)}` 
      : null

    return NextResponse.json({
      stripePublishableKey: settings.stripePublishableKey,
      stripeSecretKey: maskedSecretKey,
      stripeWebhookSecret: settings.stripeWebhookSecret,
      hasSecretKey: !!settings.stripeSecretKey
    })
  } catch (error) {
    console.error('Admin stripe settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Stripe settings' },
      { status: 500 }
    )
  }
}

