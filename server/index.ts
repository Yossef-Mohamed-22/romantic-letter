import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Database } from './db.ts';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-romantic-key-2026-luxury-wine';

const db = Database.getInstance();

// Setup upload directories
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const MUSIC_DIR = path.join(UPLOADS_DIR, 'music');

[UPLOADS_DIR, IMAGES_DIR, MUSIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer Storage Configuration
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

const musicStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MUSIC_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `music-${uniqueSuffix}${ext}`);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('الملف المرفوع يجب أن يكون صورة فقط'));
    }
  },
});

const uploadMusic = multer({
  storage: musicStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('الملف المرفوع يجب أن يكون ملفاً صوتياً (MP3/WAV/OGG)'));
    }
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Serve production frontend if dist exists
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}


// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: { email: string };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح بالدخول' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
  }
}

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = db.getAdmin();

  if (email !== admin.email || !db.verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const token = jwt.sign({ email: admin.email, id: admin.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: 'مدير الرسائل السرية',
    },
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// ----------------- PUBLIC RECIPIENT ROUTES -----------------

// 1. Get public envelope info (safe: no message or secret password exposed)
app.get('/api/letters/:id/public', (req: Request, res: Response) => {
  const letter = db.getLetterById(req.params.id);
  if (!letter) {
    return res.status(404).json({ error: 'لم يتم العثور على هذه الرسالة' });
  }

  res.json({
    id: letter.id,
    title: letter.title,
    design_settings: letter.design_settings,
    music_enabled: letter.music_enabled,
    music_url: letter.music_url,
  });
});

// 2. Unlock letter by clicking (instant direct access to letter)
app.post('/api/letters/:id/unlock', (req: Request, res: Response) => {
  const { id } = req.params;
  const letter = db.getLetterById(id);
  if (!letter) {
    return res.status(404).json({ error: 'الرسالة غير متوفرة' });
  }

  const memories = db.getMemoriesForLetter(id);

  return res.json({
    success: true,
    letter: {
      id: letter.id,
      recipient_name: letter.recipient_name,
      title: letter.title,
      message: letter.message,
      closing_message: letter.closing_message,
      design_settings: letter.design_settings,
      music_enabled: letter.music_enabled,
      music_url: letter.music_url,
      memories,
    },
  });
});

// ----------------- ADMIN DASHBOARD ROUTES -----------------

// List all letters
app.get('/api/letters', requireAuth, (_req: Request, res: Response) => {
  const letters = db.getAllLetters();
  res.json(letters);
});

// Create new letter
app.post('/api/letters', requireAuth, (req: Request, res: Response) => {
  const { recipient_name, title, message, closing_message, secret_password, music_enabled, music_url, design_settings } = req.body;

  if (!recipient_name || !message || !secret_password) {
    return res.status(400).json({ error: 'يرجى تعبئة كافة الحقول المطلوبة (اسم المستلم، الرسالة، والكلمة السرية)' });
  }

  const created = db.createLetter({
    recipient_name,
    title,
    message,
    closing_message,
    secret_password,
    music_enabled,
    music_url,
    design_settings,
  });

  res.status(201).json(created);
});

// Update existing letter
app.put('/api/letters/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateLetter(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'الرسالة غير موجودة' });
  }
  const memories = db.getMemoriesForLetter(id);
  res.json({ ...updated, memories });
});

// Delete letter
app.delete('/api/letters/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteLetter(id);
  if (!deleted) {
    return res.status(404).json({ error: 'الرسالة غير موجودة' });
  }
  res.json({ success: true });
});

// Update memories for a letter
app.post('/api/letters/:id/memories', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { memories } = req.body;

  if (!Array.isArray(memories)) {
    return res.status(400).json({ error: 'صيغة الذكريات غير صحيحة' });
  }

  const updatedMemories = db.setMemoriesForLetter(id, memories);
  res.json(updatedMemories);
});

// Upload image file
app.post('/api/upload/image', requireAuth, uploadImage.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم استلام أي صورة' });
  }
  const fileUrl = `/uploads/images/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Upload music file
app.post('/api/upload/music', requireAuth, uploadMusic.single('music'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم استلام أي ملف صوتي' });
  }
  const fileUrl = `/uploads/music/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// SPA Fallback for any client route
app.get('*', (_req: Request, res: Response) => {
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('Romantic Secret Letter API is running. Run "npm run build" or "npm run dev".');
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Romantic Secret Letter Server running on http://localhost:${PORT}`);
});
