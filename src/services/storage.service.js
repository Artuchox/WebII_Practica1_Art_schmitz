// src/services/storage.service.js
import { Readable } from 'node:stream'
import sharp from 'sharp'
import cloudinary from '../config/cloudinary.js'

export const uploadImage = async (buffer, folder) => {
  const optimized = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    Readable.from(optimized).pipe(stream)
  })
}

export const uploadPdf = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}