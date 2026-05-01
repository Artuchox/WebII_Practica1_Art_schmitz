// src/models/Project.js
import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    client:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    name:        { type: String },
    projectCode: { type: String },
    address: {
      street:   { type: String },
      number:   { type: String },
      postal:   { type: String },
      city:     { type: String },
      province: { type: String }
    },
    email:   { type: String },
    notes:   { type: String },
    active:  { type: Boolean, default: true },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default mongoose.model('Project', projectSchema)