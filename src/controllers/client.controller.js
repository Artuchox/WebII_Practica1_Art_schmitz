// src/controllers/client.controller.js
import Client from '../models/Client.js'
import AppError from '../utils/AppError.js'

export const createClient = async (req, res, next) => {
  try {
    const { name, cif, email, phone, address } = req.body
    const user = req.user
    const existing = await Client.findOne({ cif, company: user.company })
    if (existing) throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía')

    const client = await Client.create({
      user:    user._id,
      company: user.company,
      name,
      cif,
      email,
      phone,
      address
    })

    res.status(201).json({ client })
  } catch (error) {
    next(error)
  }
}

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const client = await Client.findOne({ _id: id, company: user.company, deleted: false })
    if (!client) throw AppError.notFound('Cliente no encontrado')
    if (req.body.cif && req.body.cif !== client.cif) {
      const existing = await Client.findOne({ cif: req.body.cif, company: user.company })
      if (existing) throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía')
    }

    const updated = await Client.findByIdAndUpdate(id, req.body, { new: true })

    res.status(200).json({ client: updated })
  } catch (error) {
    next(error)
  }
}

export const getClients = async (req, res, next) => {
  try {
    const user = req.user

    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit
    const filter = { company: user.company, deleted: false }
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' }
    }

    const sort = req.query.sort || 'createdAt'

    const [clients, totalItems] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(filter)
    ])

    res.status(200).json({
      clients,
      currentPage: page,
      totalPages:  Math.ceil(totalItems / limit),
      totalItems
    })
  } catch (error) {
    next(error)
  }
}

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const client = await Client.findOne({ _id: id, company: user.company, deleted: false })
    if (!client) throw AppError.notFound('Cliente no encontrado')

    res.status(200).json({ client })
  } catch (error) {
    next(error)
  }
}

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    const isSoftDelete = req.query.soft === 'true'

    const client = await Client.findOne({ _id: id, company: user.company, deleted: false })
    if (!client) throw AppError.notFound('Cliente no encontrado')

    if (isSoftDelete) {
      await Client.findByIdAndUpdate(id, { deleted: true })
    } else {
      await Client.findByIdAndDelete(id)
    }

    res.status(200).json({ message: `Cliente eliminado (${isSoftDelete ? 'soft' : 'hard'})` })
  } catch (error) {
    next(error)
  }
}

export const getArchivedClients = async (req, res, next) => {
  try {
    const user = req.user

    const clients = await Client.find({ company: user.company, deleted: true })

    res.status(200).json({ clients })
  } catch (error) {
    next(error)
  }
}

export const restoreClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const client = await Client.findOne({ _id: id, company: user.company, deleted: true })
    if (!client) throw AppError.notFound('Cliente archivado no encontrado')

    await Client.findByIdAndUpdate(id, { deleted: false })

    res.status(200).json({ message: 'Cliente restaurado correctamente' })
  } catch (error) {
    next(error)
  }
}