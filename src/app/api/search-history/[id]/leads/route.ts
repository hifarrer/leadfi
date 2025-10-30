import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: searchId } = await params

    // Verify the search belongs to the user
    const searchHistory = await prisma.searchHistory.findFirst({
      where: {
        id: searchId,
        userId: (session.user as any).id
      }
    })

    if (!searchHistory) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    // Get the leads for this search
    const leads = await prisma.lead.findMany({
      where: {
        searchHistoryId: searchId
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Get search leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search leads' },
      { status: 500 }
    )
  }
}
