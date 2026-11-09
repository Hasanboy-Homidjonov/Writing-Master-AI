import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createAuthSession,
  getAuthSessionStatus,
  processConfirmedUser
} from './telegramAuthService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * 1. Yangi Telegram login sessiyasini yaratish
 * POST /api/auth/telegram/create-session
 */
app.post('/api/auth/telegram/create-session', (req, res) => {
  try {
    const sessionData = createAuthSession();
    return res.status(200).json({
      success: true,
      ...sessionData
    });
  } catch (err) {
    console.error('Error creating telegram session:', err);
    return res.status(500).json({ success: false, error: 'Server xatoligi' });
  }
});

/**
 * 2. Telegram tasdiqlash holatini tekshirish
 * GET /api/auth/telegram/status?code=...
 */
app.get('/api/auth/telegram/status', (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'code talab qilinadi' });
  }

  const result = getAuthSessionStatus(code);
  return res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * 3. Telegram WebApp orqali to'g'ridan-to'g'ri kirish
 * POST /api/auth/telegram/webapp
 */
app.post('/api/auth/telegram/webapp', (req, res) => {
  const { tgUser } = req.body;
  if (!tgUser || !tgUser.id) {
    return res.status(400).json({ success: false, error: 'tgUser talab qilinadi' });
  }

  try {
    const { user, sessionToken } = processConfirmedUser(tgUser);
    return res.status(200).json({
      success: true,
      user,
      sessionToken
    });
  } catch (err) {
    console.error('Error in telegram webapp auth:', err);
    return res.status(500).json({ success: false, error: 'Autentifikatsiyada xatolik' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Writing Master Production Server',
    time: new Date().toISOString()
  });
});

// Production rejimida Frontend (dist) fayllarini tarqatish
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Writing Master Server running on port ${PORT}`);
});
