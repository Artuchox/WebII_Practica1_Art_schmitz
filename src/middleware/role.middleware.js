// src/middleware/role.middleware.js
import AppError from '../utils/AppError.js'

export const authorize = (...roles) => {
  return (req, res, next) => {
    // El usuario ya viene cargado por el authMiddleware
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('No tienes permisos para realizar esta acción'))
    }
    next()
  }
}