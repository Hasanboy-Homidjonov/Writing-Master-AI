@echo off
chcp 65001 > nul
title Writing Master - Telegram Auth Bot
echo ========================================================
echo   Writing Master AI - Telegram Bot Ishga Tushmoqda...
echo   Bot: @Write_English_bot
echo ========================================================
python bot.py
if %ERRORLEVEL% NEQ 0 (
    echo Python topilmadi yoki xatolik yuz berdi.
    echo C:\msys64\ucrt64\bin\python.exe orqali urinib korilmoqda...
    "C:\msys64\ucrt64\bin\python.exe" bot.py
)
pause
