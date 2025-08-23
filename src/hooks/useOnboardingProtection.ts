// Hook for protecting onboarding pages from users who already completed onboarding
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SupabaseAuthManager, SupabaseUserManager } from '@/lib/supabase'

export function useOnboardingProtection() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        // Check if user is logged in
        const session = await SupabaseAuthManager.getCurrentSession()
        if (!session?.user?.email) {
          // User is not logged in, they can access onboarding pages
          setIsLoading(false)
          return
        }

        // Get user data to check if they have completed onboarding
        const userData = await SupabaseUserManager.getUserByEmail(session.user.email)
        if (!userData) {
          // User not found in database, they can continue with onboarding
          setIsLoading(false)
          return
        }

        // Check if user has already selected a plan (completed onboarding)
        const hasCompletedOnboarding = userData.current_plan && 
                                      ['trial', 'premium', 'basic'].includes(userData.current_plan) &&
                                      userData.subscription_status &&
                                      ['trial', 'active', 'premium'].includes(userData.subscription_status)

        // Special case: Allow access to /plans page even if user is logged in but hasn't selected a plan
        // This fixes the issue where users are redirected to dashboard after signup before choosing a plan
        if (pathname === '/plans') {
          if (!hasCompletedOnboarding) {
            // User is logged in but hasn't chosen a plan yet - allow access to plans page
            console.log('🎯 User is logged in but can access /plans to choose their plan')
            setIsLoading(false)
            return
          } else {
            // User has already completed onboarding - redirect to dashboard
            console.log('🛡️ User has already chosen a plan, redirecting from /plans to dashboard')
            setShouldRedirect(true)
            router.push('/dashboard')
            return
          }
        }

        // For other onboarding pages (coach-selection, onboarding)
        if (hasCompletedOnboarding) {
          console.log('🛡️ User has already completed onboarding, redirecting to dashboard')
          setShouldRedirect(true)
          router.push('/dashboard')
          return
        }

        // User is logged in but hasn't completed onboarding, allow access
        setIsLoading(false)

      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // On error, allow access to be safe
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [router, pathname])

  return {
    isLoading,
    shouldRedirect
  }
}

// Helper function to check if user can access onboarding pages
// Note: This function doesn't consider the /plans special case since it's meant for general onboarding pages
export async function canAccessOnboardingPages(): Promise<boolean> {
  try {
    const session = await SupabaseAuthManager.getCurrentSession()
    if (!session?.user?.email) {
      return true // Not logged in, can access onboarding
    }

    const userData = await SupabaseUserManager.getUserByEmail(session.user.email)
    if (!userData) {
      return true // User not in database, can continue onboarding
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = userData.current_plan && 
                                  ['trial', 'premium', 'basic'].includes(userData.current_plan) &&
                                  userData.subscription_status &&
                                  ['trial', 'active', 'premium'].includes(userData.subscription_status)

    return !hasCompletedOnboarding
  } catch (error) {
    console.error('Error checking onboarding access:', error)
    return true // On error, allow access
  }
}

// Helper function specifically for checking /plans page access
export async function canAccessPlansPage(): Promise<boolean> {
  try {
    const session = await SupabaseAuthManager.getCurrentSession()
    if (!session?.user?.email) {
      return true // Not logged in, can access plans
    }

    const userData = await SupabaseUserManager.getUserByEmail(session.user.email)
    if (!userData) {
      return true // User not in database, can access plans
    }

    // For /plans page, allow access if user hasn't completed onboarding
    // This allows newly registered users to choose their plan
    const hasCompletedOnboarding = userData.current_plan && 
                                  ['trial', 'premium', 'basic'].includes(userData.current_plan) &&
                                  userData.subscription_status &&
                                  ['trial', 'active', 'premium'].includes(userData.subscription_status)

    return !hasCompletedOnboarding
  } catch (error) {
    console.error('Error checking plans page access:', error)
    return true // On error, allow access
  }
}