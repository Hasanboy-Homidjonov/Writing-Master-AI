import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8676643528:AAEsgk_CWjGEp3JNjMABakJbvZnVta_wPrs';
const BOT_USERNAME = process.env.VITE_TELEGRAM_BOT_USERNAME || 'Write_English_bot';
const ADMIN_USERNAMES = (process.env.ADMIN_TELEGRAM_USERNAMES || 'KhomidjonovH,Khomidjonov_H,Hasanboy')
  .toLowerCase()
  .split(',')
  .map((u) => u.trim().replace(/^@/, ''));

function getSiteUrl() {
  const envVal = process.env.WEBAPP_URL || process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;
  if (envVal && !envVal.includes('localhost') && !envVal.includes('127.0.0.1')) {
    let clean = envVal.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, '');
  }
  return (process.env.SITE_URL || 'https://writing-master-ai.onrender.com').replace(/\/+$/, '');
}

const SITE_URL = getSiteUrl();
const DB_PATH = path.join(__dirname, 'users.json');
const SESSIONS_PATH = path.join(__dirname, 'telegram_sessions.json');

// Persistent auth sessions (survives server restarts)
function readSessions() {
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.error('Error reading telegram sessions:', e);
  }
  return new Map();
}

function saveSessions(map) {
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving telegram sessions:', e);
  }
}

const activeSessions = readSessions();

function cleanOldSessions() {
  const now = Date.now();
  let changed = false;
  for (const [code, session] of activeSessions.entries()) {
    if (now - session.createdAt > 30 * 60 * 1000) {
      activeSessions.delete(code);
      changed = true;
    }
  }
  if (changed) saveSessions(activeSessions);
}

setInterval(cleanOldSessions, 60000);

export function createAuthSession() {
  cleanOldSessions();
  const code = 'auth_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
  activeSessions.set(code, {
    code,
    status: 'pending', // 'pending' | 'confirmed' | 'rejected'
    user: null,
    sessionToken: null,
    createdAt: Date.now()
  });
  saveSessions(activeSessions);

  return {
    code,
    botUsername: BOT_USERNAME,
    deepLink: `https://t.me/${BOT_USERNAME}?start=${code}`
  };
}

export function getAuthSessionStatus(code) {
  if (!code) return { status: 'invalid' };

  // bot.py va server o'rtasida sessiyalarni to'liq sinxronlashtirish
  const diskSessions = readSessions();
  let session = diskSessions.get(code) || activeSessions.get(code);

  const latest = diskSessions.get('latest');
  if ((!session || session.status === 'pending') && latest && latest.status === 'confirmed') {
    const confirmedAt = latest.confirmedAt || (latest.createdAt ? latest.createdAt / 1000 : 0);
    if (Date.now() / 1000 - confirmedAt < 45) {
      session = latest;
    }
  }

  if (!session) return { status: 'not_found' };

  // Xavfsizlik: Bir martalik foydalanish (Logout dan so'ng qayta kirishning oldini oladi)
  if (session.status === 'confirmed') {
    const user = session.user;
    session.status = 'consumed';
    diskSessions.delete('latest');
    saveSessions(diskSessions);
    activeSessions.set(code, session);
    return {
      status: 'confirmed',
      user,
      sessionToken: session.sessionToken
    };
  }

  return {
    status: session.status,
    user: session.user,
    sessionToken: session.sessionToken
  };
}

function readUsers() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading users:', e);
  }
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export function processConfirmedUser(from) {
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Hasanboy';
  const username = from.username || '';
  const isAdmin =
    ADMIN_USERNAMES.includes(username.toLowerCase()) ||
    name.toLowerCase().includes('hasanboy') ||
    from.id === 8676643528;

  const users = readUsers();
  let user = users.find((u) => u.telegramId === from.id || (u.telegramUsername && u.telegramUsername === username));

  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  if (!user) {
    user = {
      id: 'usr_tg_' + from.id,
      telegramId: from.id,
      telegramUsername: username,
      name,
      email: username ? `${username.toLowerCase()}@telegram.user` : `tg_${from.id}@writingmaster.app`,
      avatar,
      level: isAdmin ? 'C1' : 'B1',
      coins: isAdmin ? 2500 : 150,
      completedEssays: isAdmin ? 40 : 0,
      streakDays: 1,
      rank: isAdmin ? 1 : users.length + 1,
      joinedAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString(),
      role: isAdmin ? 'admin' : 'user',
      isAuthenticated: true
    };
    users.push(user);
  } else {
    user.name = name;
    user.telegramUsername = username;
    user.lastLoginAt = new Date().toISOString();
    user.role = isAdmin ? 'admin' : user.role || 'user';
    user.isAuthenticated = true;
  }

  saveUsers(users);

  const sessionToken = Buffer.from(
    JSON.stringify({
      userId: user.id,
      telegramId: from.id,
      name: user.name,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
    })
  ).toString('base64');

  return { user, sessionToken };
}

// Telegram Bot API helper
async function tgApi(method, body = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error on ${method}:`, err.message);
    return null;
  }
}

// Polling daemon
let isPollingStarted = false;
let updateOffset = 0;

export async function startTelegramBotPolling() {
  console.log(`ℹ️ Telegram Bot polling is managed solely by bot.py in Python.`);
  return;
}

async function handleUpdate(update) {
  try {
    // 1. User sent a Message
    if (update.message) {
      const msg = update.message;
      const text = (msg.text || '').trim();
      const chatId = msg.chat.id;
      const from = msg.from;
      const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Hasanboy';

      // 1.1 /start command
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const param = parts[1] || '';

        // If user arrived with an Auth Code (/start auth_xxxx)
        if (param.startsWith('auth_')) {
          // ALWAYS ACCEPT IT! Never say "eskirgan yoki topilmadi"
          if (!activeSessions.has(param)) {
            activeSessions.set(param, {
              code: param,
              status: 'pending',
              user: null,
              sessionToken: null,
              createdAt: Date.now()
            });
            saveSessions(activeSessions);
          }

          await tgApi('sendMessage', {
            chat_id: chatId,
            text: `🔐 <b>Writing Master platformasiga kirish so'rovi!</b>\n\nAssalomu alaykum, <b>${name}</b>!\nSaytga ushbu Telegram hisobingiz orqali kirishni tasdiqlaysizmi?`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Ha, kiraman', callback_data: `confirm_${param}` },
                  { text: '❌ Yo\'q, bekor qilish', callback_data: `reject_${param}` }
                ]
              ]
            }
          });
          return;
        }

        // Normal /start message (No auth param)
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `Assalomu alaykum, <b>${name}</b>! 👋\n\n🎨 <b>WriteMaster AI</b> — ingliz tilida yozishni bosqichma-bosqich o'zlashtirish platformasi.\n\n✍️ Har bir mavzu uchun sun'iy intellekt 5 mezon bo'yicha baho beradi.\n🏆 90% dan yuqori ball — keyingi mavzu ochiladi.\n🪙 To'plangan WriteCoinlar reytingda o'rningizni belgilaydi.\n\nBoshlash uchun quyidagi tugmani bosing 👇`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Saytga kirish', url: SITE_URL }],
              [
                { text: '📚 Yordam', callback_data: 'help_menu' },
                { text: "👨‍💻 Admin bilan bog'lanish", callback_data: 'admin_contact' }
              ]
            ]
          }
        });
        return;
      }

      // 1.2 /help command
      if (text.startsWith('/help') || text.toLowerCase() === 'yordam' || text.includes('📚 Yordam')) {
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `📚 <b>WriteMaster AI — To'liq Qoidalar va Yordam</b>\n\n` +
            `🟣 <b>1. 90% Qoidasi</b>\nHar bir mavzu ketma-ket ochiladi. Keyingisiga o'tish uchun oldingi mavzuda kamida 90% (23/25 ball) to'plang.\n\n` +
            `🟢 <b>2. Nazorat ostidagi imtihon (Anti-Cheat)</b>\nImtihon faqat to'liq ekranda o'tadi. Oynani almashtirish, nusxalash yoki matn qo'yish taqiqlangan — 3 ta ogohlantirish urinishni bekor qiladi.\n\n` +
            `🔵 <b>3. CEFR Darajalari</b>\nYozishdan oldin darajangizni (A1–C1) tanlaysiz; imtihon boshlangach u qulflanadi.\n\n` +
            `🟡 <b>4. WriteCoinlar va Reyting</b>\nMuvaffaqiyatli topshiriq uchun 50 coin, mukammal natija uchun qo'shimcha 100 coin beriladi.\n\n` +
            `🤖 <b>5. 5D AI Baholash Mezonlari:</b>\n` +
            `• <b>Task Achievement:</b> Mavzuning to'liq yoritilishi\n` +
            `• <b>Coherence & Cohesion:</b> Mantiq va jumlalar bog'liqligi\n` +
            `• <b>Lexical Resource:</b> Akademik va boy so'z boyligi\n` +
            `• <b>Grammatical Range:</b> Murakkab grammatik tuzilmalar\n` +
            `• <b>Accuracy:</b> Imlo, tinish belgilari va xatosiz yozish`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Saytga kirish', url: SITE_URL }],
              [{ text: "👨‍💻 Admin bilan bog'lanish", callback_data: 'admin_contact' }]
            ]
          }
        });
        return;
      }

      // 1.3 /admin command
      if (text.startsWith('/admin') || text.toLowerCase().includes('admin')) {
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `👨‍💻 <b>Admin va Dasturchi bilan bog'lanish</b>\n\n` +
            `• <b>Dasturchi:</b> Hasanboy Homidjonov\n` +
            `• <b>Asosiy Telegram:</b> @KhomidjonovH\n` +
            `• <b>Qo'shimcha Telegram:</b> @Khomidjonov_H\n\n` +
            `Savol, taklif yoki texnik muammo bo'lsa — quyidagi tugmalardan to'g'ridan-to'g'ri yozing.\n\n` +
            `© 2026 WriteMaster AI. Barcha huquqlar himoyalangan.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💬 Telegram: @KhomidjonovH', url: 'https://t.me/KhomidjonovH' }],
              [{ text: '💬 Telegram: @Khomidjonov_H', url: 'https://t.me/Khomidjonov_H' }],
              [{ text: '🚀 Saytga kirish', url: SITE_URL }]
            ]
          }
        });
        return;
      }

      // 1.4 /login command
      if (text.startsWith('/login') || text.toLowerCase().includes('kirish')) {
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `🔐 <b>Writing Master platformasiga kirish</b>\n\nQuyidagi tugmani bosib to'g'ridan-to'g'ri saytga kiring 👇`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Saytga kirish', url: SITE_URL }]
            ]
          }
        });
        return;
      }

      // Default reply for any other messages
      await tgApi('sendMessage', {
        chat_id: chatId,
        text: `Salom, <b>${name}</b>!\n\nWriting Master botiga xush kelibsiz. Quyidagi menyudan kerakli bo'limni tanlang:`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Saytga kirish', url: SITE_URL }],
            [
              { text: '📚 Yordam', callback_data: 'help_menu' },
              { text: "👨‍💻 Admin bilan bog'lanish", callback_data: 'admin_contact' }
            ]
          ]
        }
      });
      return;
    }

    // 2. User clicked an Inline Button (Callback Query)
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data || '';
      const chatId = cb.message.chat.id;
      const messageId = cb.message.message_id;
      const from = cb.from;

      // User confirmed login: "Ha, kiraman"
      if (data.startsWith('confirm_') || data.startsWith('auth_allow:')) {
        const code = data.includes(':') ? data.split(':')[1] : data.replace('confirm_', '');
        let session = activeSessions.get(code);

        if (!session) {
          session = {
            code,
            status: 'pending',
            user: null,
            sessionToken: null,
            createdAt: Date.now()
          };
          activeSessions.set(code, session);
        }

        const { user, sessionToken } = processConfirmedUser(from);
        session.status = 'confirmed';
        session.user = user;
        session.sessionToken = sessionToken;
        session.confirmedAt = Date.now();
        activeSessions.set('latest', session);
        saveSessions(activeSessions);

        await tgApi('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: '✅ Kirish tasdiqlandi!',
          show_alert: false
        });

        const callbackUrl = `${SITE_URL}/auth/callback?session_id=${code}&status=success`;
        await tgApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ <b>Muvaffaqiyatli kirdingiz! Saytga qaytishingiz mumkin.</b>\n\n🎉 Xush kelibsiz, <b>${user.name}</b>!\nProfilingiz tasdiqlandi. Saytga o'tish uchun quyidagi tugmani bosing:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Saytga o'tish (Muvaffaqiyatli)", url: callbackUrl }]
            ]
          }
        });
        return;
      }

      // User rejected login: "Yo'q, bekor qilish"
      if (data.startsWith('reject_') || data.startsWith('auth_deny:')) {
        const code = data.includes(':') ? data.split(':')[1] : data.replace('reject_', '');
        let session = activeSessions.get(code);

        if (session) {
          session.status = 'rejected';
          saveSessions(activeSessions);
        }

        await tgApi('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: '❌ Kirish bekor qilindi',
          show_alert: false
        });

        const callbackUrl = `${SITE_URL}/auth/callback?session_id=${code}&status=rejected`;
        await tgApi('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `🚫 <b>Kirish bekor qilindi.</b>\n\nSaytga kirish so'rovi rad etildi. Saytga qaytish uchun quyidagi tugmani bosing:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Saytga qaytish (Bekor qilindi)", url: callbackUrl }]
            ]
          }
        });
        return;
      }

      // Help menu callback
      if (data === 'help_menu') {
        await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `📚 <b>WriteMaster AI — Yordam</b>\n\n` +
            `🟣 <b>1. 90% qoidasi</b>\nHar bir mavzu ketma-ket ochiladi. Keyingisiga o'tish uchun oldingi mavzuda kamida 90% (23/25 ball) to'plang.\n\n` +
            `🟢 <b>2. Nazorat ostidagi imtihon (Anti-Cheat)</b>\nImtihon faqat to'liq ekranda o'tadi. Oynani almashtirish, nusxalash yoki matn qo'yish taqiqlangan — 3 ta ogohlantirish urinishni bekor qiladi.\n\n` +
            `🔵 <b>3. CEFR darajasi</b>\nYozishdan oldin darajangizni (A1–C1) tanlaysiz; imtihon boshlangach u qulflanadi.\n\n` +
            `🟡 <b>4. WriteCoinlar va Reyting</b>\nMuvaffaqiyatli topshiriq uchun 50 coin, mukammal natija uchun qo'shimcha 100 coin beriladi.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Saytga kirish', url: SITE_URL }],
              [{ text: '⬅️ Orqaga', callback_data: 'back_main' }]
            ]
          }
        });
        return;
      }

      // Admin contact callback
      if (data === 'admin_contact') {
        await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `👨‍💻 <b>Admin bilan bog'lanish</b>\n\n• <b>Dasturchi:</b> Hasanboy Homidjonov\n• <b>Asosiy Telegram:</b> @KhomidjonovH\n• <b>Qo'shimcha Telegram:</b> @Khomidjonov_H\n\nSavol, taklif yoki muammo bo'lsa — quyidagi tugmalardan yozing.\n\n© 2026 WriteMaster AI. Barcha huquqlar himoyalangan.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💬 Telegram: @KhomidjonovH', url: 'https://t.me/KhomidjonovH' }],
              [{ text: '💬 Telegram: @Khomidjonov_H', url: 'https://t.me/Khomidjonov_H' }],
              [{ text: '⬅️ Orqaga', callback_data: 'back_main' }]
            ]
          }
        });
        return;
      }

      // Back to main
      if (data === 'back_main') {
        await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
        await tgApi('sendMessage', {
          chat_id: chatId,
          text: `Bosh menyu 👇`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Saytga kirish', url: SITE_URL }],
              [
                { text: '📚 Yordam', callback_data: 'help_menu' },
                { text: "👨‍💻 Admin bilan bog'lanish", callback_data: 'admin_contact' }
              ]
            ]
          }
        });
        return;
      }
    }
  } catch (err) {
    console.error('Error handling Telegram update:', err);
  }
}
