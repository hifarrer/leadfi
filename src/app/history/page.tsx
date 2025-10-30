'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface SearchHistory {
  id: string
  parameters: any
  resultCount: number
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSearchHistory()
    }
  }, [status, router])

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history')
      if (response.ok) {
        const data = await response.json()
        setSearchHistory(data)
      }
    } catch (error) {
      console.error('Error fetching search history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/search-history/${searchId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSearchHistory(prev => prev.filter(search => search.id !== searchId))
      }
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  const viewSearchResults = (searchId: string) => {
    // Navigate to search page with results - let the search page handle fetching
    router.push(`/search?searchId=${searchId}`)
  }

  if (status === 'loading' || isLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                New Search
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {searchHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No search history</h3>
                <p className="text-gray-500 mb-6">Your search history will appear here</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start Your First Search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Search History ({searchHistory.length} searches)
                </h2>
                
                {searchHistory.map((search) => (
                  <div key={search.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            Search #{search.id.slice(-8)}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {search.resultCount} results
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {format(new Date(search.createdAt), 'PPP p')}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {search.parameters.company_industry?.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Industries:</span>
                              <p className="text-gray-600">{search.parameters.company_industry.join(', ')}</p>
                            </div>
                          )}
                          
                          {search.parameters.contact_job_title?.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Job Titles:</span>
                              <p className="text-gray-600">{search.parameters.contact_job_title.join(', ')}</p>
                            </div>
                          )}
                          
                          {search.parameters.contact_location?.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Locations:</span>
                              <p className="text-gray-600">{search.parameters.contact_location.join(', ')}</p>
                            </div>
                          )}
                          
                          {search.parameters.size?.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Company Size:</span>
                              <p className="text-gray-600">{search.parameters.size.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => viewSearchResults(search.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => deleteSearch(search.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
