// src/middleware/role.middleware.js
import AppError from '../utils/AppError.js'

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('No tienes permisos para realizar esta acción'))
    }
    next()
  }
}