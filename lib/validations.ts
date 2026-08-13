import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Ingresá un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres')
})

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  email: z.string().email('Ingresá un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres')
})

export const onboardingSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio').max(200),
  focusAreas: z.array(z.enum(['personas', 'animales', 'ambos'])).min(1, 'Elegí al menos uno'),
  categories: z.array(z.enum(['alimentos', 'agua', 'salud', 'vivienda', 'ropa', 'higiene', 'rescate', 'psicosocial', 'educación', 'transporte', 'mano_de_obra'])).min(1, 'Elegí al menos una categoría'),
  description: z.string().min(10, 'Contanos un poco más sobre tu fundación').max(2000),
  contactPhone: z.string().min(7, 'Ingresá un teléfono válido').max(30),
  contactWhatsapp: z.string().max(30).optional().or(z.literal('')),
  city: z.string().min(2, 'Ingresá la ciudad').max(100),
  department: z.string().min(2, 'Ingresá el departamento').max(100),
  capacityNotes: z.string().max(1000).optional().or(z.literal(''))
})

export const inventoryItemSchema = z.object({
  category: z.enum(['alimentos', 'agua', 'salud', 'vivienda', 'ropa', 'higiene', 'rescate', 'psicosocial', 'educación', 'transporte', 'mano_de_obra']),
  itemName: z.string().min(1, 'El nombre del artículo es obligatorio').max(200),
  quantity: z.coerce.number().positive('La cantidad debe ser un número positivo y mayor a 0'),
  unit: z.string().min(1, 'La unidad de medida es obligatoria').max(50),
  status: z.enum(['disponible', 'reservado', 'entregado']),
  location: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal(''))
})

export const volunteerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio').max(200),
  contactPhone: z.string().min(7, 'Ingresá un teléfono de contacto válido').max(30),
  skills: z.array(z.string()).min(1, 'Ingresá al menos una habilidad'),
  city: z.string().min(2, 'La ciudad es obligatoria').max(100),
  availabilityFrom: z.string().min(1, 'Fecha de inicio requerida'),
  availabilityTo: z.string().min(1, 'Fecha de fin requerida'),
  status: z.enum(['disponible', 'asignado', 'no_disponible'])
})
