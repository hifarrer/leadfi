import { Session } from 'next-auth'

/**
 * Check if a user session has admin privileges
 * Admin is determined by matching the user's email with ADMIN_EMAIL environment variable
 * Supports multiple admin emails (comma-separated)
 * Defaults to 'admin@leadfind.site' if ADMIN_EMAIL is not set
 * Email comparison is case-insensitive
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false
  
  // Get admin email(s) from environment variable
  // If ADMIN_EMAIL is not set, default to admin@leadfind.site
  const adminEmailEnv = process.env.ADMIN_EMAIL || 'admin@leadfind.site'
  
  // Normalize user email (trim and lowercase)
  const userEmail = session.user.email.trim().toLowerCase()
  
  // Support multiple admin emails (comma-separated)
  const adminEmails = adminEmailEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
  
  // Check if user email matches any admin email (case-insensitive)
  return adminEmails.includes(userEmail)
}

