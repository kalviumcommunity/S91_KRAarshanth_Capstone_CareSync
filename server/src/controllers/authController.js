import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';
import { InvalidGoogleCredentialError, verifyGoogleCredential } from '../utils/googleAuth.js';

const roles = ['super_admin', 'hospital_admin', 'department_manager', 'doctor', 'nurse'];
function sign(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new ApiError(500, 'Server JWT configuration is invalid');
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d', algorithm: 'HS256' });
}
function safe(user) { return { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active }; }

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'An account with this email already exists');
  // Public self-registration must never trust a client-provided role.
  const user = await User.create({ name, email, password, role: 'nurse' });
  res.status(201).json({ success: true, message: 'Account created with nurse permissions; an administrator can update the role.', token: sign(user), user: safe(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.active || !user.password || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  res.json({ success: true, message: 'Login successful', token: sign(user), user: safe(user) });
});

export const googleLogin = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) throw new ApiError(500, 'Google authentication is not configured');

  let profile;
  try {
    profile = await verifyGoogleCredential(req.body.credential);
  } catch (error) {
    if (error instanceof InvalidGoogleCredentialError) throw new ApiError(401, 'Invalid Google credential');
    throw error;
  }

  if (!profile?.sub || !profile.email || profile.email_verified !== true) {
    throw new ApiError(401, 'Google account must have a verified email address');
  }

  const email = profile.email.toLowerCase();
  let user = await User.findOne({ googleId: profile.sub });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      if (!user.active) throw new ApiError(401, 'Invalid Google credential');
      if (user.googleId && user.googleId !== profile.sub) {
        throw new ApiError(409, 'This email is already linked to a different Google account.');
      }

      user.googleId = profile.sub;
      await user.save();
    } else {
      const name = (typeof profile.name === 'string' ? profile.name : 'Google User').trim().slice(0, 80) || 'Google User';
      user = await User.create({ name, email, googleId: profile.sub, role: 'nurse' });
    }
  }

  if (!user.active) throw new ApiError(401, 'Invalid Google credential');
  res.json({ success: true, message: 'Google sign-in successful', token: sign(user), user: safe(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: safe(req.user) }));

export const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!roles.includes(role)) throw new ApiError(400, 'Invalid role');
  if (req.user.role !== 'super_admin' && ['super_admin', 'hospital_admin'].includes(role)) {
    throw new ApiError(403, 'Only a super admin can assign super admin or hospital admin roles');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = role;
  await user.save();
  res.json({ success: true, message: 'User role updated', user: safe(user) });
});
