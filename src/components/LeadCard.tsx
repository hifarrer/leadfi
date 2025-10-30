'use client'

import { useState } from 'react'
import LeadDetailModal from './LeadDetailModal'

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

interface LeadCardProps {
  lead: Lead
}

export default function LeadCard({ lead }: LeadCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getEmail = () => {
    return lead.email || lead.personalEmail
  }

  const getLocation = () => {
    const parts = [lead.city, lead.state, lead.country].filter(Boolean)
    return parts.join(', ') || 'Location not specified'
  }

  const getCompanyLocation = () => {
    const parts = [lead.companyCity, lead.companyState, lead.companyCountry].filter(Boolean)
    return parts.join(', ') || 'Location not specified'
  }

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 cursor-pointer hover:border-blue-300 hover:scale-[1.02]"
        onClick={() => setIsModalOpen(true)}
      >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Name not available'}
        </h3>
        <p className="text-sm text-gray-600">{lead.jobTitle || 'Job title not specified'}</p>
        {lead.seniorityLevel && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
            {lead.seniorityLevel}
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="mb-4 space-y-2">
        {getEmail() && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-16">Email:</span>
            <a 
              href={`mailto:${getEmail()}`}
              className="text-blue-600 hover:text-blue-800 truncate"
            >
              {getEmail()}
            </a>
          </div>
        )}
        
        {lead.linkedin && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-16">LinkedIn:</span>
            <a 
              href={lead.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate"
            >
              View Profile
            </a>
          </div>
        )}

        <div className="flex items-center text-sm">
          <span className="text-gray-500 w-16">Location:</span>
          <span className="text-gray-700">{getLocation()}</span>
        </div>
      </div>

      {/* Company Info */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">
          {lead.companyName || 'Company not specified'}
        </h4>
        
        <div className="space-y-1 text-sm text-gray-600">
          {lead.industry && (
            <div>
              <span className="font-medium">Industry:</span> {lead.industry}
            </div>
          )}
          
          {lead.companySize && (
            <div>
              <span className="font-medium">Size:</span> {lead.companySize} employees
            </div>
          )}
          
          <div>
            <span className="font-medium">Location:</span> {getCompanyLocation()}
          </div>

          {lead.companyWebsite && (
            <div>
              <span className="font-medium">Website:</span>{' '}
              <a 
                href={lead.companyWebsite.startsWith('http') ? lead.companyWebsite : `https://${lead.companyWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {lead.companyWebsite}
              </a>
            </div>
          )}

          {lead.companyAnnualRevenueClean && (
            <div>
              <span className="font-medium">Revenue:</span> {lead.companyAnnualRevenueClean}
            </div>
          )}
        </div>
      </div>

      {/* Click indicator */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500">Click for more details</span>
      </div>
    </div>

    {/* Modal */}
    <LeadDetailModal 
      lead={lead} 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
    />
    </>
  )
}
