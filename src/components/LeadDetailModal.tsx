'use client'

import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  CodeBracketIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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

interface LeadDetailModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
}

export default function LeadDetailModal({ lead, isOpen, onClose }: LeadDetailModalProps) {
  if (!isOpen) return null

  const getEmail = () => {
    return lead.email || lead.personalEmail
  }

  const getLocation = () => {
    const parts = [lead.city, lead.state, lead.country].filter(Boolean)
    return parts.join(', ') || 'Not specified'
  }

  const getCompanyLocation = () => {
    const parts = [lead.companyCity, lead.companyState, lead.companyCountry].filter(Boolean)
    return parts.join(', ') || 'Not specified'
  }

  const formatKeywords = (keywords: string | null) => {
    if (!keywords) return []
    return keywords.split(',').map(k => k.trim()).slice(0, 20) // Show first 20 keywords
  }

  const formatTechnologies = (technologies: string | null) => {
    if (!technologies) return []
    return technologies.split(',').map(t => t.trim())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-5 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Name not available'}
              </h2>
              {lead.jobTitle && (
                <p className="text-blue-100 text-sm mt-1">{lead.jobTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
                <p className="text-gray-900 font-medium">{lead.fullName || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Job Title</label>
                <p className="text-gray-900 font-medium">{lead.jobTitle || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Headline</label>
                <p className="text-gray-700">{lead.headline || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <EnvelopeIcon className="h-4 w-4" />
                  Email
                </label>
                <p className="text-gray-900">
                  {getEmail() ? (
                    <a href={`mailto:${getEmail()}`} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors">
                      <EnvelopeIcon className="h-4 w-4" />
                      {getEmail()}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  LinkedIn
                </label>
                <p className="text-gray-900">
                  {lead.linkedin ? (
                    <a 
                      href={lead.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      View Profile
                    </a>
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Seniority Level</label>
                {lead.seniorityLevel ? (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full capitalize">
                    {lead.seniorityLevel}
                  </span>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  Location
                </label>
                <p className="text-gray-900 font-medium">{getLocation()}</p>
              </div>
            </div>
          </div>

          {/* Company Information Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Company Name</label>
                <p className="text-gray-900 font-semibold text-lg">{lead.companyName || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Industry</label>
                {lead.industry ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {lead.industry}
                  </span>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Company Size</label>
                {lead.companySize ? (
                  <p className="text-gray-900 font-medium text-lg">{lead.companySize} <span className="text-gray-500 text-sm">employees</span></p>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Founded Year
                </label>
                <p className="text-gray-900 font-medium">{lead.companyFoundedYear || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <GlobeAltIcon className="h-4 w-4" />
                  Website
                </label>
                <p className="text-gray-900">
                  {lead.companyWebsite ? (
                    <a 
                      href={lead.companyWebsite.startsWith('http') ? lead.companyWebsite : `https://${lead.companyWebsite}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <GlobeAltIcon className="h-4 w-4" />
                      Visit Website
                    </a>
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" />
                  Phone
                </label>
                <p className="text-gray-900 font-medium">{lead.companyPhone || 'Not available'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  Annual Revenue
                </label>
                {lead.companyAnnualRevenueClean ? (
                  <p className="text-emerald-600 font-bold text-lg">{lead.companyAnnualRevenueClean}</p>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  Total Funding
                </label>
                {lead.companyTotalFundingClean ? (
                  <p className="text-emerald-600 font-bold text-lg">{lead.companyTotalFundingClean}</p>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  Company Location
                </label>
                <p className="text-gray-900 font-medium">{getCompanyLocation()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Address</label>
                <p className="text-gray-700">{lead.companyFullAddress || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          {lead.companyDescription && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
                Company Description
              </h3>
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{lead.companyDescription}</p>
              </div>
            </div>
          )}

          {/* Keywords */}
          {lead.keywords && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-blue-600" />
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {formatKeywords(lead.keywords).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium rounded-full transition-colors cursor-default"
                  >
                    {keyword}
                  </span>
                ))}
                {formatKeywords(lead.keywords).length === 20 && (
                  <span className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm font-medium rounded-full">
                    + more...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Technologies */}
          {lead.companyTechnologies && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CodeBracketIcon className="h-5 w-5 text-emerald-600" />
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {formatTechnologies(lead.companyTechnologies).map((tech, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm font-medium rounded-full transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn Company */}
          {lead.companyLinkedin && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-indigo-600" />
                Company LinkedIn
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <a 
                  href={lead.companyLinkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <LinkIcon className="h-5 w-5" />
                  {lead.companyLinkedin}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              <XMarkIcon className="h-5 w-5" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
