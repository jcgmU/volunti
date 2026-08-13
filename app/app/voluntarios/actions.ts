'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { volunteers } from '@/db/schema'
import { volunteerSchema } from '@/lib/validations'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

async function getSessionOrRedirect() {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/login')
  }
  if (!session.user.organizationId) {
    redirect('/onboarding')
  }
  return session
}

export async function createVolunteerAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string

  const skillsRaw = formData.get('skills') as string || ''
  const skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const rawData = {
    name: formData.get('name') as string,
    contactPhone: formData.get('contactPhone') as string,
    skills,
    city: formData.get('city') as string,
    availabilityFrom: formData.get('availabilityFrom') as string,
    availabilityTo: formData.get('availabilityTo') as string,
    status: formData.get('status') as string
  }

  const parsed = volunteerSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for creating volunteer:', parsed.error.format())
    redirect('/app/voluntarios?error=invalid')
  }

  try {
    await db.insert(volunteers).values({
      organizationId: orgId,
      name: parsed.data.name,
      contactPhone: parsed.data.contactPhone,
      skills: parsed.data.skills,
      city: parsed.data.city,
      availabilityFrom: parsed.data.availabilityFrom,
      availabilityTo: parsed.data.availabilityTo,
      status: parsed.data.status
    })
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Insert failed for volunteer:', error)
    redirect('/app/voluntarios?error=unknown')
  }

  revalidatePath('/app/voluntarios')
  redirect('/app/voluntarios?success=created')
}

export async function updateVolunteerAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string
  const volunteerId = formData.get('volunteerId') as string

  if (!volunteerId) {
    redirect('/app/voluntarios?error=invalid')
  }

  const skillsRaw = formData.get('skills') as string || ''
  const skills = skillsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const rawData = {
    name: formData.get('name') as string,
    contactPhone: formData.get('contactPhone') as string,
    skills,
    city: formData.get('city') as string,
    availabilityFrom: formData.get('availabilityFrom') as string,
    availabilityTo: formData.get('availabilityTo') as string,
    status: formData.get('status') as string
  }

  const parsed = volunteerSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for updating volunteer:', parsed.error.format())
    redirect(`/app/voluntarios?error=invalid&volunteerId=${volunteerId}`)
  }

  try {
    const [existingVolunteer] = await db
      .select()
      .from(volunteers)
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))

    if (!existingVolunteer) {
      redirect('/app/voluntarios?error=unauthorized')
    }

    await db
      .update(volunteers)
      .set({
        name: parsed.data.name,
        contactPhone: parsed.data.contactPhone,
        skills: parsed.data.skills,
        city: parsed.data.city,
        availabilityFrom: parsed.data.availabilityFrom,
        availabilityTo: parsed.data.availabilityTo,
        status: parsed.data.status
      })
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for volunteer:', error)
    redirect('/app/voluntarios?error=unknown')
  }

  revalidatePath('/app/voluntarios')
  redirect('/app/voluntarios?success=updated')
}

export async function deleteVolunteerAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string
  const volunteerId = formData.get('volunteerId') as string

  if (!volunteerId) {
    redirect('/app/voluntarios?error=invalid')
  }

  try {
    const [existingVolunteer] = await db
      .select()
      .from(volunteers)
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))

    if (!existingVolunteer) {
      redirect('/app/voluntarios?error=unauthorized')
    }

    await db
      .delete(volunteers)
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Delete failed for volunteer:', error)
    redirect('/app/voluntarios?error=unknown')
  }

  revalidatePath('/app/voluntarios')
  redirect('/app/voluntarios?success=deleted')
}

export async function changeVolunteerStatusAction(volunteerId: string, newStatus: 'disponible' | 'asignado' | 'no_disponible') {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string

  try {
    const [existingVolunteer] = await db
      .select()
      .from(volunteers)
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))

    if (!existingVolunteer) {
      redirect('/app/voluntarios?error=unauthorized')
    }

    await db
      .update(volunteers)
      .set({
        status: newStatus
      })
      .where(and(eq(volunteers.id, volunteerId), eq(volunteers.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Status update failed for volunteer:', error)
    redirect('/app/voluntarios?error=unknown')
  }

  revalidatePath('/app/voluntarios')
}
