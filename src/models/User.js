// src/models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name:     { type: String, trim: true },
    lastName: { type: String, trim: true },
    nif:      { type: String, trim: true },
    role:     { type: String, enum: ['admin', 'guest'], default: 'admin' },
    status:   { type: String, enum: ['pending', 'verified'], default: 'pending' },
    verificationCode:     { type: String },
    verificationAttempts: { type: Number, default: 3 },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    address: {
      street:   { type: String, trim: true },
      number:   { type: String, trim: true },
      postal:   { type: String, trim: true },
      city:     { type: String, trim: true },
      province: { type: String, trim: true }
    },
    deleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }  
  }
)

userSchema.virtual('fullName').get(function () {
  return `${this.name ?? ''} ${this.lastName ?? ''}`.trim()
})

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ company: 1 })
userSchema.index({ status: 1 })
userSchema.index({ role: 1 })

export default mongoose.model('User', userSchema)