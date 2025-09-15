#!/bin/bash

# Kill Port 3003 Script
# This script kills any process running on port 3003

# Find and kill processes on port 3003
PORT=3003

# Get PIDs of processes using port 3003
PIDS=$(lsof -ti :$PORT)

if [ -z "$PIDS" ]; then
    osascript -e 'display notification "No process found on port 3003" with title "Port 3003" sound name "Pop"'
else
    # Kill the processes
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null
    done
    osascript -e 'display notification "Port 3003 has been freed!" with title "Port 3003 Killer" sound name "Hero"'
fi