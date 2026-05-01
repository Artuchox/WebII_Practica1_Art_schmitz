// src/routes/client.routes.js
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js'
import {
  createClient,
  updateClient,
  getClients,
  getClientById,
  deleteClient,
  getArchivedClients,
  restoreClient
} from '../controllers/client.controller.js'

const router = Router()

router.use(authMiddleware)

router.post('/',             validate(createClientSchema), createClient)
router.put('/:id',           validate(updateClientSchema), updateClient)
router.get('/',              getClients)
router.get('/archived',      getArchivedClients)
router.get('/:id',           getClientById)
router.delete('/:id',        deleteClient)
router.patch('/:id/restore', restoreClient)

export default router