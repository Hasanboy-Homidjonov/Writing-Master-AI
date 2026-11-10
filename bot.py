#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Writing Master AI - Telegram Authentication Bot & Local Auth Server
Python 3 standarti (Tashqi kutubxonalar talab etilmaydi)
Muallif: Hasanboy Homidjonov
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import time
import os
import sys
import base64
import threading
import ssl
from http.server import HTTPServer, BaseHTTPRequestHandler

# SSL sertifikat tekshiruvini Windows/MSYS2 da xatosiz ishlashini ta'minlash
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

SSL_CTX = None
try:
    SSL_CTX = ssl._create_unverified_context()
except Exception:
    pass

# Windows konsolida UTF-8 emoji xatosini oldini olish
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BOT_TOKEN = "8676643528:AAEsgk_CWjGEp3JNjMABakJbvZnVta_wPrs"
BOT_USERNAME = "Write_English_bot"
API_BASE = f"https://api.telegram.org/bot{BOT_TOKEN}"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(SCRIPT_DIR, "server", "users.json")
SESSIONS_FILE = os.path.join(SCRIPT_DIR, "server", "telegram_sessions.json")

def get_site_url():
    # 1. Cloud environment variables (Render avtomatik beradigan RENDER_EXTERNAL_URL yoki WEBAPP_URL / SITE_URL)
    for env_key in ("WEBAPP_URL", "SITE_URL", "RENDER_EXTERNAL_URL", "RAILWAY_PUBLIC_DOMAIN", "PUBLIC_URL"):
        val = (os.environ.get(env_key) or "").strip()
        if val and "localhost" not in val and "127.0.0.1" not in val:
            if not val.startswith("http://") and not val.startswith("https://"):
                val = f"https://{val}"
            return val.rstrip("/")

    # 2. .env faylidan o'qish (WEBAPP_URL yoki SITE_URL)
    env_file = os.path.join(SCRIPT_DIR, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    stripped = line.strip()
                    for prefix in ("WEBAPP_URL=", "SITE_URL="):
                        if stripped.startswith(prefix):
                            val = stripped.split("=", 1)[1].strip().strip('"').strip("'")
                            if val and not val.startswith("#") and "localhost" not in val and "127.0.0.1" not in val:
                                if not val.startswith("http://") and not val.startswith("https://"):
                                    val = f"https://{val}"
                                return val.rstrip("/")
        except Exception:
            pass

    # 3. Wi-Fi / Lokal tarmoq IP manzilini aniqlash (faqat lokal offline rejimda ishlaganda)
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        if local_ip and not local_ip.startswith("127."):
            return f"http://{local_ip}:5000"
    except Exception:
        pass

    return "http://localhost:5000"

# In-memory session store
sessions_lock = threading.Lock()
sessions = {}

def load_sessions():
    global sessions
    try:
        if os.path.exists(SESSIONS_FILE):
            with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                sessions = json.load(f)
    except Exception as e:
        sessions = {}

def save_sessions():
    try:
        os.makedirs(os.path.dirname(SESSIONS_FILE), exist_ok=True)
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(sessions, f, ensure_ascii=False, indent=2)
    except Exception as e:
        pass

def save_user_profile(user_data):
    try:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        users = []
        if os.path.exists(USERS_FILE):
            try:
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    users = json.load(f)
            except Exception:
                users = []

        existing = False
        for u in users:
            if u.get("telegramId") == user_data.get("telegramId"):
                u.update(user_data)
                existing = True
                break

        if not existing:
            users.append(user_data)

        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Save User Error]: {e}", file=sys.stderr)

# Telegram Bot API chaqiruvlari
def tg_api(method, data=None):
    url = f"{API_BASE}/{method}"
    try:
        if data is not None:
            post_data = json.dumps(data).encode("utf-8")
            req = urllib.request.Request(
                url, data=post_data, headers={"Content-Type": "application/json"}
            )
        else:
            req = urllib.request.Request(url)

        kwargs = {"timeout": 30}
        if SSL_CTX is not None:
            kwargs["context"] = SSL_CTX

        with urllib.request.urlopen(req, **kwargs) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 409:
            print("⚠️ [409 Conflict] Boshqa bot jarayoni to'xtatildi, qayta ulanmoqda...", file=sys.stderr)
            time.sleep(2)
        else:
            print(f"[Telegram HTTP Error] {method}: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[Telegram API Error] {method}: {e}", file=sys.stderr)
        return None

# Local HTTP Server for real-time frontend polling (Port 5000)
class AuthHTTPHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ('/api/auth/telegram/create-session', '/create-session'):
            code = 'auth_' + base64.b32encode(os.urandom(5)).decode('ascii').lower()[:8]
            deep_link = f"https://t.me/{BOT_USERNAME}?start={code}"
            
            with sessions_lock:
                sessions[code] = {
                    "code": code,
                    "status": "pending",
                    "user": None,
                    "createdAt": time.time()
                }
                save_sessions()

            response = {
                "success": True,
                "code": code,
                "botUsername": BOT_USERNAME,
                "deepLink": deep_link
            }
            body = json.dumps(response).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Chiqish (Logout) endpoint - barcha faol avto-kirishlarni to'liq bekor qilish
        if parsed.path in ('/api/auth/logout', '/logout'):
            code = ''
            try:
                length = int(self.headers.get('Content-Length', 0))
                if length > 0:
                    payload = json.loads(self.rfile.read(length).decode('utf-8'))
                    code = payload.get('code', '')
            except Exception:
                pass

            with sessions_lock:
                if code and code in sessions:
                    sessions[code]['status'] = 'logged_out'
                # Latest tasdiqni butunlay tozalash (qaytadan avtomatik kirib ketmasligi uchun)
                sessions['latest'] = None
                save_sessions()

            body = json.dumps({"success": True, "message": "Muvaffaqiyatli chiqildi"}).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)

        # Chiqish (GET orqali ham ishlashi uchun)
        if parsed.path in ('/api/auth/logout', '/logout'):
            code = (qs.get('code') or [''])[0]
            with sessions_lock:
                if code and code in sessions:
                    sessions[code]['status'] = 'logged_out'
                sessions['latest'] = None
                save_sessions()

            body = json.dumps({"success": True, "message": "Muvaffaqiyatli chiqildi"}).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Render & Production /auth/callback redirect handler
        if parsed.path in ('/auth/callback', '/auth/callback/'):
            session_id = (qs.get('session_id') or qs.get('code') or [''])[0]
            status = (qs.get('status') or ['success'])[0]
            self.send_response(302)
            self._send_cors()
            self.send_header('Location', f"/#auth={session_id}&status={status}")
            self.end_headers()
            return

        if parsed.path in ('/api/auth/telegram/status', '/status'):
            code = (qs.get('code') or [''])[0]
            with sessions_lock:
                session = sessions.get(code)
                # Agar ushbu sessiya hali tasdiqlanmagan bo'lsa, eng so'nggi tasdiqlangan sessiyani tekshirish
                latest = sessions.get('latest')
                if (not session or session.get('status') == 'pending') and latest:
                    if latest.get('status') == 'confirmed':
                        confirmed_at = latest.get('confirmedAt', 0)
                        if time.time() - confirmed_at < 45:
                            session = latest

                # XAVFSIZLIK: Bir martalik foydalanish (One-time Use)
                # Foydalanuvchi bir marta tizimga kirganidan so'ng sessiya 'consumed' qilinadi.
                # Shu tariqa 'Chiqish' qilingandan so'ng qayta avto-kirish butunlay imkonsiz bo'ladi!
                if session and session.get('status') == 'confirmed':
                    session_user = session.get("user")
                    session['status'] = 'consumed'
                    sessions['latest'] = None
                    save_sessions()
                    response = {
                        "success": True,
                        "status": "confirmed",
                        "user": session_user
                    }
                else:
                    response = {
                        "success": True,
                        "status": session.get("status", "pending") if session else "pending"
                    }

            body = json.dumps(response).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if parsed.path in ('/api/auth/telegram/create-session', '/create-session'):
            code = 'auth_' + base64.b32encode(os.urandom(5)).decode('ascii').lower()[:8]
            deep_link = f"https://t.me/{BOT_USERNAME}?start={code}"
            with sessions_lock:
                sessions[code] = {
                    "code": code,
                    "status": "pending",
                    "user": None,
                    "createdAt": time.time()
                }
                save_sessions()
            response = {
                "success": True,
                "code": code,
                "botUsername": BOT_USERNAME,
                "deepLink": deep_link
            }
            body = json.dumps(response).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if parsed.path in ('/api/health', '/health'):
            body = json.dumps({"status": "ok", "service": "Writing Master Bot Auth Server"}).encode('utf-8')
            self.send_response(200)
            self._send_cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # =====================================================================
        # STATIC FRONTEND FILE SERVING (Xavfsiz va Path-Traversal'dan himoyalangan)
        # =====================================================================
        req_path = parsed.path.lstrip('/')
        if not req_path or req_path == '.':
            req_path = 'index.html'

        clean_path = os.path.normpath(req_path)

        # XAVFSIZLIK: Directory Traversal (../..) hujumlarini to'xtatish
        if clean_path.startswith('..') or '..' in clean_path.split(os.sep):
            self.send_response(403)
            self._send_cors()
            self.end_headers()
            self.wfile.write(b"403 Forbidden")
            return

        # XAVFSIZLIK: Yashirin va server fayllarini (.env, .git, *.py, *.json, server/*.json) himoya qilish
        base_name = os.path.basename(clean_path).lower()
        if (
            clean_path.startswith('.env')
            or clean_path.startswith('.git')
            or clean_path.endswith('.py')
            or clean_path.endswith('.json')
            or clean_path.startswith('server')
            or (base_name.startswith('.') and base_name != 'index.html')
        ):
            self.send_response(403)
            self._send_cors()
            self.end_headers()
            self.wfile.write(b"403 Forbidden")
            return

        req_path = clean_path
        if not req_path or req_path == '.':
            req_path = 'index.html'

        dist_dir = os.path.join(SCRIPT_DIR, 'dist')
        file_path = os.path.join(dist_dir, req_path)
        if not os.path.exists(file_path):
            file_path = os.path.join(SCRIPT_DIR, req_path)

        # SPA fallback: agar mavjud bo'lmagan marshrut bo'lsa (#login, #topics), index.html berish
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(dist_dir, 'index.html')
            if not os.path.exists(file_path):
                file_path = os.path.join(SCRIPT_DIR, 'index.html')

        if os.path.exists(file_path) and os.path.isfile(file_path):
            import mimetypes
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                if file_path.endswith('.js') or file_path.endswith('.ts'):
                    content_type = 'application/javascript; charset=utf-8'
                elif file_path.endswith('.css'):
                    content_type = 'text/css; charset=utf-8'
                elif file_path.endswith('.html'):
                    content_type = 'text/html; charset=utf-8'
                elif file_path.endswith('.svg'):
                    content_type = 'image/svg+xml'
                elif file_path.endswith('.json'):
                    content_type = 'application/json; charset=utf-8'
                else:
                    content_type = 'application/octet-stream'

            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self._send_cors()
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                if file_path.endswith('.html'):
                    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                else:
                    self.send_header('Cache-Control', 'public, max-age=31536000')
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception:
                pass

        self.send_response(404)
        self._send_cors()
        self.end_headers()
        self.end_headers()

    def log_message(self, format, *args):
        # Silent HTTP logging to keep console clean
        return

def run_http_server(port=5000):
    try:
        server = HTTPServer(('0.0.0.0', port), AuthHTTPHandler)
        print(f"🌐 Autentifikatsiya serveri faol: port {port} (0.0.0.0)")
        server.serve_forever()
    except Exception as e:
        print(f"[HTTP Server Warning] Port {port} band bo'lishi mumkin: {e}", file=sys.stderr)

# Telegram Bot Xabarlari va Tugmalari (Ko'p tilli / Multilingual)
user_languages = {}

def get_user_lang(from_user):
    user_id = str(from_user.get("id") or "")
    if user_id and user_id in user_languages:
        return user_languages[user_id]
    
    # Telegram klienti sozlamalaridagi til (language_code)
    code = (from_user.get("language_code") or "").lower().strip()
    if code.startswith("ru"):
        return "ru"
    if code.startswith("en"):
        return "en"
    return "uz"

def get_user_display_name(from_user, lang="uz"):
    first_name = (from_user.get("first_name") or "").strip()
    last_name = (from_user.get("last_name") or "").strip()
    full = " ".join(filter(None, [first_name, last_name])).strip()
    if full:
        return full
    if from_user.get("username"):
        return from_user.get("username")
    if lang == "ru":
        return "Пользователь"
    if lang == "en":
        return "User"
    return "Foydalanuvchi"

def get_main_menu_message(name, lang="uz"):
    site_url = get_site_url()
    if lang == "ru":
        text = (
            f"Здравствуйте, <b>{name}</b>! 👋\n\n"
            f"🤖 <b>Добро пожаловать в бот WriteMaster AI!</b>\n"
            f"Чем я могу вам помочь?\n\n"
            f"🎯 <b>Вам доступны следующие возможности:</b>\n"
            f"• ✍️ <b>Написание эссе на английском:</b> Практика по экзаменационным темам\n"
            f"• 🧠 <b>5D AI Анализ:</b> Мгновенная проверка ошибок и начисление баллов\n"
            f"• 📊 <b>Повышение уровня CEFR:</b> Продвижение от A1 до C1\n"
            f"• 🏆 <b>WriteCoin и Рейтинг:</b> Набирайте баллы и поднимайтесь в топе\n\n"
            f"🌐 <b>Чтобы войти на сайт</b>, нажмите кнопку ниже или выберите раздел помощи 👇"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Войти на сайт", "url": site_url}],
                [
                    {"text": "📚 Правила и Помощь (/help)", "callback_data": "help_info"},
                    {"text": "👨‍💻 Связаться с админом (/admin)", "callback_data": "admin_info"}
                ],
                [{"text": "🌐 Сменить язык / Change language (/lang)", "callback_data": "lang_menu"}]
            ]
        }
    elif lang == "en":
        text = (
            f"Hello, <b>{name}</b>! 👋\n\n"
            f"🤖 <b>Welcome to WriteMaster AI Bot!</b>\n"
            f"How can I help you today?\n\n"
            f"🎯 <b>Explore our powerful features:</b>\n"
            f"• ✍️ <b>English Essay Writing:</b> Practice on real exam topics\n"
            f"• 🧠 <b>5D AI Assessment:</b> Instant grading and mistake analysis\n"
            f"• 📊 <b>CEFR Level Progression:</b> Advance from A1 up to C1\n"
            f"• 🏆 <b>WriteCoins & Leaderboard:</b> Earn coins and climb the ranks\n\n"
            f"🌐 <b>To access the platform</b>, tap the button below or choose help 👇"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Open Website", "url": site_url}],
                [
                    {"text": "📚 Rules & Help (/help)", "callback_data": "help_info"},
                    {"text": "👨‍💻 Contact Admin (/admin)", "callback_data": "admin_info"}
                ],
                [{"text": "🌐 Change language / Tilni o'zgartirish (/lang)", "callback_data": "lang_menu"}]
            ]
        }
    else:
        text = (
            f"Assalomu alaykum, <b>{name}</b>! 👋\n\n"
            f"🤖 <b>WriteMaster AI botiga xush kelibsiz!</b>\n"
            f"Sizga qanday yordam bera olaman?\n\n"
            f"🎯 <b>Quyidagi imkoniyatlardan foydalanishingiz mumkin:</b>\n"
            f"• ✍️ <b>Inglizcha insho yozish:</b> Mavzular bo'yicha mustaqil insho yozish\n"
            f"• 🧠 <b>5D Sun'iy Intellekt tahlili:</b> Xatolarni aniqlash va ball olish\n"
            f"• 📊 <b>CEFR Darajasini oshirish:</b> A1 dan C1 gacha ko'tarilish\n"
            f"• 🏆 <b>WriteCoin va Reyting:</b> Ballar yig'ib peshqadamlar safiga kirish\n\n"
            f"🌐 <b>Saytga kirish uchun</b> quyidagi tugmani bosing yoki yordam bo'limini tanlang 👇"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Saytga kirish", "url": site_url}],
                [
                    {"text": "📚 Qoidalar va Yordam (/help)", "callback_data": "help_info"},
                    {"text": "👨‍💻 Admin bilan bog'lanish (/admin)", "callback_data": "admin_info"}
                ],
                [{"text": "🌐 Tilni o'zgartirish / Language / Язык (/lang)", "callback_data": "lang_menu"}]
            ]
        }
    return text, markup

def get_help_message(lang="uz"):
    site_url = get_site_url()
    if lang == "ru":
        text = (
            "📚 <b>WriteMaster AI — Правила и Помощь</b>\n\n"
            "🟣 <b>1. Правило 90%</b>\n"
            "Каждая тема открывается по очереди. Наберите не менее 90% (23/25 баллов) в предыдущей теме для перехода к следующей.\n\n"
            "🟢 <b>2. Контролируемый экзамен (Anti-Cheat)</b>\n"
            "Экзамен проходит в полноэкранном режиме. Переключение вкладок, копирование и вставка текста запрещены — 3 предупреждения отменяют попытку.\n\n"
            "🔵 <b>3. Уровни CEFR</b>\n"
            "Перед началом выберите свой уровень (A1–C1); во время экзамена он блокируется.\n\n"
            "🟡 <b>4. WriteCoins и Рейтинг</b>\n"
            "За выполнение эссе начисляется 50 монет, за максимальный балл — еще 100 монет.\n\n"
            "🤖 <b>5. Критерии 5D AI Оценки:</b>\n"
            "• <b>Task Achievement:</b> Полнота раскрытия темы\n"
            "• <b>Coherence & Cohesion:</b> Логика и связность предложений\n"
            "• <b>Lexical Resource:</b> Академический словарный запас\n"
            "• <b>Grammatical Range:</b> Сложные грамматические конструкции\n"
            "• <b>Accuracy:</b> Грамотность, правописание и пунктуация"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Войти на сайт", "url": site_url}],
                [
                    {"text": "👨‍💻 Админ (/admin)", "callback_data": "admin_info"},
                    {"text": "🏠 Главное меню", "callback_data": "main_menu"}
                ]
            ]
        }
    elif lang == "en":
        text = (
            "📚 <b>WriteMaster AI — Rules & Help Guide</b>\n\n"
            "🟣 <b>1. The 90% Rule</b>\n"
            "Topics unlock sequentially. Score at least 90% (23/25 points) on the current topic to unlock the next.\n\n"
            "🟢 <b>2. Proctored Exam (Anti-Cheat)</b>\n"
            "Exams are conducted in full screen. Tab switching, copying, or pasting is prohibited — 3 warnings will cancel the attempt.\n\n"
            "🔵 <b>3. CEFR Levels</b>\n"
            "Select your target CEFR level (A1–C1) before starting; it locks once the exam begins.\n\n"
            "🟡 <b>4. WriteCoins & Leaderboard</b>\n"
            "Earn 50 coins for passing, and a 100 coin bonus for achieving a perfect score.\n\n"
            "🤖 <b>5. 5D AI Evaluation Criteria:</b>\n"
            "• <b>Task Achievement:</b> Fulfillment of the topic prompt\n"
            "• <b>Coherence & Cohesion:</b> Logical organization and paragraphing\n"
            "• <b>Lexical Resource:</b> Academic and diverse vocabulary\n"
            "• <b>Grammatical Range:</b> Varied and complex sentence structures\n"
            "• <b>Accuracy:</b> Spelling, punctuation, and grammar precision"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Open Website", "url": site_url}],
                [
                    {"text": "👨‍💻 Admin (/admin)", "callback_data": "admin_info"},
                    {"text": "🏠 Main Menu", "callback_data": "main_menu"}
                ]
            ]
        }
    else:
        text = (
            "📚 <b>WriteMaster AI — To'liq Qoidalar va Yordam</b>\n\n"
            "🟣 <b>1. 90% Qoidasi</b>\n"
            "Har bir mavzu ketma-ket ochiladi. Keyingisiga o'tish uchun oldingi mavzuda kamida 90% (23/25 ball) to'plang.\n\n"
            "🟢 <b>2. Nazorat ostidagi imtihon (Anti-Cheat)</b>\n"
            "Imtihon faqat to'liq ekranda o'tadi. Oynani almashtirish, nusxalash yoki boshqa joydan matn qo'yish taqiqlangan — 3 ta ogohlantirish imtihonni bekor qiladi.\n\n"
            "🔵 <b>3. CEFR Darajalari</b>\n"
            "Yozishdan oldin darajangizni (A1–C1) tanlaysiz; imtihon boshlangach u qulflanadi.\n\n"
            "🟡 <b>4. WriteCoinlar va Reyting</b>\n"
            "Muvaffaqiyatli topshiriq uchun 50 coin, mukammal natija uchun qo'shimcha 100 coin beriladi.\n\n"
            "🤖 <b>5. 5D AI Baholash Mezonlari:</b>\n"
            "• <b>Task Achievement:</b> Vazifaning to'liq ochilganligi\n"
            "• <b>Coherence & Cohesion:</b> Mantiq va jumlalar bog'liqligi\n"
            "• <b>Lexical Resource:</b> Akademik va boy so'z boyligi\n"
            "• <b>Grammatical Range:</b> Murakkab grammatik tuzilmalar\n"
            "• <b>Accuracy:</b> Imlo, tinish belgilari va xatosiz yozish"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Saytga kirish", "url": site_url}],
                [
                    {"text": "👨‍💻 Admin (/admin)", "callback_data": "admin_info"},
                    {"text": "🏠 Bosh menyu", "callback_data": "main_menu"}
                ]
            ]
        }
    return text, markup

def get_admin_message(lang="uz"):
    site_url = get_site_url()
    if lang == "ru":
        text = (
            "👨‍💻 <b>Связь с Администратором и Разработчиком</b>\n\n"
            "• <b>Разработчик:</b> Hasanboy Homidjonov\n"
            "• <b>Основной Telegram:</b> @KhomidjonovH\n"
            "• <b>Дополнительный Telegram:</b> @Khomidjonov_H\n\n"
            "Если у вас есть вопросы, предложения или проблемы — напишите нам напрямую по кнопкам ниже.\n\n"
            "© 2026 WriteMaster AI. Все права защищены."
        )
        markup = {
            "inline_keyboard": [
                [{"text": "💬 Telegram: @KhomidjonovH", "url": "https://t.me/KhomidjonovH"}],
                [{"text": "💬 Telegram: @Khomidjonov_H", "url": "https://t.me/Khomidjonov_H"}],
                [
                    {"text": "🚀 Войти на сайт", "url": site_url},
                    {"text": "🏠 Главное меню", "callback_data": "main_menu"}
                ]
            ]
        }
    elif lang == "en":
        text = (
            "👨‍💻 <b>Contact Admin & Developer</b>\n\n"
            "• <b>Developer:</b> Hasanboy Homidjonov\n"
            "• <b>Primary Telegram:</b> @KhomidjonovH\n"
            "• <b>Secondary Telegram:</b> @Khomidjonov_H\n\n"
            "For inquiries, suggestions, or technical support — message directly using the buttons below.\n\n"
            "© 2026 WriteMaster AI. All rights reserved."
        )
        markup = {
            "inline_keyboard": [
                [{"text": "💬 Telegram: @KhomidjonovH", "url": "https://t.me/KhomidjonovH"}],
                [{"text": "💬 Telegram: @Khomidjonov_H", "url": "https://t.me/Khomidjonov_H"}],
                [
                    {"text": "🚀 Open Website", "url": site_url},
                    {"text": "🏠 Main Menu", "callback_data": "main_menu"}
                ]
            ]
        }
    else:
        text = (
            "👨‍💻 <b>Admin va Dasturchi bilan bog'lanish</b>\n\n"
            "• <b>Dasturchi:</b> Hasanboy Homidjonov\n"
            "• <b>Asosiy Telegram:</b> @KhomidjonovH\n"
            "• <b>Qo'shimcha Telegram:</b> @Khomidjonov_H\n\n"
            "Savol, taklif yoki texnik muammo bo'lsa — quyidagi tugmalardan to'g'ridan-to'g'ri yozing.\n\n"
            "© 2026 WriteMaster AI. Barcha huquqlar himoyalangan."
        )
        markup = {
            "inline_keyboard": [
                [{"text": "💬 Telegram: @KhomidjonovH", "url": "https://t.me/KhomidjonovH"}],
                [{"text": "💬 Telegram: @Khomidjonov_H", "url": "https://t.me/Khomidjonov_H"}],
                [
                    {"text": "🚀 Saytga kirish", "url": site_url},
                    {"text": "🏠 Bosh menyu", "callback_data": "main_menu"}
                ]
            ]
        }
    return text, markup

def get_language_message(lang="uz"):
    if lang == "ru":
        text = "🌐 <b>Выберите предпочитаемый язык:</b>"
        btn_back = "🏠 Главное меню"
    elif lang == "en":
        text = "🌐 <b>Choose your preferred language:</b>"
        btn_back = "🏠 Main Menu"
    else:
        text = "🌐 <b>O'zingizga qulay tilni tanlang:</b>"
        btn_back = "🏠 Bosh menyu"

    markup = {
        "inline_keyboard": [
            [
                {"text": "🇺🇿 O'zbekcha", "callback_data": "set_lang_uz"},
                {"text": "🇷🇺 Русский", "callback_data": "set_lang_ru"},
                {"text": "🇬🇧 English", "callback_data": "set_lang_en"}
            ],
            [{"text": btn_back, "callback_data": "main_menu"}]
        ]
    }
    return text, markup

def handle_message(msg):
    chat_id = msg.get("chat", {}).get("id")
    text = (msg.get("text") or "").strip()
    from_user = msg.get("from", {})
    lang = get_user_lang(from_user)
    name = get_user_display_name(from_user, lang)

    print(f"📩 [{time.strftime('%H:%M:%S')}] Xabar keldi: {name} (til: {lang}): {text}")

    # 1. /help
    if text.startswith("/help") or "yordam" in text.lower() or "помощь" in text.lower() or text.lower() == "help":
        msg_text, markup = get_help_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # 2. /admin
    if text.startswith("/admin") or "admin" in text.lower() or "админ" in text.lower():
        msg_text, markup = get_admin_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # 3. /lang
    if text.startswith("/lang") or text.startswith("/language") or "til" in text.lower() or "язык" in text.lower():
        msg_text, markup = get_language_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # 4. Saytdan dostup olib kirgan holat: /start auth_xxxx
    parts = text.split()
    auth_param = parts[1].strip() if len(parts) > 1 else ""

    if auth_param.startswith("auth_"):
        session_code = auth_param
        with sessions_lock:
            if session_code not in sessions:
                sessions[session_code] = {
                    "code": session_code,
                    "status": "pending",
                    "user": None,
                    "createdAt": time.time()
                }
                save_sessions()

        if lang == "ru":
            prompt_text = (
                f"🔐 <b>Запрос на вход в Writing Master!</b>\n\n"
                f"Здравствуйте, <b>{name}</b>!\n"
                f"Подтверждаете вход на сайт через этот Telegram аккаунт?"
            )
            markup = {
                "inline_keyboard": [
                    [
                        {"text": "✅ Да, войти", "callback_data": f"auth_allow:{session_code}"},
                        {"text": "❌ Отмена", "callback_data": f"auth_deny:{session_code}"}
                    ],
                    [
                        {"text": "📚 Помощь (/help)", "callback_data": "help_info"},
                        {"text": "👨‍💻 Админ (/admin)", "callback_data": "admin_info"}
                    ]
                ]
            }
        elif lang == "en":
            prompt_text = (
                f"🔐 <b>Writing Master Login Request!</b>\n\n"
                f"Hello, <b>{name}</b>!\n"
                f"Do you confirm logging into the website using this Telegram account?"
            )
            markup = {
                "inline_keyboard": [
                    [
                        {"text": "✅ Yes, Sign In", "callback_data": f"auth_allow:{session_code}"},
                        {"text": "❌ No, Cancel", "callback_data": f"auth_deny:{session_code}"}
                    ],
                    [
                        {"text": "📚 Help (/help)", "callback_data": "help_info"},
                        {"text": "👨‍💻 Admin (/admin)", "callback_data": "admin_info"}
                    ]
                ]
            }
        else:
            prompt_text = (
                f"🔐 <b>Writing Master platformasiga kirish so'rovi!</b>\n\n"
                f"Assalomu alaykum, <b>{name}</b>!\n"
                f"Saytga ushbu Telegram hisobingiz orqali kirishni tasdiqlaysizmi?"
            )
            markup = {
                "inline_keyboard": [
                    [
                        {"text": "✅ Ha, kirish", "callback_data": f"auth_allow:{session_code}"},
                        {"text": "❌ Yo'q, bekor qilish", "callback_data": f"auth_deny:{session_code}"}
                    ],
                    [
                        {"text": "📚 Yordam (/help)", "callback_data": "help_info"},
                        {"text": "👨‍💻 Admin (/admin)", "callback_data": "admin_info"}
                    ]
                ]
            }
        tg_api("sendMessage", {"chat_id": chat_id, "text": prompt_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # 5. Botning o'zida turib /start bossa yoki boshqa xabar yozsa:
    msg_text, markup = get_main_menu_message(name, lang)
    tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})

def handle_callback(cb):
    cb_id = cb.get("id")
    data = cb.get("data") or ""
    msg = cb.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    msg_id = msg.get("message_id")
    from_user = cb.get("from", {})

    lang = get_user_lang(from_user)
    name = get_user_display_name(from_user, lang)
    username = from_user.get("username") or ""

    is_admin = (
        username.lower() in ["khomidjonovh", "khomidjonov_h"]
        or from_user.get("id") == 7034211289
    )

    print(f"🔘 [{time.strftime('%H:%M:%S')}] Tugma bosildi: {name} (til: {lang}): {data}")

    # Muvaffaqiyatli kirish: auth_allow:auth_xxx yoki confirm_auth_xxx
    if data.startswith("auth_allow:") or data.startswith("confirm_"):
        session_code = data.split(":", 1)[1] if ":" in data else data.replace("confirm_", "")
        user_profile = {
            "id": f"usr_tg_{from_user.get('id')}",
            "telegramId": from_user.get("id"),
            "telegramUsername": username,
            "name": name,
            "email": f"{username.lower()}@telegram.user" if username else f"tg_{from_user.get('id')}@writingmaster.app",
            "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}",
            "level": "C1" if is_admin else "B1",
            "coins": 2500 if is_admin else 150,
            "completedEssays": 40 if is_admin else 0,
            "streakDays": 14 if is_admin else 1,
            "rank": 1 if is_admin else 12,
            "role": "admin" if is_admin else "user",
            "joinedAt": time.strftime("%Y-%m-%d"),
            "isAuthenticated": True
        }
        save_user_profile(user_profile)

        # Update in-memory session
        with sessions_lock:
            sessions[session_code] = {
                "code": session_code,
                "status": "confirmed",
                "user": user_profile,
                "confirmedAt": time.time()
            }
            # also update 'latest' for fallback
            sessions["latest"] = sessions[session_code]
            save_sessions()

        # Darhol Telegramga javob qaytarish (tugmadagi aylanayotgan kutish belgisini to'xtatish uchun)
        try:
            tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        except Exception:
            pass

        site_url = get_site_url()
        user_json = json.dumps(user_profile, ensure_ascii=False)
        encoded_user = base64.urlsafe_b64encode(user_json.encode('utf-8')).decode('ascii').rstrip('=')

        # To'g'ridan-to'g'ri bosh sahifaga hash bilan ochish:
        direct_site_url = f"{site_url}/#tg_auth={encoded_user}&session_id={session_code}&status=success"

        if lang == "ru":
            success_text = (
                f"✅ <b>Вход успешно выполнен! Можете вернуться на сайт.</b>\n\n"
                f"🎉 Добро пожаловать, <b>{name}</b>!\n"
                f"Ваш профиль активирован. Нажмите кнопку ниже для перехода на сайт:"
            )
            btn_text = "🚀 Перейти на сайт (Успешно)"
        elif lang == "en":
            success_text = (
                f"✅ <b>Signed in successfully! You may return to the website.</b>\n\n"
                f"🎉 Welcome, <b>{name}</b>!\n"
                f"Your profile is active. Tap the button below to open the website:"
            )
            btn_text = "🚀 Go to Website (Success)"
        else:
            success_text = (
                f"✅ <b>Muvaffaqiyatli kirdingiz! Saytga qaytishingiz mumkin.</b>\n\n"
                f"🎉 Xush kelibsiz, <b>{name}</b>!\n"
                f"Profilingiz faollashtirildi. Saytga o'tish uchun quyidagi tugmani bosing:"
            )
            btn_text = "🚀 Saytga o'tish (Muvaffaqiyatli)"

        markup = {
            "inline_keyboard": [
                [{"text": btn_text, "url": direct_site_url}]
            ]
        }
        try:
            tg_api("editMessageText", {
                "chat_id": chat_id, "message_id": msg_id, "text": success_text, "parse_mode": "HTML", "reply_markup": markup
            })
        except Exception:
            pass
        return

    # Kirishni rad etish: auth_deny:auth_xxx yoki reject_auth_xxx
    if data.startswith("auth_deny:") or data.startswith("reject_"):
        session_code = data.split(":", 1)[1] if ":" in data else data.replace("reject_", "")
        with sessions_lock:
            sessions[session_code] = {
                "code": session_code,
                "status": "rejected",
                "time": time.time()
            }
            sessions["latest"] = sessions[session_code]
            save_sessions()

        try:
            tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        except Exception:
            pass

        site_url = get_site_url()
        direct_site_url = f"{site_url}/#session_id={session_code}&status=rejected"

        if lang == "ru":
            rejected_text = (
                "🚫 <b>Вход отменён.</b>\n\n"
                "Запрос на вход в систему был отклонён. Чтобы вернуться на сайт, нажмите кнопку ниже:"
            )
            btn_text = "❌ Вернуться на сайт (Отменено)"
        elif lang == "en":
            rejected_text = (
                "🚫 <b>Login cancelled.</b>\n\n"
                "The login request was rejected. Click below to return to the site:"
            )
            btn_text = "❌ Return to Website (Cancelled)"
        else:
            rejected_text = (
                "🚫 <b>Kirish bekor qilindi.</b>\n\n"
                "Saytga kirish so'rovi rad etildi. Saytga qaytish uchun quyidagi tugmani bosing:"
            )
            btn_text = "❌ Saytga qaytish (Bekor qilindi)"

        markup = {
            "inline_keyboard": [
                [{"text": btn_text, "url": direct_site_url}]
            ]
        }
        try:
            tg_api("editMessageText", {
                "chat_id": chat_id, "message_id": msg_id, "text": rejected_text, "parse_mode": "HTML", "reply_markup": markup
            })
        except Exception:
            pass
        return

    if data == "help_info":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_help_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    if data == "admin_info":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_admin_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    if data == "main_menu":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_main_menu_message(name, lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    if data == "lang_menu":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_language_message(lang)
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    if data.startswith("set_lang_"):
        new_lang = data.replace("set_lang_", "")
        user_id = str(from_user.get("id") or "")
        if user_id:
            user_languages[user_id] = new_lang
        ack_text = "✅ Til tanlandi!" if new_lang == "uz" else ("✅ Язык выбран!" if new_lang == "ru" else "✅ Language set!")
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id, "text": ack_text})
        msg_text, markup = get_main_menu_message(name, new_lang)
        try:
            tg_api("editMessageText", {
                "chat_id": chat_id, "message_id": msg_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup
            })
        except Exception:
            tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

def setup_bot():
    print(f"🤖 Telegram Bot sozlanmoqda: @{BOT_USERNAME}...")
    tg_api("deleteWebhook")
    
    # Standart menyu (O'zbekcha)
    tg_api("setMyCommands", {
        "commands": [
            {"command": "start", "description": "🏠 Asosiy menyu va salomlashish"},
            {"command": "help", "description": "📚 Qoidalar va to'liq yordam"},
            {"command": "admin", "description": "👨‍💻 Admin va dasturchi bilan bog'lanish"},
            {"command": "lang", "description": "🌐 Tilni o'zgartirish (Til / Language / Язык)"}
        ]
    })
    # Ruscha menyu
    tg_api("setMyCommands", {
        "commands": [
            {"command": "start", "description": "🏠 Главное меню"},
            {"command": "help", "description": "📚 Правила и помощь"},
            {"command": "admin", "description": "👨‍💻 Связь с разработчиком"},
            {"command": "lang", "description": "🌐 Сменить язык (Language / Язык)"}
        ],
        "language_code": "ru"
    })
    # Inglizcha menyu
    tg_api("setMyCommands", {
        "commands": [
            {"command": "start", "description": "🏠 Main menu"},
            {"command": "help", "description": "📚 Rules & Help guide"},
            {"command": "admin", "description": "👨‍💻 Contact developer & admin"},
            {"command": "lang", "description": "🌐 Change language"}
        ],
        "language_code": "en"
    })
    print("✅ Webhook tozalandi va ko'p tilli menyu buyruqlari muvaffaqiyatli ro'yxatdan o'tdi.")

def process_update(u):
    try:
        if "message" in u:
            handle_message(u["message"])
        elif "callback_query" in u:
            handle_callback(u["callback_query"])
    except Exception as e:
        print(f"[Process Update Error]: {e}", file=sys.stderr)

def main():
    load_sessions()
    setup_bot()

    # Start Local HTTP Polling Server on Port 5000 in background daemon thread
    http_thread = threading.Thread(target=run_http_server, args=(5000,), daemon=True)
    http_thread.start()

    print(f"🚀 Telegram Bot (@{BOT_USERNAME}) faol ishlayapti!")
    print("Xabarlar kutilmoqda...")
    offset = 0

    while True:
        try:
            updates = tg_api("getUpdates", {"offset": offset, "timeout": 15})
            if updates and updates.get("ok"):
                for u in updates.get("result", []):
                    offset = u["update_id"] + 1
                    # Har bir xabar va tugma alohida oqimda (thread) ishlanadi — bot chaqmoqdek tez javob beradi!
                    threading.Thread(target=process_update, args=(u,), daemon=True).start()
            else:
                time.sleep(0.3)
        except KeyboardInterrupt:
            print("\nBot to'xtatildi.")
            break
        except Exception as e:
            print(f"[Loop Exception] {e}", file=sys.stderr)
            time.sleep(1)

if __name__ == "__main__":
    main()
