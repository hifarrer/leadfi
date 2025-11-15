import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import type { InputJsonValue } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  console.log('[SEARCH-LEADS] Request received')
  try {
    console.log('[SEARCH-LEADS] Getting session...')
    const session = await getServerSession(authOptions)
    console.log('[SEARCH-LEADS] Session:', session ? 'found' : 'not found')
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[SEARCH-LEADS] Parsing request body...')
    const searchParams = await request.json()
    console.log('[SEARCH-LEADS] Search parameters received:', JSON.stringify(searchParams, null, 2))
    
    // Filter out empty arrays and empty strings from search parameters
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        if (typeof value === 'string') {
          return value.trim() !== ''
        }
        return value !== null && value !== undefined
      })
    )
    
    console.log('[SEARCH-LEADS] Filtered parameters:', JSON.stringify(filteredParams, null, 2))
    
    // Get user with plan to check limits
    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Check search limit (searches per month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const searchesThisMonth = await prisma.searchHistory.count({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    const userSearchLimit = user.plan?.searchLimit || 2
    if (searchesThisMonth >= userSearchLimit) {
      return NextResponse.json(
        { 
          error: 'Search limit reached',
          details: `You have reached your monthly search limit of ${userSearchLimit} searches. Please upgrade your plan or wait until next month.`,
          searchesUsed: searchesThisMonth,
          searchLimit: userSearchLimit
        },
        { status: 403 }
      )
    }

    // Enforce rows limit based on user's plan
    const userRowsLimit = user.plan?.rowsLimit || 50
    const fetchCountValue = filteredParams.fetch_count
    let validatedFetchCount = userRowsLimit // default to user's plan limit
    
    if (fetchCountValue !== undefined && fetchCountValue !== null) {
      const requestedCount = typeof fetchCountValue === 'string' 
        ? parseInt(fetchCountValue, 10) 
        : typeof fetchCountValue === 'number'
        ? fetchCountValue
        : userRowsLimit
        
      if (!isNaN(requestedCount)) {
        // Limit to user's plan rowsLimit
        validatedFetchCount = Math.min(Math.max(requestedCount, 1), userRowsLimit)
        if (requestedCount > userRowsLimit) {
          console.warn(`[SEARCH-LEADS] User attempted to request ${requestedCount} records, limiting to ${userRowsLimit} (plan limit)`)
        }
      }
    }
    
    filteredParams.fetch_count = validatedFetchCount
    console.log('[SEARCH-LEADS] Validated fetch_count:', validatedFetchCount, `(Plan limit: ${userRowsLimit})`)
    
    // Ensure we have at least some parameters
    console.log('[SEARCH-LEADS] Validating parameters...')
    if (Object.keys(filteredParams).length === 0) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    // Call Apify API
    console.log('[SEARCH-LEADS] Getting Apify token...')
    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      console.error('[SEARCH-LEADS] ERROR: APIFY_API_TOKEN not set')
      return NextResponse.json(
        { error: 'APIFY_API_TOKEN environment variable is not set' },
        { status: 500 }
      )
    }

    console.log('[SEARCH-LEADS] Calling Apify API...')
    console.log('[SEARCH-LEADS] Apify request URL:', `https://api.apify.com/v2/acts/code_crafter~leads-finder/run-sync-get-dataset-items?token=***`)
    console.log('[SEARCH-LEADS] Request payload:', JSON.stringify(filteredParams, null, 2))
    
    let apifyResponse;
    const startTime = Date.now()
    try {
      console.log('[SEARCH-LEADS] Starting Apify request at:', new Date().toISOString())
      
      apifyResponse = await axios.post(
        `https://api.apify.com/v2/acts/code_crafter~leads-finder/run-sync-get-dataset-items?token=${apifyToken}`,
        filteredParams,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 minutes timeout (120 seconds should be enough for 50-100 records)
        }
      )
      
      const duration = Date.now() - startTime
      console.log(`[SEARCH-LEADS] Apify request completed in ${duration}ms (${(duration/1000).toFixed(2)}s)`)
    } catch (apiError) {
      const duration = Date.now() - startTime
      console.error(`[SEARCH-LEADS] Apify API error occurred after ${duration}ms`)
      
      if (axios.isAxiosError(apiError)) {
        // Handle timeout errors
        if (apiError.code === 'ECONNABORTED' || apiError.message.includes('timeout')) {
          console.error('[SEARCH-LEADS] Request timeout - Apify took too long to respond')
          return NextResponse.json(
            { 
              error: 'Request timeout',
              details: 'The search is taking longer than expected. Please try again or reduce the number of results.'
            },
            { status: 504 }
          )
        }
        
        const errorData = apiError.response?.data
        console.error('[SEARCH-LEADS] Apify API error response:', JSON.stringify(errorData, null, 2))
        
        // Check if it's a validation error
        if (errorData?.error?.type === 'invalid-input') {
          const errorMessage = errorData.error.message || 'Invalid search parameters'
          console.error('[SEARCH-LEADS] Validation error:', errorMessage)
          return NextResponse.json(
            { 
              error: 'Invalid search parameters',
              details: errorMessage
            },
            { status: 400 }
          )
        }
        
        // Return a user-friendly error message
        return NextResponse.json(
          { 
            error: 'Failed to search leads',
            details: errorData?.error?.message || apiError.message || 'An error occurred while searching'
          },
          { status: apiError.response?.status || 500 }
        )
      } else if (apiError instanceof Error) {
        console.error('[SEARCH-LEADS] Apify API error:', apiError.message)
      } else {
        console.error('[SEARCH-LEADS] Apify API error:', String(apiError))
      }
      throw apiError; // Re-throw other errors to be handled by the outer catch block
    }

    console.log('[SEARCH-LEADS] Apify API response received')
    console.log('[SEARCH-LEADS] Response status:', apifyResponse.status)
    console.log('[SEARCH-LEADS] Response data type:', typeof apifyResponse.data)
    console.log('[SEARCH-LEADS] Response data keys:', apifyResponse.data ? Object.keys(apifyResponse.data) : 'no data')
    
    // Handle different response structures from Apify
    let leads = []
    if (Array.isArray(apifyResponse.data)) {
      leads = apifyResponse.data
    } else if (apifyResponse.data?.data && Array.isArray(apifyResponse.data.data)) {
      leads = apifyResponse.data.data
    } else if (apifyResponse.data?.items && Array.isArray(apifyResponse.data.items)) {
      leads = apifyResponse.data.items
    } else if (apifyResponse.data?.results && Array.isArray(apifyResponse.data.results)) {
      leads = apifyResponse.data.results
    }
    
    console.log(`[SEARCH-LEADS] Extracted ${leads.length} leads from Apify response`)
    
    if (leads.length === 0) {
      console.warn('[SEARCH-LEADS] WARNING: No leads found in response. Full response:', JSON.stringify(apifyResponse.data, null, 2))
    }

    // Save search history
    console.log('[SEARCH-LEADS] Initializing Prisma for search history...')
    let searchHistory;
    try {
      console.log('[SEARCH-LEADS] Creating search history in database...')
      searchHistory = await prisma.searchHistory.create({
        data: {
          userId: (session.user as any).id,
          parameters: filteredParams as InputJsonValue,
          resultCount: leads.length
        }
      })
      console.log('[SEARCH-LEADS] Search history created successfully:', searchHistory.id)
    } catch (dbError) {
      console.error('[SEARCH-LEADS] ERROR creating search history:', dbError)
      if (dbError instanceof Error) {
        console.error('[SEARCH-LEADS] Error name:', dbError.name)
        console.error('[SEARCH-LEADS] Error message:', dbError.message)
        console.error('[SEARCH-LEADS] Error stack:', dbError.stack)
      }
      throw dbError
    }

    // Save leads to database
    const leadData = leads.map((lead: any) => ({
      searchHistoryId: searchHistory.id,
      firstName: lead.first_name || null,
      lastName: lead.last_name || null,
      email: lead.email || null,
      personalEmail: lead.personal_email || null,
      fullName: lead.full_name || null,
      jobTitle: lead.job_title || null,
      linkedin: lead.linkedin || null,
      companyName: lead.company_name || null,
      companyWebsite: lead.company_website || null,
      industry: lead.industry || null,
      companySize: lead.company_size ? String(lead.company_size) : null,
      headline: lead.headline || null,
      seniorityLevel: lead.seniority_level || null,
      functionalLevel: lead.functional_level || null,
      city: lead.city || null,
      state: lead.state || null,
      country: lead.country || null,
      companyLinkedin: lead.company_linkedin || null,
      companyLinkedinUid: lead.company_linkedin_uid ? String(lead.company_linkedin_uid) : null,
      companyFoundedYear: lead.company_founded_year ? String(lead.company_founded_year) : null,
      companyDomain: lead.company_domain || null,
      companyPhone: lead.company_phone || null,
      companyStreetAddress: lead.company_street_address || null,
      companyFullAddress: lead.company_full_address || null,
      companyState: lead.company_state || null,
      companyCity: lead.company_city || null,
      companyCountry: lead.company_country || null,
      companyPostalCode: lead.company_postal_code || null,
      keywords: lead.keywords || null,
      companyDescription: lead.company_description || null,
      companyAnnualRevenue: lead.company_annual_revenue ? String(lead.company_annual_revenue) : null,
      companyAnnualRevenueClean: lead.company_annual_revenue_clean ? String(lead.company_annual_revenue_clean) : null,
      companyTotalFunding: lead.company_total_funding ? String(lead.company_total_funding) : null,
      companyTotalFundingClean: lead.company_total_funding_clean ? String(lead.company_total_funding_clean) : null,
      companyTechnologies: lead.company_technologies || null,
    }))

    console.log('[SEARCH-LEADS] Preparing to save leads...')
    try {
      console.log(`[SEARCH-LEADS] Saving ${leadData.length} leads to database...`)
      if (leadData.length > 0) {
        await prisma.lead.createMany({
          data: leadData
        })
        console.log('[SEARCH-LEADS] Leads saved successfully')
      } else {
        console.log('[SEARCH-LEADS] No leads to save')
      }
    } catch (dbError) {
      console.error('[SEARCH-LEADS] ERROR saving leads:', dbError)
      if (dbError instanceof Error) {
        console.error('[SEARCH-LEADS] Error name:', dbError.name)
        console.error('[SEARCH-LEADS] Error message:', dbError.message)
        console.error('[SEARCH-LEADS] Error stack:', dbError.stack)
      }
      throw dbError
    }

    // Return the processed data from database instead of raw API response
    console.log('[SEARCH-LEADS] Fetching saved leads...')
    let savedLeads;
    try {
      console.log('[SEARCH-LEADS] Querying database for saved leads...')
      savedLeads = await prisma.lead.findMany({
        where: {
          searchHistoryId: searchHistory.id
        }
      })
      console.log(`[SEARCH-LEADS] Retrieved ${savedLeads.length} saved leads`)
    } catch (dbError) {
      console.error('[SEARCH-LEADS] ERROR fetching saved leads:', dbError)
      if (dbError instanceof Error) {
        console.error('[SEARCH-LEADS] Error name:', dbError.name)
        console.error('[SEARCH-LEADS] Error message:', dbError.message)
        console.error('[SEARCH-LEADS] Error stack:', dbError.stack)
      }
      throw dbError
    }

    console.log('[SEARCH-LEADS] Returning success response')
    return NextResponse.json({ leads: savedLeads })
  } catch (error) {
    // Enhanced error logging
    console.error('[SEARCH-LEADS] ========== FATAL ERROR ==========')
    console.error('[SEARCH-LEADS] Error object:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Log more details about the error
    let errorMessage = 'Unknown error';
    let errorDetails: any = null;
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
      errorDetails = error.response?.data;
      if (error.response) {
        console.error('Error response:', JSON.stringify(error.response.data, null, 2))
        console.error('Error status:', error.response.status)
        console.error('Error headers:', error.response.headers)
      }
      console.error('Request URL:', error.config?.url)
      console.error('Request data:', JSON.stringify(error.config?.data, null, 2))
    } else if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error name:', error.name)
      console.error('Error cause:', (error as any).cause)
    } else {
      errorMessage = String(error);
      console.error('Error type:', typeof error)
      console.error('Error value:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to search leads',
        details: errorDetails || errorMessage
      },
      { status: 500 }
    )
  }
}
