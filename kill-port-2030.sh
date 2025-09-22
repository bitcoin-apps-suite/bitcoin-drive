#!/bin/bash

# Bitcoin Drive - Kill Port 2030
# This script kills any process running on port 2030

# Find and kill process on port 2030
PID=$(lsof -ti:2030)

if [ -z "$PID" ]; then
    osascript -e 'display notification "No Bitcoin Drive server was running on port 2030" with title "Bitcoin Drive" sound name "Pop"'
    echo "No process found on port 2030"
else
    kill -9 $PID
    osascript -e 'display notification "Successfully stopped Bitcoin Drive server on port 2030" with title "Bitcoin Drive" sound name "Glass"'
    echo "Killed process $PID on port 2030"
fi