@echo off
echo Starting Backend Server...
start cmd /k "cd server && npm run dev"

echo Starting Frontend Dev Server...
start cmd /k "cd client && npm run dev"

echo Both servers should be opening in new windows!
