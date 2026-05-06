// src/services/mail.service.js
import nodemailer from 'nodemailer'
import env from '../config/env.js'

const transporter = nodemailer.createTransport({
  host:   env.MAIL_HOST,
  port:   env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS
  }
})

export const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"BildyApp" <${env.MAIL_USER}>`,
    to,
    subject,
    html
  })
}

export const sendVerificationEmail = async (to, code) => {
  await sendMail({
    to,
    subject: 'Verifica tu cuenta',
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`
  })
}

export const sendInvitationEmail = async (to, name) => {
  await sendMail({
    to,
    subject: 'Has sido invitado a BildyApp',
    html: `<p>Hola ${name}, has sido invitado a unirte a BildyApp.</p>`
  })
}