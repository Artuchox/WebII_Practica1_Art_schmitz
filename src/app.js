// src/app.js
import express from 'express'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/error-handler.js'
import sanitizeBody from './middleware/sanitize.middleware.js';
import userRoutes from './routes/user.routes.js'
import path from 'node:path'

const app = express()
app.use(express.json());
app.use(helmet());
app.use(sanitizeBody);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Demasiadas peticiones, intenta de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false
}));
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/user', userRoutes)
app.use(errorHandler)

export default app