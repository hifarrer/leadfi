'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const blogPosts: Record<string, {
  title: string
  content: string
  date: string
  author: string
  excerpt: string
}> = {
  'discover-powerful-lead-generation-features': {
    title: 'Discover the Powerful Lead Generation Features of LeadFind',
    excerpt: 'Explore how LeadFind helps businesses find high-quality B2B leads with advanced search filters, verified contact information, and seamless CRM integration.',
    date: '2025-01-15',
    author: 'LeadFind Team',
    content: `
# Discover the Powerful Lead Generation Features of LeadFind

In today's competitive business landscape, finding high-quality leads is essential for growth. LeadFind is a powerful lead generation platform designed to help businesses discover and connect with potential customers efficiently. Whether you're a sales professional, marketer, or business owner, understanding the comprehensive features of LeadFind can transform your lead generation strategy.

## What is LeadFind?

LeadFind is an advanced lead finder tool and B2B lead generation platform that enables businesses to search for and discover potential customers based on specific criteria. Our platform provides access to a comprehensive lead database with verified contact information, making it easier than ever to find and connect with your ideal prospects.

## Advanced Search Capabilities

One of the standout features of LeadFind is its advanced search functionality. Our lead finder tool allows you to filter prospects using multiple criteria:

### Industry-Based Search
Target companies in specific industries to find businesses that align with your products or services. Whether you're looking for technology companies, healthcare organizations, or manufacturing firms, our industry filters help you narrow down your search.

### Job Title Targeting
Find decision-makers and key contacts by searching for specific job titles. From CEOs and CTOs to marketing directors and sales managers, you can identify the right people to reach out to.

### Geographic Filtering
Location-based search helps you find leads in specific cities, states, or countries. This is particularly useful for businesses that serve local markets or have regional sales teams.

### Company Size and Revenue Filters
Filter companies by size (number of employees) and annual revenue to target businesses that match your ideal customer profile. This helps you focus on prospects that are most likely to become customers.

## Verified Contact Information

LeadFind provides access to verified contact information for each lead, including:

- **Email Addresses**: Validated email addresses for direct outreach
- **LinkedIn Profiles**: Professional social media connections
- **Phone Numbers**: Direct contact information when available
- **Company Details**: Comprehensive company information including website, address, and industry classification

## Search History and Management

All your searches are automatically saved in your LeadFind account. This feature allows you to:

- Revisit previous searches and results
- Track your lead generation activities
- Manage multiple lead lists efficiently
- Export historical data for analysis

## Data Export and CRM Integration

LeadFind makes it easy to export your lead data in multiple formats:

- **CSV Export**: Perfect for spreadsheet analysis and basic CRM imports
- **JSON Export**: Ideal for developers and advanced integrations

This flexibility ensures that your lead data can be easily integrated into your existing sales and marketing workflows, whether you use Salesforce, HubSpot, or other CRM systems.

## Lead Database Quality

Our lead database is continuously updated to ensure accuracy and relevance. We source data from reliable public sources and validate contact information to maintain high data quality standards. This means you spend less time verifying leads and more time connecting with potential customers.

## Pricing Plans for Every Business

LeadFind offers flexible pricing plans to suit businesses of all sizes:

- **Free Plan**: Perfect for getting started with 2 searches per month
- **Basic Plan**: Ideal for small businesses with 100 searches per month
- **Ultra Plan**: Designed for growing businesses with 1,000 searches per month

All plans include access to our comprehensive lead database, export capabilities, and search history features.

## Best Practices for Lead Generation

To maximize your success with LeadFind, consider these best practices:

1. **Define Your Ideal Customer Profile**: Before searching, clearly define the characteristics of your ideal customer, including industry, company size, and job titles.

2. **Use Multiple Filters**: Combine different search criteria to find highly targeted leads that match your ideal customer profile.

3. **Export and Organize**: Regularly export your leads and organize them in your CRM or sales management system.

4. **Follow Up Promptly**: Once you've identified leads, reach out quickly while the information is fresh.

5. **Track Your Results**: Use search history to analyze which search criteria yield the best results for your business.

## Why Choose LeadFind?

LeadFind stands out in the lead generation space because of our:

- **Comprehensive Search Filters**: Find exactly the leads you need with our advanced filtering options
- **Verified Data**: Access to validated contact information you can trust
- **User-Friendly Interface**: Intuitive design that makes lead generation simple
- **Flexible Export Options**: Easy integration with your existing tools
- **Affordable Pricing**: Plans that fit businesses of all sizes

## Getting Started with LeadFind

Ready to transform your lead generation process? Getting started with LeadFind is simple:

1. **Sign Up**: Create your free account in seconds
2. **Define Your Search Criteria**: Use our intuitive search form to specify your target audience
3. **Review Results**: Browse through your lead results and identify the most promising prospects
4. **Export and Connect**: Export your leads and start reaching out to potential customers

## Conclusion

LeadFind is more than just a lead finder tool—it's a comprehensive lead generation platform designed to help businesses find and connect with their ideal customers. With advanced search capabilities, verified contact information, and flexible export options, LeadFind empowers sales teams and marketers to build their pipeline more efficiently.

Whether you're looking for B2B leads, trying to find decision-makers, or building a prospect list, LeadFind provides the tools and data you need to succeed. Start your free account today and discover how LeadFind can transform your lead generation strategy.

Ready to find your next leads? [Get started with LeadFind today](https://www.leadfind.app/signup) and experience the power of advanced lead generation.
    `.trim()
  }
}

export default function BlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const post = blogPosts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
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

      {/* Blog Post Content */}
      <article className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← Back to Blog
            </Link>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
              <span className="mx-2">•</span>
              <span>{post.author}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {post.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h2 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{line.substring(2)}</h2>
                }
                if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{line.substring(4)}</h3>
                }
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4">{line.substring(3)}</h2>
                }
                if (line.trim() === '') {
                  return null
                }
                if (line.includes('[') && line.includes('](')) {
                  const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
                  if (linkMatch) {
                    const [fullMatch, text, url] = linkMatch
                    const before = line.substring(0, line.indexOf(fullMatch))
                    const after = line.substring(line.indexOf(fullMatch) + fullMatch.length)
                    return (
                      <p key={index} className="mb-4">
                        {before}
                        <Link href={url} className="text-blue-600 hover:text-blue-800 underline">
                          {text}
                        </Link>
                        {after}
                      </p>
                    )
                  }
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <ul key={index} className="list-disc ml-6 mb-4">
                      <li>{line.substring(2)}</li>
                    </ul>
                  )
                }
                if (line.startsWith('1. ')) {
                  return (
                    <ol key={index} className="list-decimal ml-6 mb-4">
                      <li>{line.substring(3)}</li>
                    </ol>
                  )
                }
                return <p key={index} className="mb-4">{line}</p>
              })}
            </div>
          </div>
        </div>
      </article>

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

