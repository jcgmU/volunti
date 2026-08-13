import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createInventoryItemAction, updateInventoryItemAction } from '../actions'

import { inventory } from '@/db/schema'

interface InventoryFormProps {
  item?: typeof inventory.$inferSelect | null
}

export function InventoryForm({ item }: InventoryFormProps) {
  const isEdit = !!item

  const categories = [
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'agua', label: 'Agua' },
    { value: 'salud', label: 'Salud y Medicina' },
    { value: 'vivienda', label: 'Vivienda y Refugio' },
    { value: 'ropa', label: 'Ropa y Abrigo' },
    { value: 'higiene', label: 'Artículos de Higiene' },
    { value: 'rescate', label: 'Búsqueda y Rescate' },
    { value: 'psicosocial', label: 'Apoyo Psicosocial' },
    { value: 'educación', label: 'Educación y Recreación' },
    { value: 'transporte', label: 'Transporte y Logística' },
    { value: 'mano_de_obra', label: 'Mano de Obra y Técnicos' }
  ]

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar artículo' : 'Registrar nuevo artículo'}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? 'Modifica los detalles del artículo existente en tu inventario.'
            : 'Agregá un nuevo artículo disponible para la coordinación de ayuda.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={isEdit ? updateInventoryItemAction : createInventoryItemAction} className="space-y-4">
          {isEdit && <input type="hidden" name="itemId" value={item.id} />}

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              name="category"
              defaultValue={item?.category || 'alimentos'}
              required
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Nombre del artículo *</Label>
            <Input
              id="itemName"
              name="itemName"
              type="text"
              placeholder="Ej. Harina de trigo, Kit médico, Cobijas"
              defaultValue={item?.itemName || ''}
              required
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0.001"
                placeholder="Ej. 150"
                defaultValue={item?.quantity || ''}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de medida *</Label>
              <Input
                id="unit"
                name="unit"
                type="text"
                placeholder="Ej. kg, unidades, bultos"
                defaultValue={item?.unit || ''}
                required
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <select
                id="status"
                name="status"
                defaultValue={item?.status || 'disponible'}
                required
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación / Bodega *</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Ej. Bodega Norte, Cali"
                defaultValue={item?.location || ''}
                required
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalles sobre fechas de vencimiento, embalaje o condiciones de entrega..."
              defaultValue={item?.notes || ''}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isEdit ? 'Guardar cambios' : 'Registrar artículo'}
            </Button>
            <Link href="/app/inventario" passHref className="w-full">
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
