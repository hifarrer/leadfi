import { Session } from 'next-auth'

/**
 * Check if a user session has admin privileges
 * Admin is determined by matching the user's email with ADMIN_EMAIL environment variable
 * Defaults to 'admin@leadfind.com' if ADMIN_EMAIL is not set
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false
  
  // Check if user email matches admin email from environment variable
  // If ADMIN_EMAIL is not set, default to admin@leadfind.com
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadfind.com'
  return session.user.email === adminEmail
}

