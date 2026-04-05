// src/validators/user.validator.js
import { z } from 'zod'

const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')

export const registerSchema = z.object({
  body: z.object({
    email:    z.string().email('Email no válido').transform(val => val.toLowerCase().trim()),
    password: passwordSchema
  })
})

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Email no válido').transform(val => val.toLowerCase().trim()),
    password: z.string().min(1, 'La contraseña es obligatoria')
  })
})

export const verificationSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'El código debe tener exactamente 6 dígitos').regex(/^\d{6}$/, 'El código solo puede contener dígitos')
  })
})

export const personalDataSchema = z.object({
  body: z.object({
    name:     z.string().min(1, 'El nombre es obligatorio').trim(),
    lastName: z.string().min(1, 'Los apellidos son obligatorios').trim(),
    nif:      z.string().min(1, 'El NIF es obligatorio').trim()
  })
})

export const companySchema = z.object({
  body: z.object({
    name:        z.string().min(1, 'El nombre es obligatorio').trim(),
    cif:         z.string().min(1, 'El CIF es obligatorio').trim(),
    isFreelance: z.boolean().default(false),
    address: z.object({
      street:   z.string().trim().optional(),
      number:   z.string().trim().optional(),
      postal:   z.string().trim().optional(),
      city:     z.string().trim().optional(),
      province: z.string().trim().optional()
    }).optional()
  })
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword:     passwordSchema
  }).refine(
    data => data.currentPassword !== data.newPassword,
    { message: 'La nueva contraseña debe ser diferente a la actual', path: ['newPassword'] }
  )
})

export const inviteSchema = z.object({
  body: z.object({
    email:    z.string().email('Email no válido').transform(val => val.toLowerCase().trim()),
    name:     z.string().min(1, 'El nombre es obligatorio').trim(),
    lastName: z.string().min(1, 'Los apellidos son obligatorios').trim()
  })
})