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

    // Get statistics
    const [
      totalUsers,
      totalSearches,
      totalLeads,
      usersLast30Days,
      searchesLast30Days,
      leadsLast30Days,
      recentUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total searches
      prisma.searchHistory.count(),
      
      // Total leads
      prisma.lead.count(),
      
      // Users created in last 30 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Searches in last 30 days
      prisma.searchHistory.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Leads in last 30 days
      prisma.lead.count({
        where: {
          searchHistory: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }),
      
      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              searchHistory: true
            }
          }
        }
      })
    ])

    // Get searches per day for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const searchesByDay = await prisma.searchHistory.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Format searches by day
    const searchesByDayFormatted = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)
      
      const count = searchesByDay.find(s => {
        const searchDate = new Date(s.createdAt)
        searchDate.setHours(0, 0, 0, 0)
        return searchDate.getTime() === date.getTime()
      })
      
      return {
        date: date.toISOString().split('T')[0],
        count: count?._count.id || 0
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSearches,
        totalLeads,
        usersLast30Days,
        searchesLast30Days,
        leadsLast30Days
      },
      searchesByDay: searchesByDayFormatted,
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        searchCount: user._count.searchHistory
      }))
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

