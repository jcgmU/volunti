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
