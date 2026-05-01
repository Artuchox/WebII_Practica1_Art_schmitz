// src/models/DeliveryNote.js
import mongoose from 'mongoose'

const deliveryNoteSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    client:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

    format:      { type: String, enum: ['material', 'hours'] },
    description: { type: String },
    workDate:    { type: Date },

    material: { type: String },
    quantity: { type: Number },
    unit:     { type: String },

    hours: { type: Number },
    workers: [
      {
        name:  { type: String },
        hours: { type: Number }
      }
    ],

    signed:       { type: Boolean, default: false },
    signedAt:     { type: Date },
    signatureUrl: { type: String },
    pdfUrl:       { type: String },

    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default mongoose.model('DeliveryNote', deliveryNoteSchema)