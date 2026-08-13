'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { p2pProfiles } from '@/db/schema'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { eq } from 'drizzle-orm'

export async function createP2PProfile(formData: FormData) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  // Prevent org users from creating P2P profile
  if (session.user.organizationId) {
    redirect('/app')
  }

  const alias = formData.get('alias') as string
  const phone = formData.get('phone') as string
  const avatarUrl = formData.get('avatarUrl') as string

  if (!alias || !phone) {
    return { error: 'Alias y teléfono son obligatorios.' }
  }

  try {
    // Check if profile already exists
    const [existing] = await db.select().from(p2pProfiles).where(eq(p2pProfiles.userId, session.user.id))
    if (existing) {
      redirect('/app')
    }

    await db.insert(p2pProfiles).values({
      userId: session.user.id,
      alias,
      phone,
      avatarUrl: avatarUrl || null
    })
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('Error creating P2P profile:', error)
    return { error: 'Ocurrió un error inesperado al guardar el perfil.' }
  }

  // Success -> Go to App
  redirect('/app')
}
