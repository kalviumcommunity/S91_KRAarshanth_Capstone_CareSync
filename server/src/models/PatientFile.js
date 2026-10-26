import mongoose from 'mongoose';

const patientFileSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true, trim: true, maxlength: 120 },
  storageName: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true, enum: ['application/pdf', 'image/jpeg', 'image/png'] },
  size: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
}, { timestamps: true });

export default mongoose.model('PatientFile', patientFileSchema);
