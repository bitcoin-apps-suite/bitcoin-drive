#!/usr/bin/osascript

-- Kill Port 3003 AppleScript
-- This creates a dock-friendly app to kill port 3003

on run
    set scriptPath to POSIX path of (path to me)
    set scriptDir to do shell script "dirname " & quoted form of scriptPath
    
    try
        do shell script scriptDir & "/kill-port-3003.sh"
    on error errMsg
        display dialog "Error: " & errMsg buttons {"OK"} default button "OK"
    end try
end run