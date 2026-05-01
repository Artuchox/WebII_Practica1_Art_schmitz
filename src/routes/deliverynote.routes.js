// src/routes/deliverynote.routes.js
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import { uploadMemory } from '../middleware/upload.js'
import { createDeliveryNoteSchema, updateDeliveryNoteSchema } from '../validators/deliverynote.validator.js'
import {
  createDeliveryNote,
  updateDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
  deleteDeliveryNote,
  signDeliveryNote,
  downloadPdf
} from '../controllers/deliverynote.controller.js'

const router = Router()

router.use(authMiddleware)

router.post('/',    validate(createDeliveryNoteSchema), createDeliveryNote)
router.put('/:id',  validate(updateDeliveryNoteSchema), updateDeliveryNote)
router.get('/',     getDeliveryNotes)
router.get('/:id',  getDeliveryNoteById)
router.delete('/:id', deleteDeliveryNote)
router.patch('/:id/sign', uploadMemory.single('signature'), signDeliveryNote)
router.get('/:id/pdf', downloadPdf)

export default router