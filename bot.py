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
SITE_BASE_URL = "http://127.0.0.1:5500/index.html"

API_BASE = f"https://api.telegram.org/bot{BOT_TOKEN}"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(SCRIPT_DIR, "server", "users.json")
SESSIONS_FILE = os.path.join(SCRIPT_DIR, "server", "telegram_sessions.json")

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
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

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

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)

        if parsed.path in ('/api/auth/telegram/status', '/status'):
            code = (qs.get('code') or [''])[0]
            with sessions_lock:
                session = sessions.get(code)
                if not session:
                    # check latest confirmed session if fallback
                    session = sessions.get('latest')

            if session:
                response = {
                    "success": True,
                    "status": session.get("status", "pending"),
                    "user": session.get("user")
                }
            else:
                response = {
                    "success": True,
                    "status": "pending"
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

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def log_message(self, format, *args):
        # Silent HTTP logging to keep console clean
        return

def run_http_server(port=5000):
    try:
        server = HTTPServer(('127.0.0.1', port), AuthHTTPHandler)
        print(f"🌐 Mahalliy autentifikatsiya serveri ishga tushdi: http://127.0.0.1:{port}")
        server.serve_forever()
    except Exception as e:
        print(f"[HTTP Server Warning] Port {port} band bo'lishi mumkin: {e}", file=sys.stderr)

# Telegram Bot Xabarlari va Tugmalari
def get_help_message():
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
            [{"text": "🚀 Saytga kirish", "url": SITE_BASE_URL}],
            [{"text": "👨‍💻 Admin bilan bog'lanish", "callback_data": "admin_info"}]
        ]
    }
    return text, markup

def get_admin_message():
    text = (
        "👨‍💻 <b>Admin va Dasturchi bilan bog'lanish</b>\n\n"
        "• <b>Dasturchi:</b> Hasanboy Homidjonov\n"
        "• <b>Asosiy Telegram:</b> @KhomidjonovH\n"
        "• <b>Aloqa Boti:</b> @Khomidjonov_H\n\n"
        "Savol, taklif yoki texnik muammo bo'lsa — quyidagi tugmalardan to'g'ridan-to'g'ri yozing.\n\n"
        "© 2026 WriteMaster AI. Barcha huquqlar himoyalangan."
    )
    markup = {
        "inline_keyboard": [
            [{"text": "💬 Telegram: @KhomidjonovH", "url": "https://t.me/KhomidjonovH"}],
            [{"text": "🤖 Aloqa Boti: @Khomidjonov_H", "url": "https://t.me/Khomidjonov_H"}],
            [{"text": "🚀 Saytga kirish", "url": SITE_BASE_URL}]
        ]
    }
    return text, markup

def handle_message(msg):
    chat_id = msg.get("chat", {}).get("id")
    text = (msg.get("text") or "").strip()
    from_user = msg.get("from", {})
    name = " ".join(filter(None, [from_user.get("first_name"), from_user.get("last_name")])) or from_user.get("username") or "Hasanboy"

    print(f"📩 [{time.strftime('%H:%M:%S')}] Xabar keldi: {name}: {text}")

    # /help
    if text.startswith("/help") or "yordam" in text.lower():
        msg_text, markup = get_help_message()
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # /admin
    if text.startswith("/admin") or "admin" in text.lower():
        msg_text, markup = get_admin_message()
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    # /start auth_xxxx
    session_code = "auth_latest"
    parts = text.split()
    if len(parts) > 1 and parts[1].strip():
        session_code = parts[1].strip()

    prompt_text = (
        f"🔐 <b>Writing Master platformasiga kirish so'rovi!</b>\n\n"
        f"Assalomu alaykum, <b>{name}</b>!\n"
        f"Saytga ushbu Telegram hisobingiz orqali kirishni tasdiqlaysizmi?"
    )
    markup = {
        "inline_keyboard": [
            [
                {"text": "✅ Ha, kiraman", "callback_data": f"confirm_{session_code}"},
                {"text": "❌ Yo'q, bekor qilish", "callback_data": f"reject_{session_code}"}
            ],
            [
                {"text": "📚 Yordam (/help)", "callback_data": "help_info"},
                {"text": "👨‍💻 Admin (/admin)", "callback_data": "admin_info"}
            ]
        ]
    }
    tg_api("sendMessage", {"chat_id": chat_id, "text": prompt_text, "parse_mode": "HTML", "reply_markup": markup})

def handle_callback(cb):
    cb_id = cb.get("id")
    data = cb.get("data") or ""
    msg = cb.get("message", {})
    chat_id = msg.get("chat", {}).get("id")
    msg_id = msg.get("message_id")
    from_user = cb.get("from", {})

    first_name = from_user.get("first_name") or ""
    last_name = from_user.get("last_name") or ""
    name = " ".join(filter(None, [first_name, last_name])) or from_user.get("username") or "Hasanboy Homidjonov"
    username = from_user.get("username") or ""

    is_admin = (
        username.lower() in ["khomidjonovh", "khomidjonov_h"]
        or "hasanboy" in name.lower()
        or from_user.get("id") == 8676643528
    )

    print(f"🔘 [{time.strftime('%H:%M:%S')}] Tugma bosildi: {name}: {data}")

    if data.startswith("confirm_"):
        session_code = data.replace("confirm_", "")
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

        # Qisqa, toza va chiroyli havola (hech qanday uzun xunuk kodlarsiz)
        direct_auth_url = f"{SITE_BASE_URL}#auth={session_code}"

        tg_api("answerCallbackQuery", {"callback_query_id": cb_id, "text": "✅ Kirish muvaffaqiyatli tasdiqlandi!"})
        success_text = (
            f"✅ <b>Kirish muvaffaqiyatli tasdiqlandi!</b>\n\n"
            f"🎉 Xush kelibsiz, <b>{name}</b> ({'Admin Hasanboy' if is_admin else 'Talaba'})!\n\n"
            f"Profilingiz yaratildi va saytga ulandi.\n"
            f"Brauzeringiz avtomatik ochilishi kerak. Agar ochilmasa, quyidagi tugmani bosing:"
        )
        markup = {
            "inline_keyboard": [
                [{"text": "🚀 Saytga kirish (Go Live)", "url": direct_auth_url}]
            ]
        }
        tg_api("editMessageText", {
            "chat_id": chat_id, "message_id": msg_id, "text": success_text, "parse_mode": "HTML", "reply_markup": markup
        })
        return

    if data.startswith("reject_"):
        session_code = data.replace("reject_", "")
        with sessions_lock:
            sessions[session_code] = {
                "code": session_code,
                "status": "rejected",
                "time": time.time()
            }
            sessions["latest"] = sessions[session_code]
            save_sessions()

        tg_api("answerCallbackQuery", {"callback_query_id": cb_id, "text": "❌ Kirish bekor qilindi"})
        tg_api("editMessageText", {
            "chat_id": chat_id, "message_id": msg_id, "text": "❌ <b>Kirish so'rovi bekor qilindi.</b>\nSaytga kirish ruxsati berilmadi.", "parse_mode": "HTML"
        })
        return

    if data == "help_info":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_help_message()
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

    if data == "admin_info":
        tg_api("answerCallbackQuery", {"callback_query_id": cb_id})
        msg_text, markup = get_admin_message()
        tg_api("sendMessage", {"chat_id": chat_id, "text": msg_text, "parse_mode": "HTML", "reply_markup": markup})
        return

def setup_bot():
    print(f"🤖 Telegram Bot sozlanmoqda: @{BOT_USERNAME}...")
    tg_api("deleteWebhook")
    commands = {
        "commands": [
            {"command": "start", "description": "🚀 Platformani boshlash va saytga kirish"},
            {"command": "help", "description": "📚 Qoidalar va to'liq yordam"},
            {"command": "admin", "description": "👨‍💻 Admin va dasturchi bilan bog'lanish"}
        ]
    }
    tg_api("setMyCommands", commands)
    print("✅ Webhook tozalandi va menyu buyruqlari muvaffaqiyatli ro'yxatdan o'tdi.")

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
            updates = tg_api("getUpdates", {"offset": offset, "timeout": 25})
            if updates and updates.get("ok"):
                for u in updates.get("result", []):
                    offset = u["update_id"] + 1
                    if "message" in u:
                        handle_message(u["message"])
                    elif "callback_query" in u:
                        handle_callback(u["callback_query"])
            else:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nBot to'xtatildi.")
            break
        except Exception as e:
            print(f"[Loop Exception] {e}", file=sys.stderr)
            time.sleep(2)

if __name__ == "__main__":
    main()
