// src/models/Client.js
import mongoose from 'mongoose'
 
const clientSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name:    { type: String },
    cif:     { type: String },
    email:   { type: String },
    phone:   { type: String },
    address: {
      street:   { type: String },
      number:   { type: String },
      postal:   { type: String },
      city:     { type: String },
      province: { type: String }
    },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)
 
export default mongoose.model('Client', clientSchema)