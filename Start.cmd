@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  set "CTD_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) else (
  set "CTD_NODE=node"
)
"%CTD_NODE%" server.mjs --open
pause
