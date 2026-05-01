// src/validators/project.validator.js
import { z } from 'zod'

const addressSchema = z.object({
  street:   z.string().trim().optional(),
  number:   z.string().trim().optional(),
  postal:   z.string().trim().optional(),
  city:     z.string().trim().optional(),
  province: z.string().trim().optional()
}).optional()

export const createProjectSchema = z.object({
  body: z.object({
    name:        z.string().min(1, 'El nombre es obligatorio').trim(),
    projectCode: z.string().min(1, 'El código de proyecto es obligatorio').trim(),
    client:      z.string().min(1, 'El cliente es obligatorio'),
    address:     addressSchema,
    email:       z.string().email('Email no válido').transform(val => val.toLowerCase().trim()).optional(),
    notes:       z.string().trim().optional()
  })
})

export const updateProjectSchema = z.object({
  body: z.object({
    name:        z.string().min(1, 'El nombre es obligatorio').trim().optional(),
    projectCode: z.string().min(1, 'El código de proyecto es obligatorio').trim().optional(),
    client:      z.string().optional(),
    address:     addressSchema,
    email:       z.string().email('Email no válido').transform(val => val.toLowerCase().trim()).optional(),
    notes:       z.string().trim().optional(),
    active:      z.boolean().optional()
  })
})