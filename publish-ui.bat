@echo off
echo ========================================================
echo Building and Publishing Dynamic Forms Angular UI...
echo ========================================================

:: Navigate to Angular workspace
cd /d "%~dp0"

:: Build Angular project in production mode (outputs directly to publish directory)
echo Running Angular production build...
call npm run build

echo ========================================================
echo Angular UI successfully built and published to:
echo %~dp0publish
echo ========================================================
