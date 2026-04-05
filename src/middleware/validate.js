// src/middleware/validate.js
import AppError from '../utils/AppError.js'

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body:   req.body,
    params: req.params,
    query:  req.query
  })

  if (!result.success) {
    const messages = result.error.errors.map(e => e.message).join(', ')
    return next(AppError.badRequest(messages))
  }

  req.body   = result.data.body   ?? req.body
  req.params = result.data.params ?? req.params
  req.query  = result.data.query  ?? req.query

  next()
}

export default validate