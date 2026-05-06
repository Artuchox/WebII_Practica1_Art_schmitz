// src/app.js
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'
import errorHandler from './middleware/error-handler.js'
import sanitizeBody from './middleware/sanitize.middleware.js'
import limiter from './middleware/rate-limit.js'
import routes from './routes/index.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'
import morganBody from 'morgan-body'
import { loggerStream } from './utils/handleLogger.js'
import mongoose from 'mongoose'

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
app.use(limiter)
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use('/api', routes)
app.use(errorHandler)

export { httpServer }
export default app