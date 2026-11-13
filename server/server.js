import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '39484277051-9dudkbhdjiubdt5t21l3r801h9j5gecc.apps.googleusercontent.com';

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || 'hasanboy.azizjonovich@gmail.com'
)
  .toLowerCase()
  .split(',')
  .map((e) => e.trim());

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Xavfsizlik sarlavhalari (Security Headers)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Helper: Foydalanuvchilar bazasini o'qish
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading users.json:', e);
  }
  return [];
}

// Helper: Foydalanuvchilar bazasiga yozish
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing users.json:', e);
  }
}

/**
 * 1. Google OAuth 2.0 (Google Identity Services) Authentication Endpoint
 * POST /api/auth/google
 * Body: { credential }
 */
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Google ID Token (credential) taqdim etilmadi'
    });
  }

  try {
    // Google rasmiy serverlari orqali ID Tokenni tekshirish
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        error: 'Google tokeni yaroqsiz yoki email mavjud emas'
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture =
      payload.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const googleId = payload.sub;
    const isAdmin = ADMIN_EMAILS.includes(email);

    const users = readUsers();
    let user = users.find((u) => u.email && u.email.toLowerCase() === email);

    if (user) {
      user.name = name;
      user.avatar = picture;
      user.googleId = googleId;
      user.lastLoginAt = new Date().toISOString();
      user.isAuthenticated = true;
      if (isAdmin) user.role = 'admin';
    } else {
      user = {
        id: `usr_${Date.now().toString(36)}`,
        googleId,
        name,
        email,
        avatar: picture,
        level: isAdmin ? 'C1' : 'B1',
        coins: isAdmin ? 2500 : 150,
        completedEssays: isAdmin ? 40 : 0,
        streakDays: 1,
        rank: users.length + 1,
        joinedAt: new Date().toISOString().split('T')[0],
        lastLoginAt: new Date().toISOString(),
        role: isAdmin ? 'admin' : 'user',
        isAuthenticated: true
      };
      users.push(user);
    }

    saveUsers(users);

    // Xavfsiz sessiya tokenini yaratish
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      googleId,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000
    };
    const sessionToken = Buffer.from(JSON.stringify(tokenPayload)).toString(
      'base64url'
    );

    return res.status(200).json({
      success: true,
      user,
      sessionToken
    });
  } catch (err) {
    console.error('Google token verification error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Google tokeni tasdiqlanmadi: ' + err.message
    });
  }
});

/**
 * 2. Chiqish (Logout) endpoint
 * POST /api/auth/logout
 */
app.all('/api/auth/logout', (req, res) => {
  return res.status(200).json({ success: true, message: 'Muvaffaqiyatli chiqildi' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Writing Master Google Auth Server',
    time: new Date().toISOString()
  });
});

// Production rejimida Frontend (dist) fayllarini tarqatish
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Writing Master Google Auth Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Google Client ID: ${GOOGLE_CLIENT_ID}`);
});
