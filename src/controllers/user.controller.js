// src/controllers/user.controller.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import notificationService from '../services/notification.service.js'
import env from '../config/env.js'
import Company from '../models/Company.js'

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

export const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body
    const user = req.user

    if (user.status === 'verified') {
      throw AppError.badRequest('El email ya está verificado')
    }

    if (user.verificationAttempts <= 0) {
      throw AppError.tooManyRequests('Has agotado los intentos de verificación')
    }

    if (user.verificationCode !== code) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { verificationAttempts: -1 }
      })
      throw AppError.badRequest(`Código incorrecto. Intentos restantes: ${user.verificationAttempts - 1}`)
    }

    await User.findByIdAndUpdate(user._id, {
      status: 'verified',
      verificationCode: null
    })

    notificationService.emit('user:verified', { email: user.email })

    res.status(200).json({ message: 'Email verificado correctamente' })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const user = await User.findOne({ email })
    if (!user) throw AppError.unauthorized('Credenciales incorrectas')

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw AppError.unauthorized('Credenciales incorrectas')

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user._id)

    res.status(200).json({
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
export const updatePersonalData = async (req, res, next) => {
  try {
    const { name, lastName, nif } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, lastName, nif },
      { new: true }
    ).select('-password -verificationCode')

    res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
}

export const updateCompany = async (req, res, next) => {
  try {
    const { name, cif, address, isFreelance } = req.body
    const user = req.user

    let company

    // Comprobar si ya existe una compañía con ese CIF
    const existingCompany = await Company.findOne({ cif })

    if (existingCompany) {
      // Unirse a la compañía existente como guest
      company = existingCompany
      await User.findByIdAndUpdate(user._id, {
        company: company._id,
        role: 'guest'
      })
    } else {
      // Crear nueva compañía
      const companyData = isFreelance
        ? {
            // Autónomo: usa sus propios datos personales
            owner: user._id,
            name: user.name,
            cif: user.nif,
            address: user.address,
            isFreelance: true
          }
        : {
            owner: user._id,
            name,
            cif,
            address,
            isFreelance: false
          }

      company = await Company.create(companyData)

      await User.findByIdAndUpdate(user._id, {
        company: company._id
      })
    }

    res.status(200).json({ company })
  } catch (error) {
    next(error)
  }
}

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No se ha subido ningún archivo')
    }

    const user = req.user
    if (!user.company) {
      throw AppError.badRequest('El usuario no tiene una compañía asociada')
    }

    // Guardamos la ruta del archivo en el campo 'logo' de la compañía
    const logoUrl = `/uploads/${req.file.filename}`
    
    const company = await Company.findByIdAndUpdate(
      user.company,
      { logo: logoUrl },
      { new: true }
    )

    res.status(200).json({
      message: 'Logo actualizado correctamente',
      logo: logoUrl,
      company
    })
  } catch (error) {
    next(error)
  }
}