#!/usr/bin/osascript

(*
Bitcoin Drive Restart App
Kills port 2030 and restarts Bitcoin Drive app
*)

on run
	try
		-- Kill any process on port 2030
		set killResult to do shell script "lsof -ti:2030 2>/dev/null || echo 'none'"
		
		if killResult is not equal to "none" then
			do shell script "kill -9 " & killResult
			display notification "Killed process on port 2030" with title "Bitcoin Drive" sound name "Glass"
			delay 1
		end if
		
		-- Start Bitcoin Drive
		tell application "Terminal"
			activate
			do script "cd /Users/b0ase/Projects/bitcoin-drive && npm run dev"
		end tell
		
		display notification "Starting Bitcoin Drive on port 2030..." with title "Bitcoin Drive" sound name "Blow"
		
		-- Wait and open browser
		delay 3
		open location "http://localhost:2030"
		
	on error errMsg
		display dialog "Error: " & errMsg buttons {"OK"} default button "OK" with icon caution
	end try
end run