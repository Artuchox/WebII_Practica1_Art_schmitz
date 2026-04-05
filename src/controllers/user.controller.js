// src/controllers/user.controller.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import notificationService from '../services/notification.service.js'
import env from '../config/env.js'

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )
  const refreshToken = jwt.sign(
    { id: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  )
  return { accessToken, refreshToken }
}

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email, status: 'verified' })
    if (existingUser) throw AppError.conflict('El email ya está registrado')

    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationCode = generateVerificationCode()

    const user = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3
    })

    notificationService.emit('user:registered', { email: user.email })

    const { accessToken, refreshToken } = generateTokens(user._id)

    res.status(201).json({
      user: {
        email: user.email,
        status: user.status,
        role: user.role
      },
      accessToken,
      refreshToken
    })
  } catch (error) {
    next(error)
  }
}