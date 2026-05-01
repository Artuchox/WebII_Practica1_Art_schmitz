// src/controllers/deliverynote.controller.js
import DeliveryNote from '../models/DeliveryNote.js'
import Client from '../models/Client.js'
import Project from '../models/Project.js'
import AppError from '../utils/AppError.js'

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
    if (req.query.client)  filter.client  = req.query.client
    if (req.query.project) filter.project = req.query.project
    if (req.query.format)  filter.format  = req.query.format
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