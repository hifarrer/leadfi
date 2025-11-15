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
        plan: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate searches this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const searchesThisMonth = await prisma.searchHistory.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const rowsLimit = user.plan?.rowsLimit || 50
    const searchLimit = user.plan?.searchLimit || 2
    const planName = user.plan?.name || 'Free'

    return NextResponse.json({
      planName,
      rowsLimit,
      searchLimit,
      searchesUsed: searchesThisMonth,
      searchesRemaining: Math.max(0, searchLimit - searchesThisMonth),
      canSearch: searchesThisMonth < searchLimit
    })
  } catch (error) {
    console.error('User limits fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user limits' },
      { status: 500 }
    )
  }
}

