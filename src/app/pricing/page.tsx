'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface Plan {
  id: string
  name: string
  monthlyPrice: number | string
  yearlyPrice: number | string
  stripeMonthlyPriceId: string | null
  stripeYearlyPriceId: string | null
  features: string[]
  isPopular: boolean
  displayOrder: number
}

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
  const [processingCheckout, setProcessingCheckout] = useState<string | null>(null)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
    if (status === 'authenticated') {
      fetchUserPlan()
    }
    
    // Check for success/cancel parameters in URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setError(null)
      setSuccess('Payment successful! Your plan has been activated.')
      // Refresh user plan after a short delay to allow webhook to process
      setTimeout(() => {
        if (status === 'authenticated') {
          fetchUserPlan()
        }
      }, 2000)
      // Clean up URL
      window.history.replaceState({}, '', '/pricing')
    } else if (params.get('canceled') === 'true') {
      setError('Checkout was canceled. You can try again anytime.')
      // Clean up URL
      window.history.replaceState({}, '', '/pricing')
    }
  }, [status])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPlan = async () => {
    try {
      const response = await fetch('/api/user/plan')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlanId(data.planId)
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return
    }

    setCancelingSubscription(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      if (data.canceled) {
        setSuccess('Your subscription has been canceled.')
        setCurrentPlanId(null)
      } else {
        setSuccess('Your subscription will be canceled at the end of the billing period. You will continue to have access until then.')
      }
    } catch (err: any) {
      console.error('Cancel subscription error:', err)
      setError(err.message || 'Failed to cancel subscription. Please try again.')
    } finally {
      setCancelingSubscription(false)
    }
  }

  const handleSubscribe = async (plan: Plan) => {
    // Check if user is authenticated
    if (status !== 'authenticated') {
      router.push('/login?redirect=/pricing')
      return
    }

    // Check if plan has Stripe price ID for selected billing period
    const priceId = billingPeriod === 'monthly' 
      ? plan.stripeMonthlyPriceId 
      : plan.stripeYearlyPriceId

    if (!priceId) {
      setError(`Stripe checkout is not configured for ${billingPeriod} billing on this plan. Please contact support.`)
      return
    }

    // If it's a free plan, just redirect to signup
    const price = billingPeriod === 'monthly' 
      ? parseFloat(typeof plan.monthlyPrice === 'string' ? plan.monthlyPrice : plan.monthlyPrice.toString())
      : parseFloat(typeof plan.yearlyPrice === 'string' ? plan.yearlyPrice : plan.yearlyPrice.toString())

    if (price === 0) {
      router.push('/signup')
      return
    }

    setProcessingCheckout(plan.id)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod: billingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout. Please try again.')
      setProcessingCheckout(null)
    }
  }

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                LeadFind
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/search"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/history"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    History
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Pricing
                  </Link>
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
                  <Link
                    href="/pricing"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Pricing
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that's right for you. All plans include full access to our lead database.
            </p>
            
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                role="switch"
                aria-checked={billingPeriod === 'yearly'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Save up to 20%
                </span>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="max-w-2xl mx-auto mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading plans...</p>
            </div>
          ) : plans.length > 0 ? (
            <div className={`grid grid-cols-1 ${plans.length === 2 ? 'md:grid-cols-2' : plans.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-8`}>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`${
                    plan.isPopular
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg relative'
                      : 'bg-white border-2 border-gray-200 shadow-sm'
                  } rounded-2xl p-8 hover:shadow-lg transition-shadow`}
                >
                  {plan.isPopular && currentPlanId !== plan.id && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-2xl text-sm font-semibold">
                      Popular
                    </div>
                  )}
                  {currentPlanId === plan.id && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-2xl text-sm font-semibold">
                      Current Plan
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ${formatPrice(billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                      </span>
                      <span className="text-gray-600">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingPeriod === 'monthly' && (
                      <div className="text-sm text-gray-500">
                        ${formatPrice(plan.yearlyPrice)}/year billed annually
                      </div>
                    )}
                    {billingPeriod === 'yearly' && (
                      <div className="text-sm text-gray-500">
                        ${formatPrice(plan.monthlyPrice)}/month if billed monthly
                      </div>
                    )}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className={plan.isPopular ? 'text-gray-700' : 'text-gray-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {currentPlanId === plan.id ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-3 px-4 font-semibold rounded-lg bg-green-600 text-white cursor-default"
                      >
                        Current Plan
                      </button>
                      {status === 'authenticated' && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelingSubscription}
                          className="w-full py-2 px-4 text-sm font-medium rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancelingSubscription ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Canceling...
                            </span>
                          ) : (
                            'Cancel Subscription'
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingCheckout === plan.id || (billingPeriod === 'monthly' ? !plan.stripeMonthlyPriceId : !plan.stripeYearlyPriceId)}
                      className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors ${
                        plan.isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          : parseFloat(formatPrice(billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)) === 0
                          ? 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {processingCheckout === plan.id ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </span>
                      ) : parseFloat(formatPrice(billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)) === 0 ? (
                        'Get Started'
                      ) : (billingPeriod === 'monthly' ? !plan.stripeMonthlyPriceId : !plan.stripeYearlyPriceId) ? (
                        'Not Available'
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No pricing plans available. Please check back later.</p>
            </div>
          )}
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

