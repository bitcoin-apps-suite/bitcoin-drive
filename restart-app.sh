#!/bin/bash

# Kill any process on port 1030
echo "Killing port 1030..."
lsof -ti:1030 | xargs kill -9 2>/dev/null || echo "No process on port 1030"

# Wait a moment
sleep 2

# Start the app in Terminal
echo "Starting Bitcoin Drive..."
osascript -e 'tell application "Terminal" to do script "cd /Users/b0ase/Projects/bitcoin-drive && npm run dev"'

# Wait and open browser
sleep 4
open http://localhost:1030