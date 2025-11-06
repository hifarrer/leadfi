'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface Plan {
  id: string
  name: string
  monthlyPrice: number | string
  yearlyPrice: number | string
  features: string[]
  isPopular: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export default function AdminPlansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: '',
    yearlyPrice: '',
    features: [] as string[],
    isPopular: false,
    displayOrder: 0
  })
  const [newFeature, setNewFeature] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchPlans()
    }
  }, [status, router])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/plans')

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
          return
        }
        throw new Error('Failed to fetch plans')
      }

      const data = await response.json()
      setPlans(data)
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingPlan(null)
    setFormData({
      name: '',
      monthlyPrice: '',
      yearlyPrice: '',
      features: [],
      isPopular: false,
      displayOrder: plans.length
    })
    setNewFeature('')
    setFormError('')
    setFormSuccess('')
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setIsCreating(false)
    setFormData({
      name: plan.name,
      monthlyPrice: typeof plan.monthlyPrice === 'string' ? plan.monthlyPrice : plan.monthlyPrice.toString(),
      yearlyPrice: typeof plan.yearlyPrice === 'string' ? plan.yearlyPrice : plan.yearlyPrice.toString(),
      features: [...plan.features],
      isPopular: plan.isPopular,
      displayOrder: plan.displayOrder
    })
    setNewFeature('')
    setFormError('')
    setFormSuccess('')
  }

  const handleCancel = () => {
    setEditingPlan(null)
    setIsCreating(false)
    setFormData({
      name: '',
      monthlyPrice: '',
      yearlyPrice: '',
      features: [],
      isPopular: false,
      displayOrder: 0
    })
    setNewFeature('')
    setFormError('')
    setFormSuccess('')
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setIsSubmitting(true)

    try {
      // Validate
      if (!formData.name.trim()) {
        setFormError('Plan name is required')
        setIsSubmitting(false)
        return
      }
      if (!formData.monthlyPrice || parseFloat(formData.monthlyPrice) < 0) {
        setFormError('Valid monthly price is required')
        setIsSubmitting(false)
        return
      }
      if (!formData.yearlyPrice || parseFloat(formData.yearlyPrice) < 0) {
        setFormError('Valid yearly price is required')
        setIsSubmitting(false)
        return
      }
      if (formData.features.length === 0) {
        setFormError('At least one feature is required')
        setIsSubmitting(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        monthlyPrice: parseFloat(formData.monthlyPrice),
        yearlyPrice: parseFloat(formData.yearlyPrice),
        features: formData.features,
        isPopular: formData.isPopular,
        displayOrder: formData.displayOrder
      }

      let response
      if (isCreating) {
        response = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } else if (editingPlan) {
        response = await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      if (!response || !response.ok) {
        const data = await response!.json()
        setFormError(data.error || 'Failed to save plan')
        return
      }

      setFormSuccess(isCreating ? 'Plan created successfully!' : 'Plan updated successfully!')
      
      // Refresh plans
      setTimeout(() => {
        fetchPlans()
        handleCancel()
      }, 1000)
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    setDeletingPlanId(planId)

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete plan')
        return
      }

      fetchPlans()
    } catch (err) {
      console.error('Error deleting plan:', err)
      alert('An error occurred while deleting the plan')
    } finally {
      setDeletingPlanId(null)
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
                <ChartBarIcon className="h-7 w-7 text-blue-600" />
                Manage Plans
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
              <ChartBarIcon className="h-7 w-7 text-blue-600" />
              Manage Plans
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pricing Plans</h2>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Plan
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  plan.isPopular ? 'border-2 border-blue-500 relative' : 'border border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-xs font-semibold">
                    Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${typeof plan.monthlyPrice === 'string' ? parseFloat(plan.monthlyPrice).toFixed(2) : plan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    ${typeof plan.yearlyPrice === 'string' ? parseFloat(plan.yearlyPrice).toFixed(2) : plan.yearlyPrice.toFixed(2)}/year
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Order: {plan.displayOrder}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit plan"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletingPlanId === plan.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Delete plan"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plans.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No plans found. Create your first plan to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(isCreating || editingPlan) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {isCreating ? 'Create New Plan' : 'Edit Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Basic, Pro, Enterprise"
                  />
                </div>

                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="displayOrder"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Price ($) *
                  </label>
                  <input
                    type="number"
                    id="monthlyPrice"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="yearlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Yearly Price ($) *
                  </label>
                  <input
                    type="number"
                    id="yearlyPrice"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddFeature()
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a feature..."
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : isCreating ? 'Create Plan' : 'Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

