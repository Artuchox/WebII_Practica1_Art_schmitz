// src/middleware/error-handler.js
import AppError from '../utils/AppError.js'

const errorHandler = (err, req, res, next) => {

  // Error de Mongoose: email duplicado (index unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      status: 'error',
      message: `El ${field} ya está registrado`
    })
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    })
  }

  // Error operacional nuestro (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  // Error inesperado (bug)
  console.error('ERROR INESPERADO:', err)
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  })
}

export default errorHandler