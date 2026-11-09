# 🚀 Writing Master AI — GitHub va Serverga Joylash Qo'llanmasi

Ushbu qo'llanma loyihani **GitHub**ga yuklash va **Serverga (Render, Railway yoki VPS)** joylashtirish tartibini bosqichma-bosqich tushuntiradi.

---

## 1-Qadam: GitHub'ga yuklash (Push)

1. [GitHub.com](https://github.com) ga kiring va **"New repository"** tugmasini bosing.
2. Repozitoriy nomini yozing (masalan: `writing-master`) va **"Create repository"** ni bosing.
3. Kompyuteringizda terminalni (PowerShell) oching va quyidagi buyruqlarni ketma-ket bajaring:

```powershell
# 1. Barcha o'zgarishlarni qo'shish
git add .

# 2. Commit qilish
git commit -m "feat: Writing Master AI to'liq Telegram autentifikatsiyasi va tayyor server sozlamalari"

# 3. Asosiy tarmoqni main qilish
git branch -M main

# 4. O'zingizning GitHub havolangizni bog'lang (USERNAME va REPO nomingizni yozing)
git remote add origin https://github.com/SIZNING_GITHUB_USERNAME/writing-master.git

# 5. GitHub'ga yuklash
git push -u origin main
```

*(Eslatma: `.env` faylidagi maxfiy bot tokenlari `.gitignore` orqali himoyalangan, GitHub'ga chiqmaydi).*

---

## 2-Qadam: Serverga Joylash (3 xil qulay usul)

### A) Render.com (Eng oson va 100% Bepul)
1. [Render.com](https://render.com) ga kiring va GitHub orqali kiring.
2. **"New +" -> "Web Service"** ni tanlang.
3. GitHub'dagi `writing-master` repozitoriyangizni ulang.
4. Quyidagi sozlamalarni kiriting:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. **Environment Variables** (Muhit o'zgaruvchilari) bo'limiga `.env`dagi qiymatlarni kiriting:
   - `TELEGRAM_BOT_TOKEN` = `8676643528:AAEsgk_CWjGEp3JNjMABakJbvZnVta_wPrs`
   - `VITE_TELEGRAM_BOT_USERNAME` = `Write_English_bot`
   - `ADMIN_TELEGRAM_USERNAMES` = `KhomidjonovH,Khomidjonov_H,Hasanboy`
   - `SITE_URL` = `https://sizning-saytingiz.onrender.com`
6. **"Deploy Web Service"** tugmasini bosing — bir necha daqiqada sayt va API internetda ishlay boshlaydi!

---

### B) Railway.app (Juda tezkor va zamonaviy)
1. [Railway.app](https://railway.app) ga kiring.
2. **"Deploy from GitHub repo"** ni tanlang va `writing-master` ni ko'rsating.
3. **Variables** bo'limiga `.env` dagi kalitlarni qo'shing.
4. Railway avtomatik tarzda `package.json` asosida loyihani quradi va ishga tushiradi.

---

### C) O'z shaxsiy VPS / VDS Serveringizda (Ubuntu / Debian)
Serveringizga ulanib, quyidagilarni bajaring:

```bash
# 1. Loyihani yuklab olish
git clone https://github.com/SIZNING_GITHUB_USERNAME/writing-master.git
cd writing-master

# 2. Kutubxonalarni o'rnatish va loyihani yig'ish
npm install
npm run build

# 3. .env faylini yaratish
cp .env.example .env
nano .env  # Token va ma'lumotlarni kiriting

# 4. PM2 orqali 24/7 ishga tushirish:
npm install -g pm2
pm2 start server/server.js --name "writing-master-web"
pm2 start "python3 bot.py" --name "writing-master-bot"
pm2 save
pm2 startup
```

---

## 3-Qadam: Telegram Botdagi Sayt Havolasini Yangilash

Saytingiz internetga chiqqach (masalan `https://writing-master.uz` yoki Render havolasi), `.env` faylidagi `SITE_URL` ga yangi havolani yozing:
```env
SITE_URL=https://sizning-saytingiz.onrender.com
```
Endi foydalanuvchilar Telegram botdagi **«🚀 Saytga kirish»** tugmasini bosganda to'g'ridan-to'g'ri internetdagi jonli saytingizga o'tishadi!
