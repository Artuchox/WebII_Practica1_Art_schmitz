// src/index.js
import app from './app.js';
import env from './config/env.js';
import dbConnect from './config/db.js';
import mongoose from 'mongoose'

dbConnect();

app.listen(env.PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${env.PORT}`);
    console.log(`Entorno: ${env.NODE_ENV}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} recibido, cerrando servidor...`)
  io.close()
  await mongoose.connection.close()
  httpServer.close(() => {
    console.log('Servidor cerrado correctamente')
    process.exit(0)
  })
}
 
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
 