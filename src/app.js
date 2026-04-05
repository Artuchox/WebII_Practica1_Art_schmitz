// src/app.js
import express from 'express'
import errorHandler from './middleware/error-handler.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(errorHandler)

export default app