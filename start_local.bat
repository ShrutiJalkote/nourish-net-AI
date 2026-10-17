@echo off
title NourishNet AI - Local Launcher
echo ========================================================
echo         NourishNet AI - Modern React + FastAPI
echo         IBM Z Datathon 2026 - Track 1
echo ========================================================
echo.

set PYTHONIOENCODING=utf-8

echo Starting Unified Server on port 8000 (React UI + FastAPI)...
echo Serving React SPA and AI REST Engines from single process...
echo.
python run_backend.py
