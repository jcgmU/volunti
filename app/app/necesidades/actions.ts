'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { needs, populations } from '@/db/schema'
import { needSchema } from '@/lib/validations'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

async function getSessionOrRedirect() {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/login')
  }
  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }
  return orgId
}

export async function createNeedAction(formData: FormData) {
  try {
    const orgId = await getSessionOrRedirect()

    const data = {
      populationId: formData.get('populationId') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      quantityNeeded: formData.get('quantityNeeded') as string,
      unit: formData.get('unit') as string,
      urgency: formData.get('urgency') as string,
      status: formData.get('status') as string,
      newPopulation: formData.get('newPopulation') === 'true',
      newPopulationName: formData.get('newPopulationName') as string,
      newPopulationCity: formData.get('newPopulationCity') as string,
      newPopulationDepartment: formData.get('newPopulationDepartment') as string,
    }

    const parsed = needSchema.safeParse(data)
    if (!parsed.success) {
      return redirect('/app/necesidades?action=new&error=invalid')
    }

    let finalPopulationId = parsed.data.populationId

    if (parsed.data.newPopulation) {
      const inserted = await db.insert(populations).values({
        name: parsed.data.newPopulationName!,
        city: parsed.data.newPopulationCity!,
        department: parsed.data.newPopulationDepartment!,
        lat: 0,
        lng: 0,
        priorityLevel: 'amarillo',
        estimatedAffected: 0,
        notes: 'Población agregada por fundación, pendiente de verificar datos',
      }).returning({ id: populations.id })
      
      finalPopulationId = inserted[0].id
    }

    await db.insert(needs).values({
      populationId: finalPopulationId!,
      category: parsed.data.category,
      description: parsed.data.description,
      quantityNeeded: parsed.data.quantityNeeded.toString(),
      unit: parsed.data.unit,
      urgency: parsed.data.urgency,
      status: parsed.data.status,
      reportedByOrgId: orgId,
    })

    revalidatePath('/app/necesidades')
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Error creating need:', error)
    redirect('/app/necesidades?action=new&error=unknown')
  }

  redirect('/app/necesidades?success=created')
}

export async function updateNeedAction(formData: FormData) {
  try {
    const orgId = await getSessionOrRedirect()
    const needId = formData.get('needId') as string

    if (!needId) {
      return redirect('/app/necesidades?error=invalid')
    }

    const data = {
      populationId: formData.get('populationId') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      quantityNeeded: formData.get('quantityNeeded') as string,
      unit: formData.get('unit') as string,
      urgency: formData.get('urgency') as string,
      status: formData.get('status') as string,
      newPopulation: formData.get('newPopulation') === 'true',
      newPopulationName: formData.get('newPopulationName') as string,
      newPopulationCity: formData.get('newPopulationCity') as string,
      newPopulationDepartment: formData.get('newPopulationDepartment') as string,
    }

    const parsed = needSchema.safeParse(data)
    if (!parsed.success) {
      return redirect(`/app/necesidades?action=edit&needId=${needId}&error=invalid`)
    }

    // Ownership check
    const existing = await db.select().from(needs).where(and(eq(needs.id, needId), eq(needs.reportedByOrgId, orgId)))
    if (existing.length === 0) {
      return redirect('/app/necesidades?error=unauthorized')
    }

    let finalPopulationId = parsed.data.populationId

    if (parsed.data.newPopulation) {
      const inserted = await db.insert(populations).values({
        name: parsed.data.newPopulationName!,
        city: parsed.data.newPopulationCity!,
        department: parsed.data.newPopulationDepartment!,
        lat: 0,
        lng: 0,
        priorityLevel: 'amarillo',
        estimatedAffected: 0,
        notes: 'Población agregada por fundación, pendiente de verificar datos',
      }).returning({ id: populations.id })
      
      finalPopulationId = inserted[0].id
    }

    await db.update(needs).set({
      populationId: finalPopulationId!,
      category: parsed.data.category,
      description: parsed.data.description,
      quantityNeeded: parsed.data.quantityNeeded.toString(),
      unit: parsed.data.unit,
      urgency: parsed.data.urgency,
      status: parsed.data.status,
      updatedAt: new Date()
    }).where(and(eq(needs.id, needId), eq(needs.reportedByOrgId, orgId)))

    revalidatePath('/app/necesidades')
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Error updating need:', error)
    const needId = formData.get('needId') as string
    redirect(`/app/necesidades?action=edit&needId=${needId}&error=unknown`)
  }

  redirect('/app/necesidades?success=updated')
}

export async function deleteNeedAction(formData: FormData) {
  try {
    const orgId = await getSessionOrRedirect()
    const needId = formData.get('needId') as string

    if (!needId) {
      return redirect('/app/necesidades?error=invalid')
    }

    // Ownership check implicitly via WHERE clause, but safe to just delete with it
    await db.delete(needs).where(and(eq(needs.id, needId), eq(needs.reportedByOrgId, orgId)))

    revalidatePath('/app/necesidades')
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Error deleting need:', error)
    redirect('/app/necesidades?error=unknown')
  }

  redirect('/app/necesidades?success=deleted')
}

export async function changeNeedStatusAction(needId: string, status: 'abierta' | 'parcial' | 'cubierta') {
  try {
    const orgId = await getSessionOrRedirect()
    if (!needId || !status) return

    await db.update(needs)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(needs.id, needId), eq(needs.reportedByOrgId, orgId)))

    revalidatePath('/app/necesidades')
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Error changing need status:', error)
  }
}
