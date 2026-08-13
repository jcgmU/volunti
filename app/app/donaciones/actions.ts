'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { p2pOffers, p2pProfiles } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { z } from 'zod'

const offerSchema = z.object({
  category: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  availability: z.string().min(1, 'La disponibilidad es obligatoria'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  zone: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.enum(['activa', 'pausada', 'completada']).default('activa')
})

async function getSessionOrRedirect() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const [profile] = await db
    .select({ id: p2pProfiles.id })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, session.user.id))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  return session
}

export async function createOfferAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string

  const rawData = {
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    availability: formData.get('availability') as string,
    city: formData.get('city') as string,
    zone: formData.get('zone') as string,
    photoUrl: formData.get('photoUrl') as string,
    status: formData.get('status') as string || 'activa'
  }

  const parsed = offerSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for creating offer:', parsed.error.format())
    redirect('/app/donaciones?error=invalid')
  }

  try {
    await db.insert(p2pOffers).values({
      donorId,
      category: parsed.data.category,
      description: parsed.data.description,
      availability: parsed.data.availability,
      city: parsed.data.city,
      zone: parsed.data.zone || null,
      photoUrl: parsed.data.photoUrl || null,
      status: parsed.data.status,
      updatedAt: new Date()
    })
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Insert failed for offer:', error)
    redirect('/app/donaciones?error=unknown')
  }

  revalidatePath('/app/donaciones')
  redirect('/app/donaciones?success=created')
}

export async function updateOfferAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string
  const offerId = formData.get('offerId') as string

  if (!offerId) {
    redirect('/app/donaciones?error=invalid')
  }

  const rawData = {
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    availability: formData.get('availability') as string,
    city: formData.get('city') as string,
    zone: formData.get('zone') as string,
    photoUrl: formData.get('photoUrl') as string,
    status: formData.get('status') as string || 'activa'
  }

  const parsed = offerSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for updating offer:', parsed.error.format())
    redirect(`/app/donaciones?error=invalid&offerId=${offerId}`)
  }

  try {
    const [existingOffer] = await db
      .select()
      .from(p2pOffers)
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))

    if (!existingOffer) {
      redirect('/app/donaciones?error=unauthorized')
    }

    await db
      .update(p2pOffers)
      .set({
        category: parsed.data.category,
        description: parsed.data.description,
        availability: parsed.data.availability,
        city: parsed.data.city,
        zone: parsed.data.zone || null,
        photoUrl: parsed.data.photoUrl || null,
        status: parsed.data.status,
        updatedAt: new Date()
      })
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for offer:', error)
    redirect('/app/donaciones?error=unknown')
  }

  revalidatePath('/app/donaciones')
  redirect('/app/donaciones?success=updated')
}

export async function deleteOfferAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string
  const offerId = formData.get('offerId') as string

  if (!offerId) {
    redirect('/app/donaciones?error=invalid')
  }

  try {
    const [existingOffer] = await db
      .select()
      .from(p2pOffers)
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))

    if (!existingOffer) {
      redirect('/app/donaciones?error=unauthorized')
    }

    await db
      .delete(p2pOffers)
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Delete failed for offer:', error)
    redirect('/app/donaciones?error=unknown')
  }

  revalidatePath('/app/donaciones')
  redirect('/app/donaciones?success=deleted')
}

export async function changeOfferStatusAction(offerId: string, newStatus: 'activa' | 'pausada' | 'completada') {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string

  try {
    const [existingOffer] = await db
      .select()
      .from(p2pOffers)
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))

    if (!existingOffer) {
      redirect('/app/donaciones?error=unauthorized')
    }

    await db
      .update(p2pOffers)
      .set({
        status: newStatus,
        updatedAt: new Date()
      })
      .where(and(eq(p2pOffers.id, offerId), eq(p2pOffers.donorId, donorId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Status update failed for offer:', error)
    redirect('/app/donaciones?error=unknown')
  }

  revalidatePath('/app/donaciones')
}
