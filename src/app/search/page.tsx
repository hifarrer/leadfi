'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchParams, setSearchParams] = useState<any>(null)
  const [fetchCount, setFetchCount] = useState(50)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Check for searchId in URL params to load saved search results
    const urlParams = new URLSearchParams(window.location.search)
    const searchId = urlParams.get('searchId')
    
    if (searchId && status === 'authenticated') {
      loadSavedSearchResults(searchId)
    }
  }, [status])

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
    setSearchParams(params)
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
        throw new Error('Search failed')
      }

      const data = await response.json()
      setLeads(data.leads)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setShowResults(false)
    setLeads([])
    setSearchParams(null)
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

