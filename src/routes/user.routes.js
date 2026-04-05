// src/routes/user.routes.js
import { Router } from 'express'
import validate from '../middleware/validate.js'
import { registerSchema } from '../validators/user.validator.js'
import { register } from '../controllers/user.controller.js'

const router = Router()

router.post('/register', validate(registerSchema), register)

export default router