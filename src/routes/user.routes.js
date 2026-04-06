// src/routes/user.routes.js
import { Router } from 'express'
import validate from '../middleware/validate.js'
import { registerSchema, verificationSchema, loginSchema, personalDataSchema, companySchema } from '../validators/user.validator.js'
import { register, verifyEmail, login, updatePersonalData, updateCompany  } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.put('/validation', authMiddleware, validate(verificationSchema), verifyEmail)
router.post('/login', validate(loginSchema), login)
router.put('/register', authMiddleware, validate(personalDataSchema), updatePersonalData)
router.patch('/company', authMiddleware, validate(companySchema), updateCompany)

export default router