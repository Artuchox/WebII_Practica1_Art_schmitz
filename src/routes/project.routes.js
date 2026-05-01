// src/routes/project.routes.js
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js'
import {
  createProject,
  updateProject,
  getProjects,
  getProjectById,
  deleteProject,
  getArchivedProjects,
  restoreProject
} from '../controllers/project.controller.js'

const router = Router()

router.use(authMiddleware)

router.post('/',             validate(createProjectSchema), createProject)
router.put('/:id',           validate(updateProjectSchema), updateProject)
router.get('/',              getProjects)
router.get('/archived',      getArchivedProjects)
router.get('/:id',           getProjectById)
router.delete('/:id',        deleteProject)
router.patch('/:id/restore', restoreProject)

export default router