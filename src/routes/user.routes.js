// src/routes/user.routes.js
import { Router } from 'express'
import validate from '../middleware/validate.js'
import { registerSchema, verificationSchema } from '../validators/user.validator.js'
import { register, verifyEmail } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.put('/validation', authMiddleware, validate(verificationSchema), verifyEmail)

export default router