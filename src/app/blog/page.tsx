'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
}

const blogPosts: BlogPost[] = [
  {
    slug: 'discover-powerful-lead-generation-features',
    title: 'Discover the Powerful Lead Generation Features of LeadFind',
    excerpt: 'Explore how LeadFind helps businesses find high-quality B2B leads with advanced search filters, verified contact information, and seamless CRM integration. Learn about our lead finder tool features designed for sales teams and marketers.',
    date: '2025-01-15',
    author: 'LeadFind Team'
  }
]

export default function BlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
              <Link
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Blog
              </Link>
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
                    href="/pricing"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Pricing
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
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              LeadFind Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips, insights, and updates on lead generation, B2B sales, and finding quality business leads
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                  </time>
                  <span className="mx-2">•</span>
                  <span>{post.author}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
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

