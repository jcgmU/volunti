'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { organizations, users } from '@/db/schema'
import { onboardingSchema } from '@/lib/validations'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function createOrganizationAction(formData: FormData) {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user.organizationId) {
    redirect('/app')
  }

  const focusAreas = formData.getAll('focusAreas')
  const categories = formData.getAll('categories')

  const rawData = {
    name: formData.get('name') as string,
    focusAreas,
    categories,
    description: formData.get('description') as string,
    contactPhone: formData.get('contactPhone') as string,
    contactWhatsapp: formData.get('contactWhatsapp') as string,
    city: formData.get('city') as string,
    department: formData.get('department') as string,
    capacityNotes: formData.get('capacityNotes') as string
  }

  const parsed = onboardingSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Onboarding validation errors:', parsed.error.format())
    redirect('/onboarding?error=invalid')
  }

  try {
    const [org] = await db
      .insert(organizations)
      .values({
        name: parsed.data.name,
        focusAreas: parsed.data.focusAreas,
        categories: parsed.data.categories,
        description: parsed.data.description,
        contactPhone: parsed.data.contactPhone,
        contactWhatsapp: parsed.data.contactWhatsapp || '',
        city: parsed.data.city,
        department: parsed.data.department,
        capacityNotes: parsed.data.capacityNotes || '',
        verified: false
      })
      .returning()

    await db
      .update(users)
      .set({ organizationId: org.id })
      .where(eq(users.id, session.user.id))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Onboarding database insertion error:', error)
    redirect('/onboarding?error=unknown')
  }

  redirect('/app?onboarded=1')
}

export async function skipOnboardingAction() {
  redirect('/app')
}
