@echo off
title NARUTO: NINJA RUN - Shinobi Endless Runner
chcp 65001 >nul
cls
color 0E

echo ==============================================================================
echo.
echo     _   _    _    ____  _   _ _____ ___    _   _ ___ _   _     _     ____  _   _ _   _ 
echo    ^| \ ^| ^|  / \  ^|  _ \^| ^| ^| ^|_   _/ _ \  ^| \ ^| ^|_ _^| \ ^| ^|   / \   ^|  _ \^| ^| ^| ^| \ ^| ^|
echo    ^|  \^| ^| / _ \ ^| ^|_) ^| ^| ^| ^| ^| ^|^| ^| ^| ^| ^|  \^| ^|^| ^|^|  \^| ^|  / _ \  ^| ^|_) ^| ^| ^| ^|  \^| ^|
echo    ^| ^|\  ^|/ ___ \^|  _ ^<^| ^|_^| ^| ^| ^|^| ^|_^| ^| ^| ^|\  ^|^| ^|^| ^|\  ^| / ___ \ ^|  _ ^<^| ^|_^| ^| ^|\  ^|
echo    ^|_^| \_/_/   \_\_^| \_\\___/  ^|_^| \___/  ^|_^| \_^|___^|_^| \_^|/_/   \_\\_^| \_\\___/ ^|_^| \_^|
echo.
echo ==============================================================================
echo                      * BELIEVE IT! SHINOBI CHRONICLES *
echo ==============================================================================
echo.
echo  [CONTROLS QUICK GUIDE]
echo  - W / UP / SPACE : Jump (Press again in mid-air to Double Jump)
echo  - S / DOWN       : Slide / Duck under high obstacles
echo  - J / CLICK      : Throw Shuriken
echo  - K              : Jutsu 1 (Shadow Clones / Fireball / Kamui / Shanaro)
echo  - L              : Jutsu 2 (Rasengan / Chidori / Raikiri / Healing)
echo  - U              : Ultimate Secret Jutsu (Nine-Tails / Kirin / 8 Gates)
echo  - ESC / P        : Pause Game
echo.
echo ==============================================================================
echo  Starting Naruto Ninja Run in your browser...
echo ==============================================================================
echo.

:: Check if Python is available to host local HTTP server for best Web Audio compatibility
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Launching local game server on http://localhost:8080 ...
    start "" http://localhost:8080
    python -m http.server 8080
) else (
    echo  [OK] Opening game directly in your default browser...
    start "" "%~dp0index.html"
    echo  Game launched! You can close this window at any time.
    pause
)
