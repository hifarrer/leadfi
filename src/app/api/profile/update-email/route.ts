import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const userId = (session.user as any).id

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      )
    }

    // Check if email is the same as current
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (currentUser?.email === email) {
      return NextResponse.json(
        { error: 'This is already your email address' },
        { status: 400 }
      )
    }

    // Update email
    await prisma.user.update({
      where: { id: userId },
      data: { email }
    })

    return NextResponse.json(
      { message: 'Email updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

