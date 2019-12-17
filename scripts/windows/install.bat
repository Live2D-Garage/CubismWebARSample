@echo off
setlocal

set NODE_VERION=v12.13.1
set CUBISM_SDK_VERSION=4-beta.2

set NODE_DL_URL=https://nodejs.org/dist/%NODE_VERION%/node-%NODE_VERION%-win-x64.zip
set SDK_DL_URL=https://cubism.live2d.com/sdk-web/bin/CubismSdkForWeb-%CUBISM_SDK_VERSION%.zip

cd %~dp0..\..\

echo # Downloading Node.js...
echo.
mkdir .temp
curl -fsSL -o .\.temp\node.zip %NODE_DL_URL%
powershell "$progressPreference = 'silentlyContinue'; expand-archive -force -path '.\.temp\node.zip' -destinationpath '.\.temp\'"
move /y .\.temp\node-* .\.node
echo.

echo # Downloading Cubism SDK...
echo.
curl -fsSL -o .\.temp\sdk.zip %SDK_DL_URL%
powershell "$progressPreference = 'silentlyContinue'; expand-archive -force -path '.\.temp\sdk.zip' -destinationpath '.\.temp\'"
rmdir /s /q .\CubismWebSamples\
move /y .\.temp\Cubism* .\CubismWebSamples
echo.

rmdir /s /q .\.temp\

echo # Install dependency packages
echo.
set PATH=%cd%\.node;%PATH%
cmd /c "npm ci"
echo .

echo # Script completed successfully

endlocal
pause >nul
