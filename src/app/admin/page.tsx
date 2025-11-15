'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface Stats {
  totalUsers: number
  totalSearches: number
  totalLeads: number
  usersLast30Days: number
  searchesLast30Days: number
  leadsLast30Days: number
}

interface SearchByDay {
  date: string
  count: number
}

interface Plan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
}

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  searchCount: number
  plan: Plan | null
  planId: string | null
}

interface RecentUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  searchCount: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchesByDay, setSearchesByDay] = useState<SearchByDay[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ email: '', name: '', password: '' })
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [changingPlanUserId, setChangingPlanUserId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
      fetchPlans()
    }
  }, [status, router])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans')
      if (response.ok) {
        const data = await response.json()
        setAvailablePlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stats and users in parallel
      const [statsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ])

      if (!statsResponse.ok) {
        if (statsResponse.status === 403) {
          setError('Access denied. Admin privileges required.')
          return
        }
        throw new Error('Failed to fetch statistics')
      }

      if (!usersResponse.ok) {
        if (usersResponse.status === 403) {
          setError('Access denied. Admin privileges required.')
          return
        }
        throw new Error('Failed to fetch users')
      }

      const statsData = await statsResponse.json()
      const usersData = await usersResponse.json()

      setStats(statsData.stats)
      setSearchesByDay(statsData.searchesByDay)
      setRecentUsers(statsData.recentUsers)
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      email: user.email,
      name: user.name || '',
      password: ''
    })
    setEditError('')
    setEditSuccess('')
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ email: '', name: '', password: '' })
    setEditError('')
    setEditSuccess('')
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setEditError('')
    setEditSuccess('')
    setIsUpdating(true)

    try {
      const updateData: any = {}
      
      if (editForm.email !== editingUser.email) {
        updateData.email = editForm.email
      }
      if (editForm.name !== (editingUser.name || '')) {
        updateData.name = editForm.name || null
      }
      if (editForm.password.trim()) {
        updateData.password = editForm.password
      }

      if (Object.keys(updateData).length === 0) {
        setEditError('No changes made')
        setIsUpdating(false)
        return
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        setEditError(data.error || 'Failed to update user')
        return
      }

      setEditSuccess('User updated successfully!')
      
      // Refresh data
      setTimeout(() => {
        fetchData()
        setEditingUser(null)
        setEditForm({ email: '', name: '', password: '' })
      }, 1000)
    } catch (err) {
      setEditError('An error occurred. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their search history and leads.')) {
      return
    }

    setDeletingUserId(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
        return
      }

      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('An error occurred while deleting the user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleChangePlan = (user: User) => {
    setChangingPlanUserId(user.id)
    setSelectedPlanId(user.planId)
    setShowPlanModal(true)
  }

  const handleSavePlan = async () => {
    if (!changingPlanUserId) return

    try {
      const response = await fetch(`/api/admin/users/${changingPlanUserId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlanId }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to update user plan')
        return
      }

      // Refresh data
      fetchData()
      setShowPlanModal(false)
      setChangingPlanUserId(null)
      setSelectedPlanId(null)
    } catch (err) {
      console.error('Error updating user plan:', err)
      alert('An error occurred while updating the user plan')
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
                Admin Dashboard
              </h1>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Home
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
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/plans')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Manage Plans
              </button>
              <button
                onClick={() => router.push('/admin/stripe-settings')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Stripe Settings
              </button>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Home
              </button>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats.usersLast30Days} in last 30 days
                    </p>
                  </div>
                  <UserGroupIcon className="h-12 w-12 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Searches</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSearches}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats.searchesLast30Days} in last 30 days
                    </p>
                  </div>
                  <MagnifyingGlassIcon className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats.leadsLast30Days} in last 30 days
                    </p>
                  </div>
                  <ChartBarIcon className="h-12 w-12 text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {/* Searches by Day Chart */}
          {searchesByDay.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Searches in Last 7 Days</h2>
              <div className="flex items-end justify-between gap-2 h-48">
                {searchesByDay.map((day, index) => {
                  const maxCount = Math.max(...searchesByDay.map(d => d.count))
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg" style={{ height: '100%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{day.count}</p>
                      <p className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Users Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={fetchData}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Searches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan?.name === 'Free' ? 'bg-gray-100 text-gray-700' :
                          user.plan?.name === 'Basic' ? 'bg-blue-100 text-blue-700' :
                          user.plan?.name === 'Ultra' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {user.plan?.name || 'No Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.searchCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit user"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleChangePlan(user)}
                            className="text-green-600 hover:text-green-800"
                            title="Change plan"
                          >
                            <ChartBarIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete user"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Edit User
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="edit-password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  {editSuccess}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowPlanModal(false)
                setChangingPlanUserId(null)
                setSelectedPlanId(null)
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              Change User Plan
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="plan-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Plan
                </label>
                <select
                  id="plan-select"
                  value={selectedPlanId || ''}
                  onChange={(e) => setSelectedPlanId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Plan</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.monthlyPrice}/month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false)
                    setChangingPlanUserId(null)
                    setSelectedPlanId(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

