// src/controllers/project.controller.js
import Project from '../models/Project.js'
import Client from '../models/Client.js'
import AppError from '../utils/AppError.js'

export const createProject = async (req, res, next) => {
  try {
    const { name, projectCode, client, address, email, notes } = req.body
    const user = req.user

    const existingClient = await Client.findOne({ _id: client, company: user.company, deleted: false })
    if (!existingClient) throw AppError.notFound('Cliente no encontrado en tu compañía')

    const existing = await Project.findOne({ projectCode, company: user.company })
    if (existing) throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía')

    const project = await Project.create({
      user:    user._id,
      company: user.company,
      client,
      name,
      projectCode,
      address,
      email,
      notes
    })

    res.status(201).json({ project })
  } catch (error) {
    next(error)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const project = await Project.findOne({ _id: id, company: user.company, deleted: false })
    if (!project) throw AppError.notFound('Proyecto no encontrado')

    if (req.body.projectCode && req.body.projectCode !== project.projectCode) {
      const existing = await Project.findOne({ projectCode: req.body.projectCode, company: user.company })
      if (existing) throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía')
    }

    if (req.body.client) {
      const existingClient = await Client.findOne({ _id: req.body.client, company: user.company, deleted: false })
      if (!existingClient) throw AppError.notFound('Cliente no encontrado en tu compañía')
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true })

    res.status(200).json({ project: updated })
  } catch (error) {
    next(error)
  }
}

export const getProjects = async (req, res, next) => {
  try {
    const user = req.user

    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const filter = { company: user.company, deleted: false }
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' }
    }
    if (req.query.client) {
      filter.client = req.query.client
    }

    const sort = req.query.sort || 'createdAt'

    const [projects, totalItems] = await Promise.all([
      Project.find(filter).populate('client', 'name cif').sort(sort).skip(skip).limit(limit),
      Project.countDocuments(filter)
    ])

    res.status(200).json({
      projects,
      currentPage: page,
      totalPages:  Math.ceil(totalItems / limit),
      totalItems
    })
  } catch (error) {
    next(error)
  }
}

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const project = await Project.findOne({ _id: id, company: user.company, deleted: false })
      .populate('client', 'name cif email')

    if (!project) throw AppError.notFound('Proyecto no encontrado')

    res.status(200).json({ project })
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    const isSoftDelete = req.query.soft === 'true'

    const project = await Project.findOne({ _id: id, company: user.company, deleted: false })
    if (!project) throw AppError.notFound('Proyecto no encontrado')

    if (isSoftDelete) {
      await Project.findByIdAndUpdate(id, { deleted: true })
    } else {
      await Project.findByIdAndDelete(id)
    }

    res.status(200).json({ message: `Proyecto eliminado (${isSoftDelete ? 'soft' : 'hard'})` })
  } catch (error) {
    next(error)
  }
}

export const getArchivedProjects = async (req, res, next) => {
  try {
    const user = req.user

    const projects = await Project.find({ company: user.company, deleted: true })
      .populate('client', 'name cif')

    res.status(200).json({ projects })
  } catch (error) {
    next(error)
  }
}

export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const project = await Project.findOne({ _id: id, company: user.company, deleted: true })
    if (!project) throw AppError.notFound('Proyecto archivado no encontrado')

    await Project.findByIdAndUpdate(id, { deleted: false })

    res.status(200).json({ message: 'Proyecto restaurado correctamente' })
  } catch (error) {
    next(error)
  }
}