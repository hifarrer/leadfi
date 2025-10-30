'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  PlayIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showDemoMessage, setShowDemoMessage] = useState(false)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleSubscribe = () => {
    setShowDemoMessage(true)
  }

  const faqs = [
    {
      question: "What is LeadFind?",
      answer: "LeadFind is a powerful lead generation tool that helps you discover and connect with potential customers. Search by industry, job title, location, company size, and more to find high-quality leads for your business."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for a free account, then use our intuitive search form to specify your target criteria. You can filter by industry, job titles, locations, company size, revenue, and other key parameters."
    },
    {
      question: "What information do I get about each lead?",
      answer: "Each lead includes comprehensive contact information such as name, email, job title, LinkedIn profile, company details, location, and company information including size, revenue, and funding details."
    },
    {
      question: "Can I export my search results?",
      answer: "Yes! You can export your search results in multiple formats including CSV and JSON, making it easy to import into your CRM or other business tools."
    },
    {
      question: "Is my search history saved?",
      answer: "Absolutely! All your searches are automatically saved in your account. You can view, revisit, and manage your search history at any time."
    },
    {
      question: "How accurate is the lead data?",
      answer: "We source our data from reliable public sources and continuously update our database to ensure the highest accuracy possible. All email addresses are validated for deliverability."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LeadFind</h1>
            </div>
            <div className="flex items-center space-x-4">
              {status === 'authenticated' ? (
                <>
                  <button
                    onClick={() => router.push('/search')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/history')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    History
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push('/api/auth/signout')}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Next
              <span className="text-blue-600"> Leads</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover high-quality leads with our powerful search engine. 
              Target the right companies and contacts for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'authenticated' ? (
                <button
                  onClick={() => router.push('/search')}
                  className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600 text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find and connect with your ideal customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Advanced Search
              </h3>
              <p className="text-gray-600">
                Filter leads by industry, job title, location, company size, revenue, and more with our comprehensive search filters.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Leads
              </h3>
              <p className="text-gray-600">
                Access verified contact information including emails, LinkedIn profiles, and detailed company information.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search History
              </h3>
              <p className="text-gray-600">
                All your searches are automatically saved. Revisit previous searches and manage your lead lists easily.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
                <DocumentArrowDownIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Export Data
              </h3>
              <p className="text-gray-600">
                Export your leads in CSV or JSON format for easy integration with your CRM and other business tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and find your ideal customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full text-white text-3xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign Up & Log In
              </h3>
              <p className="text-gray-600">
                Create your free account in seconds. No credit card required to get started.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full text-white text-3xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Set Your Criteria
              </h3>
              <p className="text-gray-600">
                Use our intuitive search form to define your target audience by industry, job title, location, company size, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full text-white text-3xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Your Leads
              </h3>
              <p className="text-gray-600">
                Review your results, export the data, and start connecting with potential customers right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for you. All plans include full access to our lead database.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">2 searches per month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">50 records per search</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Export to CSV & JSON</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Search history</span>
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Basic Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-2xl text-sm font-semibold">
                Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$15</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">100 searches per month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">100 records per search</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Export to CSV & JSON</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Search history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Subscribe Now
              </button>
            </div>

            {/* Ultra Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ultra</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$25</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">1,000 searches per month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">1,000 records per search</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Export to CSV & JSON</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Search history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced filters</span>
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See LeadFind in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to find and export quality leads
            </p>
          </div>
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-4 hover:bg-blue-700 transition-colors cursor-pointer shadow-lg">
                  <PlayIcon className="h-12 w-12 text-white ml-1" />
                </div>
                <p className="text-gray-600 font-medium">
                  Demo Video Coming Soon
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Placeholder for product demonstration video
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about LeadFind
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-semibold text-gray-900 text-lg">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Next Leads?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using LeadFind to grow their customer base
          </p>
          {status === 'authenticated' ? (
            <button
              onClick={() => router.push('/search')}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Go to Dashboard
            </button>
          ) : (
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Demo Message Modal */}
      {showDemoMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowDemoMessage(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Demo Version
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This is just a demo version. A payment gateway will be integrated upon site purchase.
              </p>
              <button
                onClick={() => setShowDemoMessage(false)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">LeadFind</span>
            </div>
            <p className="mb-4">Find and connect with your ideal customers</p>
            <p className="text-sm">
              © {new Date().getFullYear()} LeadFind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
