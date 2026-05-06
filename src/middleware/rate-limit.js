// src/middleware/rate-limit.js
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Demasiadas peticiones, intenta de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false
})

export default limiter