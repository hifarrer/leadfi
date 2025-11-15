'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import SearchForm from '@/components/SearchForm'
import LeadsGrid from '@/components/LeadsGrid'
import ExportButtons from '@/components/ExportButtons'
import ProgressBar from '@/components/ProgressBar'

interface Lead {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  personalEmail: string | null
  fullName: string | null
  jobTitle: string | null
  linkedin: string | null
  companyName: string | null
  companyWebsite: string | null
  industry: string | null
  companySize: string | null
  headline: string | null
  seniorityLevel: string | null
  functionalLevel: string | null
  city: string | null
  state: string | null
  country: string | null
  companyLinkedin: string | null
  companyLinkedinUid: string | null
  companyFoundedYear: string | null
  companyDomain: string | null
  companyPhone: string | null
  companyStreetAddress: string | null
  companyFullAddress: string | null
  companyState: string | null
  companyCity: string | null
  companyCountry: string | null
  companyPostalCode: string | null
  keywords: string | null
  companyDescription: string | null
  companyAnnualRevenue: string | null
  companyAnnualRevenueClean: string | null
  companyTotalFunding: string | null
  companyTotalFundingClean: string | null
  companyTechnologies: string | null
}

function SearchPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchFormParams, setSearchFormParams] = useState<any>(null)
  const [fetchCount, setFetchCount] = useState(50)
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null)
  const [userLimits, setUserLimits] = useState<{
    planName: string
    rowsLimit: number
    searchLimit: number
    searchesUsed: number
    searchesRemaining: number
    canSearch: boolean
  } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchUserLimits()
    }
  }, [status, router])

  const fetchUserLimits = async () => {
    try {
      const response = await fetch('/api/user/limits')
      if (response.ok) {
        const data = await response.json()
        setUserLimits(data)
      }
    } catch (error) {
      console.error('Error fetching user limits:', error)
    }
  }

  // Extract searchId from URL params
  const searchId = searchParams.get('searchId')

  useEffect(() => {
    // Check for searchId in URL params to load saved search results
    if (searchId && status === 'authenticated' && currentSearchId !== searchId) {
      setCurrentSearchId(searchId)
      loadSavedSearchResults(searchId)
    } else if (!searchId && currentSearchId) {
      // Reset when searchId is removed from URL
      setCurrentSearchId(null)
      setShowResults(false)
      setLeads([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId, status])

  const loadSavedSearchResults = async (searchId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search-history/${searchId}/leads`)
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error loading saved search results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (params: any) => {
    setIsLoading(true)
    setSearchError(null)
    setSearchFormParams(params)
    setFetchCount(params.fetch_count || 50)
    
    try {
      const response = await fetch('/api/search-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 403 && errorData.error === 'Search limit reached') {
          setSearchError(errorData.details || 'Search limit reached')
          // Refresh limits to show updated count
          fetchUserLimits()
        } else {
          throw new Error(errorData.details || errorData.error || 'Search failed')
        }
        return
      }

      const data = await response.json()
      setLeads(data.leads)
      setShowResults(true)
      // Refresh limits after successful search
      fetchUserLimits()
    } catch (error: any) {
      console.error('Search error:', error)
      setSearchError(error.message || 'Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setShowResults(false)
    setLeads([])
    setSearchFormParams(null)
    // Clear the searchId from URL
    router.push('/search')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MagnifyingGlassIcon className="h-7 w-7 text-blue-600" />
              LeadFind
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Home
              </button>
              <button
                onClick={() => router.push('/blog')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Blog
              </button>
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
              <button
                onClick={() => router.push('/history')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Search History
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Profile
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {!showResults ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* User Limits Display */}
            {userLimits && (
              <div className="mb-6 bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {userLimits.planName} Plan
                    </h3>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Searches this month: </span>
                        <span className={`font-semibold ${userLimits.searchesRemaining === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {userLimits.searchesUsed} / {userLimits.searchLimit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max results per search: </span>
                        <span className="font-semibold text-gray-900">{userLimits.rowsLimit}</span>
                      </div>
                    </div>
                  </div>
                  {userLimits.searchesRemaining === 0 && (
                    <Link
                      href="/pricing"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {searchError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {searchError}
              </div>
            )}

            {isLoading && (
              <div className="mb-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <ProgressBar fetchCount={fetchCount} isActive={isLoading} />
                </div>
              </div>
            )}
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                  <p className="text-gray-600">{leads.length} leads found</p>
                </div>
                <div className="flex space-x-4">
                  <ExportButtons leads={leads} />
                  <button
                    onClick={handleBackToSearch}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    New Search
                  </button>
                </div>
              </div>
              <LeadsGrid leads={leads} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}

