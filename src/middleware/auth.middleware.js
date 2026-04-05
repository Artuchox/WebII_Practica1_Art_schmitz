// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import env from '../config/env.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token no proporcionado')
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) throw AppError.unauthorized('Usuario no encontrado')
    if (user.deleted) throw AppError.unauthorized('Usuario eliminado')

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Token inválido'))
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expirado'))
    }
    next(error)
  }
}