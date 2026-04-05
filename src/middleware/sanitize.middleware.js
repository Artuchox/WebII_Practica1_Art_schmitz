// src/middleware/sanitize.middleware.js
const sanitizeBody = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) delete obj[key]
      else if (typeof obj[key] === 'object') sanitize(obj[key])
    }
  }
  sanitize(req.body)
  next()
}

export default sanitizeBody