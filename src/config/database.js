// src/config/database.js
import mongoose from 'mongoose'
import env from './env.js'

const dbConnect = async () => {
  try {
    await mongoose.connect(env.DB_URI)
    console.log('Conectado a MongoDB')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('Desconectado de MongoDB')
})

export default dbConnect