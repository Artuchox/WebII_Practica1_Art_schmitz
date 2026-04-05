// src/app.js
import express from 'express'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/error-handler.js'
import sanitizeBody from './middleware/sanitize.middleware.js';

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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(errorHandler)

export default app