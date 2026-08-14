import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './components/onboarding-form'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user.organizationId) {
    redirect('/app')
  }

  const params = await searchParams

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <OnboardingForm error={params.error} />
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
