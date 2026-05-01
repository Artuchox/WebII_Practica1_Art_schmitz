// src/validators/client.validator.js
import { z } from 'zod'
 
const addressSchema = z.object({
  street:   z.string().trim().optional(),
  number:   z.string().trim().optional(),
  postal:   z.string().trim().optional(),
  city:     z.string().trim().optional(),
  province: z.string().trim().optional()
}).optional()
 
export const createClientSchema = z.object({
  body: z.object({
    name:    z.string().min(1, 'El nombre es obligatorio').trim(),
    cif:     z.string().min(1, 'El CIF es obligatorio').trim(),
    email:   z.string().email('Email no válido').transform(val => val.toLowerCase().trim()).optional(),
    phone:   z.string().trim().optional(),
    address: addressSchema
  })
})
 
export const updateClientSchema = z.object({
  body: z.object({
    name:    z.string().min(1, 'El nombre es obligatorio').trim().optional(),
    cif:     z.string().min(1, 'El CIF es obligatorio').trim().optional(),
    email:   z.string().email('Email no válido').transform(val => val.toLowerCase().trim()).optional(),
    phone:   z.string().trim().optional(),
    address: addressSchema
  })
})