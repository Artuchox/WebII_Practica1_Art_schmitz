// src/socket.js
import { Server } from 'socket.io'

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    socket.on('join:company', (companyId) => {
      socket.join(`company:${companyId}`)
    })
    socket.on('disconnect', () => {})
  })

  return io
}

export const getIO = () => io