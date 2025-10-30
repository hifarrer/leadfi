'use client'

import { useState } from 'react'
import Papa from 'papaparse'

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

interface ExportButtonsProps {
  leads: Lead[]
}

export default function ExportButtons({ leads }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const formatLeadForExport = (lead: Lead) => ({
    'First Name': lead.firstName || '',
    'Last Name': lead.lastName || '',
    'Full Name': lead.fullName || '',
    'Email': lead.email || '',
    'Personal Email': lead.personalEmail || '',
    'Job Title': lead.jobTitle || '',
    'LinkedIn': lead.linkedin || '',
    'Company Name': lead.companyName || '',
    'Company Website': lead.companyWebsite || '',
    'Industry': lead.industry || '',
    'Company Size': lead.companySize || '',
    'Headline': lead.headline || '',
    'Seniority Level': lead.seniorityLevel || '',
    'Functional Level': lead.functionalLevel || '',
    'City': lead.city || '',
    'State': lead.state || '',
    'Country': lead.country || '',
    'Company LinkedIn': lead.companyLinkedin || '',
    'Company Founded Year': lead.companyFoundedYear || '',
    'Company Domain': lead.companyDomain || '',
    'Company Phone': lead.companyPhone || '',
    'Company Street Address': lead.companyStreetAddress || '',
    'Company Full Address': lead.companyFullAddress || '',
    'Company State': lead.companyState || '',
    'Company City': lead.companyCity || '',
    'Company Country': lead.companyCountry || '',
    'Company Postal Code': lead.companyPostalCode || '',
    'Keywords': lead.keywords || '',
    'Company Description': lead.companyDescription || '',
    'Company Annual Revenue': lead.companyAnnualRevenue || '',
    'Company Annual Revenue Clean': lead.companyAnnualRevenueClean || '',
    'Company Total Funding': lead.companyTotalFunding || '',
    'Company Total Funding Clean': lead.companyTotalFundingClean || '',
    'Company Technologies': lead.companyTechnologies || '',
  })

  const exportToCSV = () => {
    if (leads.length === 0) return

    setIsExporting(true)
    
    const formattedLeads = leads.map(formatLeadForExport)
    const csv = Papa.unparse(formattedLeads)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsExporting(false)
  }

  const exportToJSON = () => {
    if (leads.length === 0) return

    setIsExporting(true)
    
    const formattedLeads = leads.map(formatLeadForExport)
    const jsonString = JSON.stringify(formattedLeads, null, 2)
    
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsExporting(false)
  }

  if (leads.length === 0) {
    return null
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportToCSV}
        disabled={isExporting}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </>
        )}
      </button>
      
      <button
        onClick={exportToJSON}
        disabled={isExporting}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export JSON
          </>
        )}
      </button>
    </div>
  )
}
