import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, minlength: 8, select: false },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['super_admin', 'hospital_admin', 'department_manager', 'doctor', 'nurse'], default: 'nurse' },
  active: { type: Boolean, default: true },
}, { timestamps: true, strict: 'throw' });

userSchema.pre('validate', function requireAuthenticationMethod() {
  if (this.isNew && !this.password && !this.googleId) {
    this.invalidate('password', 'A password or Google identity is required');
  }
});

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function comparePassword(password) {
  return this.password ? bcrypt.compare(password, this.password) : false;
};
export default mongoose.model('User', userSchema);
