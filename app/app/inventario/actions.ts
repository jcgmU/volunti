'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { inventory } from '@/db/schema'
import { inventoryItemSchema } from '@/lib/validations'
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

export async function createInventoryItemAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string

  const rawData = {
    category: formData.get('category') as string,
    itemName: formData.get('itemName') as string,
    quantity: formData.get('quantity') as string,
    unit: formData.get('unit') as string,
    status: formData.get('status') as string,
    location: formData.get('location') as string,
    notes: formData.get('notes') as string
  }

  const parsed = inventoryItemSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for creating item:', parsed.error.format())
    redirect('/app/inventario?error=invalid')
  }

  try {
    await db.insert(inventory).values({
      organizationId: orgId,
      category: parsed.data.category,
      itemName: parsed.data.itemName,
      quantity: parsed.data.quantity.toString(),
      unit: parsed.data.unit,
      status: parsed.data.status,
      location: parsed.data.location || '',
      notes: parsed.data.notes || '',
      updatedAt: new Date()
    })
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Insert failed for inventory item:', error)
    redirect('/app/inventario?error=unknown')
  }

  revalidatePath('/app/inventario')
  redirect('/app/inventario?success=created')
}

export async function updateInventoryItemAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string
  const itemId = formData.get('itemId') as string

  if (!itemId) {
    redirect('/app/inventario?error=invalid')
  }

  const rawData = {
    category: formData.get('category') as string,
    itemName: formData.get('itemName') as string,
    quantity: formData.get('quantity') as string,
    unit: formData.get('unit') as string,
    status: formData.get('status') as string,
    location: formData.get('location') as string,
    notes: formData.get('notes') as string
  }

  const parsed = inventoryItemSchema.safeParse(rawData)
  if (!parsed.success) {
    console.error('Validation failed for updating item:', parsed.error.format())
    redirect(`/app/inventario?error=invalid&itemId=${itemId}`)
  }

  try {
    const [existingItem] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))

    if (!existingItem) {
      redirect('/app/inventario?error=unauthorized')
    }

    await db
      .update(inventory)
      .set({
        category: parsed.data.category,
        itemName: parsed.data.itemName,
        quantity: parsed.data.quantity.toString(),
        unit: parsed.data.unit,
        status: parsed.data.status,
        location: parsed.data.location || '',
        notes: parsed.data.notes || '',
        updatedAt: new Date()
      })
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for inventory item:', error)
    redirect('/app/inventario?error=unknown')
  }

  revalidatePath('/app/inventario')
  redirect('/app/inventario?success=updated')
}

export async function deleteInventoryItemAction(formData: FormData) {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string
  const itemId = formData.get('itemId') as string

  if (!itemId) {
    redirect('/app/inventario?error=invalid')
  }

  try {
    const [existingItem] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))

    if (!existingItem) {
      redirect('/app/inventario?error=unauthorized')
    }

    await db
      .delete(inventory)
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Delete failed for inventory item:', error)
    redirect('/app/inventario?error=unknown')
  }

  revalidatePath('/app/inventario')
  redirect('/app/inventario?success=deleted')
}

export async function changeStatusAction(itemId: string, newStatus: 'disponible' | 'reservado' | 'entregado') {
  const session = await getSessionOrRedirect()
  const orgId = session.user.organizationId as string

  try {
    const [existingItem] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))

    if (!existingItem) {
      redirect('/app/inventario?error=unauthorized')
    }

    await db
      .update(inventory)
      .set({
        status: newStatus,
        updatedAt: new Date()
      })
      .where(and(eq(inventory.id, itemId), eq(inventory.organizationId, orgId)))
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Status update failed for inventory item:', error)
    redirect('/app/inventario?error=unknown')
  }

  revalidatePath('/app/inventario')
}
