import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import type { InputJsonValue } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = await request.json()
    
    // Log the search parameters for debugging
    console.log('Search parameters received:', JSON.stringify(searchParams, null, 2))
    
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
    
    console.log('Filtered parameters:', JSON.stringify(filteredParams, null, 2))
    
    // Ensure we have at least some parameters
    if (Object.keys(filteredParams).length === 0) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    // Call Apify API
    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      return NextResponse.json(
        { error: 'APIFY_API_TOKEN environment variable is not set' },
        { status: 500 }
      )
    }

    let apifyResponse;
    try {
      apifyResponse = await axios.post(
        `https://api.apify.com/v2/acts/code_crafter~leads-finder/run-sync-get-dataset-items?token=${apifyToken}`,
        filteredParams,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        console.error('Apify API error:', apiError.response?.data || apiError.message);
      } else if (apiError instanceof Error) {
        console.error('Apify API error:', apiError.message);
      } else {
        console.error('Apify API error:', String(apiError));
      }
      throw apiError; // Re-throw the error to be handled by the outer catch block
    }

    const leads = apifyResponse.data || []
    console.log(`Received ${leads.length} leads from Apify API`)

    // Save search history
    let searchHistory;
    try {
      console.log('Creating search history...')
      searchHistory = await prisma.searchHistory.create({
        data: {
          userId: (session.user as any).id,
          parameters: filteredParams as InputJsonValue,
          resultCount: leads.length
        }
      })
      console.log('Search history created:', searchHistory.id)
    } catch (dbError) {
      console.error('Error creating search history:', dbError)
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
      companySize: lead.company_size || null,
      headline: lead.headline || null,
      seniorityLevel: lead.seniority_level || null,
      functionalLevel: lead.functional_level || null,
      city: lead.city || null,
      state: lead.state || null,
      country: lead.country || null,
      companyLinkedin: lead.company_linkedin || null,
      companyLinkedinUid: lead.company_linkedin_uid || null,
      companyFoundedYear: lead.company_founded_year || null,
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
      companyAnnualRevenue: lead.company_annual_revenue || null,
      companyAnnualRevenueClean: lead.company_annual_revenue_clean || null,
      companyTotalFunding: lead.company_total_funding || null,
      companyTotalFundingClean: lead.company_total_funding_clean || null,
      companyTechnologies: lead.company_technologies || null,
    }))

    try {
      console.log(`Saving ${leadData.length} leads to database...`)
      if (leadData.length > 0) {
        await prisma.lead.createMany({
          data: leadData
        })
        console.log('Leads saved successfully')
      } else {
        console.log('No leads to save')
      }
    } catch (dbError) {
      console.error('Error saving leads:', dbError)
      throw dbError
    }

    // Return the processed data from database instead of raw API response
    let savedLeads;
    try {
      console.log('Fetching saved leads from database...')
      savedLeads = await prisma.lead.findMany({
        where: {
          searchHistoryId: searchHistory.id
        }
      })
      console.log(`Retrieved ${savedLeads.length} saved leads`)
    } catch (dbError) {
      console.error('Error fetching saved leads:', dbError)
      throw dbError
    }

    return NextResponse.json({ leads: savedLeads })
  } catch (error) {
    // Enhanced error logging
    console.error('Search leads error:', error)
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
