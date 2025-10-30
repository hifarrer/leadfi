'use client'

import { useState } from 'react'
import LeadCard from './LeadCard'

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

interface LeadsGridProps {
  leads: Lead[]
}

export default function LeadsGrid({ leads }: LeadsGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [emailFilter, setEmailFilter] = useState('all')
  const [seniorityFilter, setSeniorityFilter] = useState('all')

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEmail = emailFilter === 'all' ||
      (emailFilter === 'has-email' && (lead.email || lead.personalEmail)) ||
      (emailFilter === 'no-email' && !lead.email && !lead.personalEmail)

    const matchesSeniority = seniorityFilter === 'all' ||
      lead.seniorityLevel?.toLowerCase() === seniorityFilter.toLowerCase()

    return matchesSearch && matchesEmail && matchesSeniority
  })

  const seniorityLevels = [...new Set(leads.map(lead => lead.seniorityLevel).filter(Boolean))]

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, company, or job title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Status
            </label>
            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="has-email">Has Email</option>
              <option value="no-email">No Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seniority Level
            </label>
            <select
              value={seniorityFilter}
              onChange={(e) => setSeniorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              {seniorityLevels.map(level => (
                <option key={level} value={level?.toLowerCase()}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}
