import { randomUUID } from 'node:crypto';
import { mkdir, open, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import Patient from '../models/Patient.js';
import PatientFile from '../models/PatientFile.js';
import { ApiError, asyncHandler } from '../utils/apiError.js';

const maxFileSize = 5 * 1024 * 1024;
const uploadDirectory = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : fileURLToPath(new URL('../../uploads/', import.meta.url));
const allowedTypes = {
  '.pdf': { mimeType: 'application/pdf', signature: (header) => header.toString('ascii', 0, 5) === '%PDF-' },
  '.jpg': { mimeType: 'image/jpeg', signature: (header) => header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff },
  '.jpeg': { mimeType: 'image/jpeg', signature: (header) => header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff },
  '.png': { mimeType: 'image/png', signature: (header) => header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
};

const storage = multer.diskStorage({
  destination(req, file, callback) {
    mkdir(uploadDirectory, { recursive: true }).then(
      () => callback(null, uploadDirectory),
      callback,
    );
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const receiveUpload = multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[extension] || allowedTypes[extension].mimeType !== file.mimetype) {
      callback(new ApiError(400, 'Only PDF, JPEG, and PNG files are supported'));
      return;
    }
    callback(null, true);
  },
}).single('file');

export const requirePatient = asyncHandler(async (req, res, next) => {
  if (!(await Patient.exists({ _id: req.params.patientId }))) {
    throw new ApiError(404, 'Patient not found');
  }
  next();
});

export function acceptPatientUpload(req, res, next) {
  receiveUpload(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return next(new ApiError(tooLarge ? 413 : 400, tooLarge ? 'File exceeds the 5 MB limit' : 'Upload must contain one file'));
    }
    return next(error);
  });
}

function safeOriginalName(originalName) {
  const basename = path.basename(originalName.replace(/\\/g, '/'));
  return basename.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120) || 'upload';
}

async function removeStoredFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

export const uploadPatientFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose a file to upload');

  try {
    const extension = path.extname(req.file.originalname).toLowerCase();
    const type = allowedTypes[extension];
    const handle = await open(req.file.path, 'r');
    let header;
    try {
      header = Buffer.alloc(8);
      const { bytesRead } = await handle.read(header, 0, header.length, 0);
      header = header.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }

    if (!type.signature(header)) throw new ApiError(400, 'File content does not match its declared type');

    const file = await PatientFile.create({
      patientId: req.params.patientId,
      uploadedBy: req.user._id,
      originalName: safeOriginalName(req.file.originalname),
      storageName: req.file.filename,
      mimeType: type.mimeType,
      size: req.file.size,
    });

    res.status(201).json({ success: true, message: 'File uploaded', data: file });
  } catch (error) {
    await removeStoredFile(req.file.path);
    throw error;
  }
});

export const listPatientFiles = asyncHandler(async (req, res) => {
  const files = await PatientFile.find({ patientId: req.params.patientId })
    .select('originalName mimeType size uploadedBy createdAt')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: files });
});

export const downloadPatientFile = asyncHandler(async (req, res, next) => {
  const file = await PatientFile.findOne({ _id: req.params.fileId, patientId: req.params.patientId });
  if (!file) throw new ApiError(404, 'File not found');

  const filePath = path.join(uploadDirectory, file.storageName);
  try {
    await stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') throw new ApiError(404, 'Stored file is unavailable');
    throw error;
  }

  res.download(filePath, file.originalName, { headers: { 'Content-Type': file.mimeType } }, (error) => {
    if (!error) return;
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    next(error);
  });
});
