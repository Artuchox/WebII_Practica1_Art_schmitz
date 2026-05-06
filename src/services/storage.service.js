// src/services/storage.service.js
import { Readable } from 'node:stream'
import cloudinary from '../config/cloudinary.js'

export const uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
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