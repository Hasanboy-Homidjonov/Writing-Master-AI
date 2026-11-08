# ✍️ Writing Master AI — 5D AI Writing Platformasi

Ingliz tili insho (essay) yozish ko'nikmalarini baholovchi, xavfsiz Anti-Cheat rejimiga ega bo'lgan 5D AI audit platformasi.

---

## 🌟 Asosiy Imkoniyatlar

1. **🔒 Majburiy Kirish (Auth Gate):**
   - Foydalanuvchi tizimga kirmaguncha bosh menyu, mavzular va reyting ko'rinmaydi.
   - Maydonlar bo'sh ochiladi, ortiqcha mehmon tugmasi yo'q.

2. **👑 Yashirin Admin Paneli:**
   - Faqat `hasanboy.azizjonovich@gmail.com` hisobi orqali kirilganda yuqori panelda "👑 Admin Panel" chiqadi.
   - Maxfiy parol: `Hasanboy1709`.
   - Foydalanuvchilar, fikr-mulohazalar, mavzular va xavfsizlik loglarini boshqarish mumkin.

3. **🌐 Bitta Tugmali Til Menyusi:**
   - Yuqori panelda ixcham `[ 🌐 🇺🇿 O'zbek ▾ ]` tugmasi.
   - 🇺🇿 O'zbekcha, 🇬🇧 Inglizcha va 🇷🇺 Ruscha tillarga bir zumda tarjima.

4. **⚡ 5D AI Writing Baholash:**
   - Task Achievement
   - Coherence & Cohesion
   - Lexical Resource
   - Grammatical Range & Accuracy
   - Sentence Structure

5. **📱 Telefon, Planshet va Kompyuterlarga 100% Mos:**
   - Barcha smartfon va planshet ekranlarida qulay moslashuvchan dizayn (Responsive Design).

---

## 🚀 Ishga Tushirish Usullari

### 1-usul: VS Code "Go Live" orqali (Hech qanday Node/terminal kerak emas!)
1. Loyihani **VS Code** dasturida oching.
2. `index.html` faylini oching.
3. Pastki o'ng burchakdagi **"Go Live"** tugmasini bosing (yoki fayl ustiga o'ng tugmani bosib, *Open with Live Server* ni tanlang).
4. Brauzerda sayt darhol to'liq ishga tushadi!

### 2-usul: Node.js / Vite orqali (Dasturchilar uchun)
```bash
# Paketlarni o'rnatish
npm install

# Ishga tushirish
npm run dev

# Ishlab chiqarish uchun build qilish
npm run build
```

---

## 📂 Loyiha Tuzilmasi

```
writing-master/
├── assets/             # Statik ishlab chiqarish fayllari (Go Live va GitHub Pages uchun)
├── dist/               # Vite build natijasi
├── src/                # Asosiy TypeScript/React manba kodi
│   ├── components/     # UI komponentlar (Header, AuthScreen, Topics, va boshqalar)
│   ├── context/        # Global App Context
│   ├── data/           # Standart mavzular va savollar
│   ├── types/          # TypeScript turlari
│   └── utils/          # NLP tekshirish, audio va i18n
├── index.html          # Asosiy HTML sahifa
├── vite.config.ts      # Vite konfiguratsiyasi
└── package.json        # Loyiha ma'lumotlari
```
