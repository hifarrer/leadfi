'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import MultiSelect from './MultiSelect'

interface SearchFormProps {
  onSearch: (params: any) => void
  isLoading: boolean
}

const INDUSTRIES = [
  'marketing & advertising',
  'technology',
  'healthcare',
  'finance',
  'real estate',
  'education',
  'manufacturing',
  'retail',
  'consulting',
  'media & entertainment'
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
  'guessed',
  'unavailable'
]

const COMPANY_SIZES = [
  '0-1',
  '2-10',
  '11-20',
  '21-50',
  '51-100',
  '101-200',
  '201-500',
  '501-1000',
  '1001-2000',
  '2001-5000',
  '10000+'
]

const REVENUE_OPTIONS = [
  '100K',
  '500K',
  '1M',
  '10M',
  '50M',
  '100M+'
]

// Display labels for proper case display
const DISPLAY_LABELS = {
  industries: {
    'marketing & advertising': 'Marketing & Advertising',
    'technology': 'Technology',
    'healthcare': 'Healthcare',
    'finance': 'Finance',
    'real estate': 'Real Estate',
    'education': 'Education',
    'manufacturing': 'Manufacturing',
    'retail': 'Retail',
    'consulting': 'Consulting',
    'media & entertainment': 'Media & Entertainment'
  },
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
  },
  companySizes: {
    '0-1': '1 employee',
    '2-10': '2-10 employees',
    '11-20': '11-20 employees',
    '21-50': '21-50 employees',
    '51-100': '51-100 employees',
    '101-200': '101-200 employees',
    '201-500': '201-500 employees',
    '501-1000': '501-1000 employees',
    '1001-2000': '1001-2000 employees',
    '2001-5000': '2001-5000 employees',
    '10000+': '10000+ employees'
  }
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [formData, setFormData] = useState({
    company_industry: [] as string[],
    company_keywords: [] as string[],
    contact_job_title: [] as string[],
    contact_location: [] as string[],
    email_status: [] as string[],
    size: [] as string[],
    min_revenue: '',
    fetch_count: 50
  })

  const [keywordInput, setKeywordInput] = useState('')


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
    onSearch(formData)
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
              displayLabels={Object.fromEntries(EMAIL_STATUS.map(status => [status, status.charAt(0).toUpperCase() + status.slice(1)]))}
              placeholder="Select email statuses..."
            />

            {/* Company Size */}
            <MultiSelect
              label="Company Size"
              options={COMPANY_SIZES}
              selected={formData.size}
              onChange={(selected) => setFormData(prev => ({ ...prev, size: selected }))}
              displayLabels={DISPLAY_LABELS.companySizes}
              placeholder="Select company sizes..."
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
                max="1000"
                value={formData.fetch_count}
                onChange={(e) => setFormData(prev => ({ ...prev, fetch_count: parseInt(e.target.value) || 50 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
