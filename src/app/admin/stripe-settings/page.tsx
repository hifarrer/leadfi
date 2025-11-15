'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  CreditCardIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface StripeSettings {
  stripePublishableKey: string | null
  stripeSecretKey: string | null
  stripeWebhookSecret: string | null
  hasSecretKey: boolean
}

export default function StripeSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: ''
  })
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasExistingSecretKey, setHasExistingSecretKey] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/stripe-settings')

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
          return
        }
        throw new Error('Failed to fetch Stripe settings')
      }

      const data: StripeSettings = await response.json()
      
      setFormData({
        stripePublishableKey: data.stripePublishableKey || '',
        stripeSecretKey: '', // Don't populate with masked value
        stripeWebhookSecret: data.stripeWebhookSecret || ''
      })
      setHasExistingSecretKey(data.hasSecretKey)
    } catch (err) {
      console.error('Error fetching Stripe settings:', err)
      setError('Failed to load Stripe settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setIsSubmitting(true)

    try {
      // Validate publishable key format (starts with pk_)
      if (formData.stripePublishableKey && !formData.stripePublishableKey.startsWith('pk_')) {
        setFormError('Invalid Stripe publishable key format. It should start with "pk_"')
        setIsSubmitting(false)
        return
      }

      // Validate secret key format (starts with sk_)
      if (formData.stripeSecretKey && !formData.stripeSecretKey.startsWith('sk_')) {
        setFormError('Invalid Stripe secret key format. It should start with "sk_"')
        setIsSubmitting(false)
        return
      }

      // Validate webhook secret format (starts with whsec_)
      if (formData.stripeWebhookSecret && !formData.stripeWebhookSecret.startsWith('whsec_')) {
        setFormError('Invalid Stripe webhook secret format. It should start with "whsec_"')
        setIsSubmitting(false)
        return
      }

      const payload = {
        stripePublishableKey: formData.stripePublishableKey.trim() || null,
        stripeSecretKey: formData.stripeSecretKey.trim() || null,
        stripeWebhookSecret: formData.stripeWebhookSecret.trim() || null
      }

      const response = await fetch('/api/admin/stripe-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setFormError(data.error || 'Failed to save Stripe settings')
        return
      }

      const updatedData: StripeSettings = await response.json()
      setHasExistingSecretKey(updatedData.hasSecretKey)
      
      setFormSuccess('Stripe settings saved successfully!')
      
      // Clear secret key field after successful save (for security)
      setFormData({
        ...formData,
        stripeSecretKey: ''
      })
      
      // Refresh settings after a delay
      setTimeout(() => {
        fetchSettings()
      }, 1000)
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCardIcon className="h-7 w-7 text-blue-600" />
                Stripe Settings
              </h1>
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </header>
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCardIcon className="h-7 w-7 text-blue-600" />
              Stripe Settings
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Admin
              </button>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Stripe Configuration</h2>
              <p className="text-sm text-gray-600">
                Configure your Stripe API keys and webhook secret for checkout integration.
                These settings will be used when implementing Stripe checkout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Publishable Key */}
              <div>
                <label htmlFor="stripePublishableKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  id="stripePublishableKey"
                  value={formData.stripePublishableKey}
                  onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="pk_test_..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your Stripe publishable key (starts with pk_test_ or pk_live_)
                </p>
              </div>

              {/* Secret Key */}
              <div>
                <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    id="stripeSecretKey"
                    value={formData.stripeSecretKey}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={hasExistingSecretKey ? "Enter new key to update, or leave blank to keep current" : "sk_test_..."}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSecretKey ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {hasExistingSecretKey 
                    ? "A secret key is already saved. Enter a new key to update it, or leave blank to keep the current one."
                    : "Your Stripe secret key (starts with sk_test_ or sk_live_). Keep this secure!"
                  }
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Webhook Secret
                </label>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    id="stripeWebhookSecret"
                    value={formData.stripeWebhookSecret}
                    onChange={(e) => setFormData({ ...formData, stripeWebhookSecret: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="whsec_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showWebhookSecret ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your Stripe webhook signing secret (starts with whsec_). Used to verify webhook events.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Where to find these keys:</h3>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Publishable Key: Stripe Dashboard → Developers → API keys → Publishable key</li>
                  <li>Secret Key: Stripe Dashboard → Developers → API keys → Secret key</li>
                  <li>Webhook Secret: Stripe Dashboard → Developers → Webhooks → Select endpoint → Signing secret</li>
                </ul>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  {formSuccess}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

