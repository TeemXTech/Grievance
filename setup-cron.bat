@echo off
REM ============================================================
REM  setup-cron.bat
REM  Run this ONCE as Administrator to register the nightly
REM  overdue escalation job in Windows Task Scheduler.
REM  It will run every day at 00:05 AM automatically.
REM ============================================================

SET TASK_NAME=GrievanceOverdueCron
SET APP_DIR=%~dp0
REM Remove trailing backslash
SET APP_DIR=%APP_DIR:~0,-1%

echo.
echo Setting up nightly overdue cron job...
echo App folder: %APP_DIR%
echo.

REM Delete old task if it exists (ignore error if not found)
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM Create the task: runs daily at 00:05 AM
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "cmd /c cd /d \"%APP_DIR%\" && npm run cron:overdue >> \"%APP_DIR%\logs\cron-overdue.log\" 2>&1" ^
  /sc daily ^
  /st 00:05 ^
  /ru SYSTEM ^
  /rl HIGHEST ^
  /f

IF %ERRORLEVEL% EQU 0 (
  echo.
  echo [OK] Task "%TASK_NAME%" registered successfully.
  echo      It will run every night at 00:05 AM automatically.
  echo      Logs will be saved to: %APP_DIR%\logs\cron-overdue.log
) ELSE (
  echo.
  echo [ERROR] Failed to register task. Please run this file as Administrator.
  echo         Right-click setup-cron.bat and choose "Run as administrator"
)

REM Create logs folder if it doesn't exist
if not exist "%APP_DIR%\logs" mkdir "%APP_DIR%\logs"

echo.
pause
