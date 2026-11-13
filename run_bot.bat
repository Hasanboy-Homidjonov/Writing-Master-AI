@echo off
chcp 65001 > nul
title Writing Master - Telegram Auth Bot
echo ========================================================
echo   Writing Master AI - Telegram Bot Ishga Tushmoqda...
echo   Bot: @Write_English_bot
echo ========================================================

cd /d "%~dp0"

set "PY_BIN="
if exist "C:\msys64\ucrt64\bin\python.exe" (
    set "PY_BIN=C:\msys64\ucrt64\bin\python.exe"
)

if not defined PY_BIN (
    for %%p in (python.exe py.exe) do (
        if not defined PY_BIN (
            where %%p >nul 2>&1
            if not errorlevel 1 set "PY_BIN=%%p"
        )
    )
)

if not defined PY_BIN (
    echo [XATOLIK] Kompyuteringizda Python topilmadi!
    echo Iltimos, Python o'rnating yoki tekshiring.
    pause
    exit /b 1
)

echo [Ishga tushiruvchi]: %PY_BIN%
echo [Holat]: Bot xabarlarni qabul qilishga tayyor. Oynani yopmang!
echo --------------------------------------------------------

"%PY_BIN%" bot.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [DIQQAT] Bot to'xtadi yoki xatolik yuz berdi (Kod: %ERRORLEVEL%).
    pause
)
