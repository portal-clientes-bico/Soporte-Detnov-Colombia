@echo off
setlocal
cd /d "%~dp0"

echo Iniciando Base de conocimiento tecnico Detnov Colombia...
echo (Esta ventana debe permanecer abierta mientras uses la herramienta. Cierrala para detenerla.)
echo.

start "Base de conocimiento tecnico Detnov Colombia" cmd /k npm run dev

timeout /t 4 /nobreak >nul
start "" http://localhost:3100

endlocal
