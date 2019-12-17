@echo off
setlocal

cd %~dp0..\..\

set PATH=%cd%\.node;%PATH%

cmd /c "npm run build:prod"

endlocal
pause >nul
