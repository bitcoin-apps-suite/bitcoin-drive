#!/bin/bash

# Bitcoin Drive - Kill Port 1030
# This script kills any process running on port 1030

# Find and kill process on port 1030
PID=$(lsof -ti:1030)

if [ -z "$PID" ]; then
    osascript -e 'display notification "No Bitcoin Drive server was running on port 1030" with title "Bitcoin Drive" sound name "Pop"'
    echo "No process found on port 1030"
else
    kill -9 $PID
    osascript -e 'display notification "Successfully stopped Bitcoin Drive server on port 1030" with title "Bitcoin Drive" sound name "Glass"'
    echo "Killed process $PID on port 1030"
fi