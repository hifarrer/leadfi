'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import MultiSelect from './MultiSelect'

interface SearchFormProps {
  onSearch: (params: any) => void
  isLoading: boolean
}

const INDUSTRIES = [
  'information technology & services',
  'construction',
  'marketing & advertising',
  'real estate',
  'health, wellness & fitness',
  'management consulting',
  'computer software',
  'internet',
  'retail',
  'financial services',
  'consumer services',
  'hospital & health care',
  'automotive',
  'restaurants',
  'education management',
  'food & beverages',
  'design',
  'hospitality',
  'accounting',
  'events services',
  'nonprofit organization management',
  'entertainment',
  'electrical/electronic manufacturing',
  'leisure, travel & tourism',
  'professional training & coaching',
  'transportation/trucking/railroad',
  'law practice',
  'apparel & fashion',
  'architecture & planning',
  'mechanical or industrial engineering',
  'insurance',
  'telecommunications',
  'human resources',
  'staffing & recruiting',
  'sports',
  'legal services',
  'media production',
  'oil & energy',
  'wholesale',
  'machinery',
  'consumer goods',
  'music',
  'photography',
  'medical practice',
  'cosmetics',
  'environmental services',
  'graphic design',
  'business supplies & equipment',
  'renewables & environment',
  'facilities services',
  'publishing',
  'arts & crafts',
  'food production',
  'building materials',
  'civil engineering',
  'public relations & communications',
  'religious institutions',
  'printing',
  'higher education',
  'mining & metals',
  'furniture',
  'logistics & supply chain',
  'research',
  'pharmaceuticals',
  'individual & family services',
  'medical devices',
  'biotechnology',
  'information services',
  'international trade & development',
  'motion pictures & film',
  'broadcast media',
  'consumer electronics',
  'banking',
  'import & export',
  'primary/secondary education',
  'fine art',
  'airlines/aviation',
  'computer & network security',
  'maritime',
  'luxury goods & jewelry',
  'veterinary',
  'venture capital & private equity',
  'mental health care',
  'industrial automation',
  'recreational facilities & services',
  'textiles',
  'performing arts',
  'utilities',
  'sporting goods',
  'wine & spirits',
  'plastics',
  'aviation & aerospace',
  'program development',
  'translation & localization',
  'philanthropy',
  'public safety',
  'investment banking',
  'government relations',
  'law enforcement',
  'fund-raising',
  'package/freight delivery',
  'wireless',
  'political organization',
  'international affairs',
  'public policy',
  'libraries',
  'gambling & casinos',
  'animation',
  'dairy',
  'supermarkets',
  'fishery',
  'military',
  'ranching',
  'railroad manufacture',
  'semiconductors',
  'capital markets',
  'glass, ceramics & concrete',
  'think tanks',
  'paper & forest products',
  'newspapers',
  'shipbuilding',
  'defense & space',
  'warehousing',
  'museums & institutions',
  'alternative medicine',
  'market research',
  'computer networking',
  'computer hardware',
  'executive office',
  'packaging & containers',
  'computer games',
  'commercial real estate',
  'writing & editing',
  'chemicals',
  'government administration',
  'online media',
  'investment management',
  'farming',
  'outsourcing/offshoring',
  'tobacco',
  'security & investigations',
  'e-learning',
  'judiciary',
  'alternative dispute resolution',
  'nanotechnology',
  'civic & social organization',
  'agriculture',
  'legislative office'
]

const JOB_TITLES = [
  'ceo',
  'cto',
  'cmo',
  'manager',
  'director',
  'vp',
  'realtor',
  'sales manager',
  'marketing manager',
  'business owner'
]

const LOCATIONS = [
  'united states',
  'canada',
  'united kingdom',
  'australia',
  'germany',
  'france',
  'netherlands',
  'singapore',
  'japan',
  'india'
]

const EMAIL_STATUS = [
  'validated',
  'not_validated',
  'unknown'
]

// Display labels for email status (user-friendly format)
const EMAIL_STATUS_LABELS: Record<string, string> = {
  'validated': 'Validated',
  'not_validated': 'Not Validated',
  'unknown': 'Unknown'
}

const REVENUE_OPTIONS = [
  '100K',
  '500K',
  '1M',
  '10M',
  '50M',
  '100M+'
]

// Helper function to format industry names for display (capitalize each word)
function formatIndustryLabel(industry: string): string {
  return industry
    .split(/[\s&/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
}

// Display labels for proper case display
const DISPLAY_LABELS = {
  industries: Object.fromEntries(
    INDUSTRIES.map(industry => [industry, formatIndustryLabel(industry)])
  ),
  jobTitles: {
    'ceo': 'CEO',
    'cto': 'CTO',
    'cmo': 'CMO',
    'manager': 'Manager',
    'director': 'Director',
    'vp': 'VP',
    'realtor': 'Realtor',
    'sales manager': 'Sales Manager',
    'marketing manager': 'Marketing Manager',
    'business owner': 'Business Owner'
  },
  locations: {
    'united states': 'United States',
    'canada': 'Canada',
    'united kingdom': 'United Kingdom',
    'australia': 'Australia',
    'germany': 'Germany',
    'france': 'France',
    'netherlands': 'Netherlands',
    'singapore': 'Singapore',
    'japan': 'Japan',
    'india': 'India'
  }
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [formData, setFormData] = useState({
    company_industry: [] as string[],
    company_keywords: [] as string[],
    contact_job_title: [] as string[],
    contact_location: [] as string[],
    email_status: [] as string[],
    min_revenue: '',
    fetch_count: 50
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [userLimits, setUserLimits] = useState<{
    planName: string
    rowsLimit: number
    searchLimit: number
    searchesUsed: number
    searchesRemaining: number
    canSearch: boolean
  } | null>(null)
  const [loadingLimits, setLoadingLimits] = useState(true)

  useEffect(() => {
    fetchUserLimits()
  }, [])

  const fetchUserLimits = async () => {
    try {
      setLoadingLimits(true)
      const response = await fetch('/api/user/limits')
      if (response.ok) {
        const data = await response.json()
        setUserLimits(data)
        // Set initial fetch_count to user's plan limit
        setFormData(prev => ({
          ...prev,
          fetch_count: Math.min(prev.fetch_count, data.rowsLimit)
        }))
      }
    } catch (error) {
      console.error('Error fetching user limits:', error)
    } finally {
      setLoadingLimits(false)
    }
  }


  const handleKeywordAdd = () => {
    if (keywordInput.trim() && !formData.company_keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        company_keywords: [...prev.company_keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      company_keywords: prev.company_keywords.filter(k => k !== keyword)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user can search
    if (userLimits && !userLimits.canSearch) {
      alert(`You have reached your monthly search limit of ${userLimits.searchLimit} searches. Please upgrade your plan or wait until next month.`)
      return
    }
    
    // Enforce rows limit based on user's plan
    const maxRows = userLimits?.rowsLimit || 50
    const validatedData = {
      ...formData,
      fetch_count: Math.min(Math.max(formData.fetch_count || maxRows, 1), maxRows)
    }
    
    onSearch(validatedData)
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <MagnifyingGlassIcon className="h-7 w-7 text-blue-600" />
            Find Your Next Leads
          </h1>
          <p className="text-gray-600">Use our powerful search to discover potential customers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Company Industry */}
            <MultiSelect
              label="Company Industry"
              options={INDUSTRIES}
              selected={formData.company_industry}
              onChange={(selected) => setFormData(prev => ({ ...prev, company_industry: selected }))}
              displayLabels={DISPLAY_LABELS.industries}
              placeholder="Select industries..."
            />

            {/* Company Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Keywords
              </label>
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleKeywordAdd())}
                    placeholder="Add keywords..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleKeywordAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.company_keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Job Title */}
            <MultiSelect
              label="Contact Job Title"
              options={JOB_TITLES}
              selected={formData.contact_job_title}
              onChange={(selected) => setFormData(prev => ({ ...prev, contact_job_title: selected }))}
              displayLabels={DISPLAY_LABELS.jobTitles}
              placeholder="Select job titles..."
            />

            {/* Contact Location */}
            <MultiSelect
              label="Contact Location"
              options={LOCATIONS}
              selected={formData.contact_location}
              onChange={(selected) => setFormData(prev => ({ ...prev, contact_location: selected }))}
              displayLabels={DISPLAY_LABELS.locations}
              placeholder="Select locations..."
            />

            {/* Email Status */}
            <MultiSelect
              label="Email Status"
              options={EMAIL_STATUS}
              selected={formData.email_status}
              onChange={(selected) => setFormData(prev => ({ ...prev, email_status: selected }))}
              displayLabels={EMAIL_STATUS_LABELS}
              placeholder="Select email statuses..."
            />

            {/* Min Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Revenue
              </label>
              <select
                value={formData.min_revenue}
                onChange={(e) => setFormData(prev => ({ ...prev, min_revenue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select minimum revenue</option>
                {REVENUE_OPTIONS.map(revenue => (
                  <option key={revenue} value={revenue}>{revenue}</option>
                ))}
              </select>
            </div>

            {/* Fetch Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Results
              </label>
              <input
                type="number"
                min="1"
                max={userLimits?.rowsLimit || 50}
                value={formData.fetch_count}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 1
                  const maxRows = userLimits?.rowsLimit || 50
                  const limitedValue = Math.min(Math.max(newValue, 1), maxRows)
                  setFormData(prev => ({ ...prev, fetch_count: limitedValue }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly={false}
              />
              {userLimits && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <strong>{userLimits.planName} Plan:</strong> Maximum {userLimits.rowsLimit} results per search.
                  {userLimits.planName === 'Free' && (
                    <Link href="/pricing" className="text-blue-600 hover:text-blue-800 underline font-medium ml-1">Upgrade</Link>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search Leads'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
