// src/utils/handleLogger.js
import { IncomingWebhook } from '@slack/webhook'
import env from '../config/env.js'

const webhook = env.SLACK_WEBHOOK
  ? new IncomingWebhook(env.SLACK_WEBHOOK)
  : null

export const loggerStream = {
  write: (message) => {
    if (webhook) {
      webhook.send({
        text: `🚨 *Error en BildyApp API*\n\`\`\`${message}\`\`\``
      }).catch(err => console.error('Error enviando a Slack:', err))
    }
    console.error(message)
  }
}

export const sendSlackNotification = async (message) => {
  if (!webhook) return
  try {
    await webhook.send({ text: message })
  } catch (err) {
    console.error('Error enviando a Slack:', err)
  }
}