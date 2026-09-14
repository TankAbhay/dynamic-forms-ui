@echo off
echo ========================================================
echo Building and Publishing Dynamic Forms Angular UI...
echo ========================================================

:: Navigate to Angular workspace
cd /d "%~dp0"

:: Build Angular project in production mode
echo Running Angular production build...
call npm run build

:: Create publish directory if it doesn't exist
set PUBLISH_DIR=%~dp0publish
if not exist "%PUBLISH_DIR%" (
    mkdir "%PUBLISH_DIR%"
)

:: Clean existing files in publish directory
echo Cleaning old published files...
del /q /f "%PUBLISH_DIR%\*.*" >nul 2>&1
for /d %%p in ("%PUBLISH_DIR%\*") do rmdir "%%p" /s /q >nul 2>&1

:: Copy built browser files to publish directory
echo Copying production assets to %PUBLISH_DIR%...
xcopy /e /y /q "dist\dynamic-forms-web\browser\*.*" "%PUBLISH_DIR%\"

echo ========================================================
echo Angular UI successfully built and published to:
echo %PUBLISH_DIR%
echo ========================================================
