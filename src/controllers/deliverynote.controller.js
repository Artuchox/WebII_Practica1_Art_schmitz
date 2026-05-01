// src/controllers/deliverynote.controller.js
import PDFDocument from 'pdfkit'
import { Readable } from 'node:stream'
import DeliveryNote from '../models/DeliveryNote.js'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import AppError from '../utils/AppError.js'
import cloudinary from '../config/cloudinary.js'

export const createDeliveryNote = async (req, res, next) => {
  try {
    const { client, project, format, description, workDate, material, quantity, unit, hours, workers } = req.body
    const user = req.user

    const existingClient = await Client.findOne({ _id: client, company: user.company, deleted: false })
    if (!existingClient) throw AppError.notFound('Cliente no encontrado en tu compañía')

    const existingProject = await Project.findOne({ _id: project, company: user.company, deleted: false })
    if (!existingProject) throw AppError.notFound('Proyecto no encontrado en tu compañía')

    const deliveryNote = await DeliveryNote.create({
      user:    user._id,
      company: user.company,
      client,
      project,
      format,
      description,
      workDate,
      material,
      quantity,
      unit,
      hours,
      workers
    })

    res.status(201).json({ deliveryNote })
  } catch (error) {
    next(error)
  }
}

export const updateDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: user.company, deleted: false })
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado')

    if (deliveryNote.signed) throw AppError.badRequest('No se puede modificar un albarán firmado')

    const updated = await DeliveryNote.findByIdAndUpdate(id, req.body, { new: true })

    res.status(200).json({ deliveryNote: updated })
  } catch (error) {
    next(error)
  }
}

export const getDeliveryNotes = async (req, res, next) => {
  try {
    const user = req.user

    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const filter = { company: user.company, deleted: false }
    if (req.query.client)              filter.client  = req.query.client
    if (req.query.project)             filter.project = req.query.project
    if (req.query.format)              filter.format  = req.query.format
    if (req.query.signed !== undefined) filter.signed = req.query.signed === 'true'

    const sort = req.query.sort || 'createdAt'

    const [deliveryNotes, totalItems] = await Promise.all([
      DeliveryNote.find(filter)
        .populate('client',  'name cif')
        .populate('project', 'name projectCode')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      DeliveryNote.countDocuments(filter)
    ])

    res.status(200).json({
      deliveryNotes,
      currentPage: page,
      totalPages:  Math.ceil(totalItems / limit),
      totalItems
    })
  } catch (error) {
    next(error)
  }
}

export const getDeliveryNoteById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: user.company, deleted: false })
      .populate('client',  'name cif email')
      .populate('project', 'name projectCode address')

    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado')

    res.status(200).json({ deliveryNote })
  } catch (error) {
    next(error)
  }
}

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    const isSoftDelete = req.query.soft === 'true'

    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: user.company, deleted: false })
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado')

    if (deliveryNote.signed) throw AppError.badRequest('No se puede eliminar un albarán firmado')

    if (isSoftDelete) {
      await DeliveryNote.findByIdAndUpdate(id, { deleted: true })
    } else {
      await DeliveryNote.findByIdAndDelete(id)
    }

    res.status(200).json({ message: `Albarán eliminado (${isSoftDelete ? 'soft' : 'hard'})` })
  } catch (error) {
    next(error)
  }
}

export const signDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    if (!req.file) throw AppError.badRequest('No se ha subido ninguna imagen de firma')

    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: user.company, deleted: false })
      .populate('client',  'name cif')
      .populate('project', 'name projectCode')

    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado')
    if (deliveryNote.signed) throw AppError.badRequest('El albarán ya está firmado')

    const signatureUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'signatures', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      Readable.from(req.file.buffer).pipe(stream)
    })

    const pdf = await generatePdf(deliveryNote, signatureUpload.secure_url)

    const pdfUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'pdfs', resource_type: 'raw', format: 'pdf' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      Readable.from(pdf).pipe(stream)
    })

    const updated = await DeliveryNote.findByIdAndUpdate(
      id,
      {
        signed:       true,
        signedAt:     new Date(),
        signatureUrl: signatureUpload.secure_url,
        pdfUrl:       pdfUpload.secure_url
      },
      { new: true }
    )

    res.status(200).json({ deliveryNote: updated })
  } catch (error) {
    next(error)
  }
}

export const downloadPdf = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: user.company, deleted: false })
      .populate('client',  'name cif')
      .populate('project', 'name projectCode')

    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado')
    if (!deliveryNote.signed) throw AppError.badRequest('El albarán aún no está firmado')

    const pdf = await generatePdf(deliveryNote, deliveryNote.signatureUrl)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=albaran-${id}.pdf`)
    res.send(pdf)
  } catch (error) {
    next(error)
  }
}

const generatePdf = (deliveryNote, signatureUrl) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(20).text('Albarán', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Cliente: ${deliveryNote.client?.name ?? ''} (${deliveryNote.client?.cif ?? ''})`)
    doc.text(`Proyecto: ${deliveryNote.project?.name ?? ''} (${deliveryNote.project?.projectCode ?? ''})`)
    doc.text(`Formato: ${deliveryNote.format}`)
    doc.text(`Fecha de trabajo: ${new Date(deliveryNote.workDate).toLocaleDateString('es-ES')}`)

    if (deliveryNote.description) {
      doc.moveDown().text(`Descripción: ${deliveryNote.description}`)
    }

    if (deliveryNote.format === 'material') {
      doc.moveDown()
      doc.text(`Material: ${deliveryNote.material}`)
      doc.text(`Cantidad: ${deliveryNote.quantity} ${deliveryNote.unit}`)
    }

    if (deliveryNote.format === 'hours') {
      doc.moveDown()
      if (deliveryNote.hours) doc.text(`Horas totales: ${deliveryNote.hours}`)
      if (deliveryNote.workers?.length > 0) {
        doc.text('Trabajadores:')
        deliveryNote.workers.forEach(w => {
          doc.text(`  - ${w.name}: ${w.hours}h`)
        })
      }
    }

    if (signatureUrl) {
      doc.moveDown().text('Firma:')
      doc.image(signatureUrl, { width: 200 })
    }

    doc.end()
  })
}