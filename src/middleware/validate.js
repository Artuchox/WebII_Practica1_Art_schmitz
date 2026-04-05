// src/middleware/validate.js
import AppError from '../utils/AppError.js'

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body:   req.body,
      params: req.params,
      query:  req.query
    })

    req.body   = result.body   ?? req.body
    req.params = result.params ?? req.params

    next()
  } catch (error) {
    console.log('Error en validate:', error.name, error.issues)

    if (error.issues) {
      const messages = error.issues.map(e => e.message).join(', ')
      return next(AppError.badRequest(messages))
    }

    next(error)
  }
}

export default validate