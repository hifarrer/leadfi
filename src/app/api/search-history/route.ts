import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchHistory = await prisma.searchHistory.findMany({
      where: {
        userId: (session.user as any).id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(searchHistory)
  } catch (error) {
    console.error('Search history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    )
  }
}
