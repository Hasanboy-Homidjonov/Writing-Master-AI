# 🚀 Writing Master AI — GitHub va Serverga Joylash Qo'llanmasi

Ushbu qo'llanma loyihani **GitHub**ga yuklash va **Serverga (Render, Railway yoki VPS)** joylashtirish tartibini bosqichma-bosqich tushuntiradi.

---

## 1-Qadam: GitHub'ga yuklash (Push)

1. [GitHub.com](https://github.com) ga kiring va repozitoriy yarating.
2. Kompyuteringizda terminalni (PowerShell) oching va quyidagi buyruqlarni ketma-ket bajaring:

```powershell
# 1. Barcha o'zgarishlarni qo'shish
git add .

# 2. Commit qilish
git commit -m "feat: integrate Google OAuth 2.0 authentication and clean legacy bot files"

# 3. Asosiy tarmoqni main qilish
git branch -M main

# 4. GitHub'ga yuklash
git push -u origin main
```

*(Eslatma: `.env` faylidagi maxfiy ma'lumotlar `.gitignore` orqali himoyalangan, GitHub'ga chiqmaydi).*

---

## 2-Qadam: Serverga Joylash

### A) Render.com (Web Service)
1. [Render.com](https://render.com) ga kiring.
2. **"New +" -> "Web Service"** ni tanlang.
3. GitHub'dagi repozitoriyangizni ulang.
4. Quyidagi sozlamalarni kiriting:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. **Environment Variables** (Muhit o'zgaruvchilari) bo'limiga quyidagilarni kiriting:
   - `GOOGLE_CLIENT_ID` = `(O'zingizning Google Cloud Client ID ingiz)`
   - `VITE_GOOGLE_CLIENT_ID` = `(O'zingizning Google Cloud Client ID ingiz)`
   - `GOOGLE_CLIENT_SECRET` = `(O'zingizning Google Cloud Client Secret ingiz)`
   - `ADMIN_EMAILS` = `hasanboy.azizjonovich@gmail.com`
   - `SITE_URL` = `https://sizning-saytingiz.onrender.com`
6. **"Deploy Web Service"** tugmasini bosing.

---

## 3-Qadam: Google Cloud Console Sozlamalari (OAuth 2.0)

1. [Google Cloud Console](https://console.cloud.google.com/auth/clients) ga kiring.
2. Yaratilgan OAuth 2.0 Client sozlamalariga kiring.
3. **Authorised JavaScript origins** bo'limiga quyidagi manzillarni qo'shing:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `https://writing-master-ai.onrender.com` (yoki o'z domeningiz)
4. Saqlang (**Save**). Endi Google orqali kirish barcha domenlarda bexato ishlaydi!
