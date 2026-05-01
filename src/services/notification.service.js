// src/services/notification.service.js
import { EventEmitter } from 'node:events'
import { sendSlackNotification } from '../utils/handleLogger.js'

class NotificationService extends EventEmitter {}

const notificationService = new NotificationService()

notificationService.on('user:registered', (user) => {
  console.log(`[EVENT] user:registered - ${user.email}`)
  sendSlackNotification(`✅ *Nuevo usuario registrado*\nEmail: ${user.email}`)
})

notificationService.on('user:verified', (user) => {
  console.log(`[EVENT] user:verified - ${user.email}`)
  sendSlackNotification(`✅ *Usuario verificado*\nEmail: ${user.email}`)
})

notificationService.on('user:invited', (user) => {
  console.log(`[EVENT] user:invited - ${user.email}`)
  sendSlackNotification(`✅ *Usuario invitado*\nEmail: ${user.email}`)
})

notificationService.on('user:deleted', (user) => {
  console.log(`[EVENT] user:deleted - ${user.email}`)
  sendSlackNotification(`⚠️ *Usuario eliminado*\nEmail: ${user.email}`)
})

export default notificationService