// src/index.js
import { httpServer } from './app.js'
import env from './config/env.js'
import dbConnect from './config/database.js'
import mongoose from 'mongoose'
import { getIO } from './socket.js'

await dbConnect()

httpServer.listen(env.PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`)
  console.log(`Entorno: ${env.NODE_ENV}`)
})

const shutdown = async (signal) => {
  console.log(`${signal} recibido, cerrando servidor...`)
  const io = getIO()
  if (io) io.close()
  await mongoose.connection.close()
  httpServer.close(() => {
    console.log('Servidor cerrado correctamente')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))