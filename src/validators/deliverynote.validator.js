// src/validators/deliverynote.validator.js
import { z } from 'zod'

const workerSchema = z.object({
  name:  z.string().min(1, 'El nombre del trabajador es obligatorio').trim(),
  hours: z.number().min(0, 'Las horas no pueden ser negativas')
})

export const createDeliveryNoteSchema = z.object({
  body: z.object({
    client:      z.string().min(1, 'El cliente es obligatorio'),
    project:     z.string().min(1, 'El proyecto es obligatorio'),
    format:      z.enum(['material', 'hours'], { required_error: 'El formato es obligatorio' }),
    description: z.string().trim().optional(),
    workDate:    z.string().min(1, 'La fecha de trabajo es obligatoria'),
    material: z.string().trim().optional(),
    quantity: z.number().min(0).optional(),
    unit:     z.string().trim().optional(),
    hours:   z.number().min(0).optional(),
    workers: z.array(workerSchema).optional()
  }).refine(
    data => {
      if (data.format === 'material') return !!data.material && data.quantity !== undefined && !!data.unit
      return true
    },
    { message: 'Para albaranes de material son obligatorios: material, quantity y unit', path: ['material'] }
  ).refine(
    data => {
      if (data.format === 'hours') return data.hours !== undefined || (data.workers && data.workers.length > 0)
      return true
    },
    { message: 'Para albaranes de horas es obligatorio indicar hours o workers', path: ['hours'] }
  )
})

export const updateDeliveryNoteSchema = z.object({
  body: z.object({
    description: z.string().trim().optional(),
    workDate:    z.string().optional(),
    material:    z.string().trim().optional(),
    quantity:    z.number().min(0).optional(),
    unit:        z.string().trim().optional(),
    hours:       z.number().min(0).optional(),
    workers:     z.array(workerSchema).optional()
  })
})