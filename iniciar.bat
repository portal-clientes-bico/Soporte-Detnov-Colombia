@echo off
setlocal
cd /d "%~dp0"

echo Iniciando Soporte Tecnico Maple Armor...
echo (Esta ventana debe permanecer abierta mientras uses la herramienta. Cierrala para detenerla.)
echo.

start "Soporte Tecnico Maple Armor" cmd /k npm run dev

timeout /t 4 /nobreak >nul
start "" http://localhost:3100

endlocal
