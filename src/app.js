// src/app.js
import express from 'express'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/error-handler.js'
import sanitizeBody from './middleware/sanitize.middleware.js';
import userRoutes from './routes/user.routes.js'
import clientRoutes from './routes/client.routes.js'
import projectRoutes from './routes/project.routes.js'
import deliveryNoteRoutes from './routes/deliverynote.routes.js'
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './docs/swagger.js';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';


const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})
 
io.on('connection', (socket) => {
  socket.on('disconnect', () => {})
})
 
export { io }
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
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream
})

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  res.status(200).json({
    status:    'ok',
    db:        dbState === 1 ? 'connected' : 'disconnected',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString()
  })
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api/user', userRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/project', projectRoutes)
app.use('/api/deliverynote', deliveryNoteRoutes)
app.use(errorHandler)

export { httpServer }
export default app