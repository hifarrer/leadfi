import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    // Delete the search history (leads will be deleted due to cascade)
    await prisma.searchHistory.delete({
      where: {
        id: searchId
      }
    })

    return NextResponse.json({ message: 'Search deleted successfully' })
  } catch (error) {
    console.error('Delete search error:', error)
    return NextResponse.json(
      { error: 'Failed to delete search' },
      { status: 500 }
    )
  }
}
