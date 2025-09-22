#!/usr/bin/osascript

(*
Bitcoin Drive - Kill Port 2030
This script kills any process running on port 2030
To use: Save as an Application and add to dock with Bitcoin Drive icon
*)

on run
	try
		-- Kill any process on port 2030
		set killResult to do shell script "lsof -ti:2030 | xargs kill -9 2>/dev/null || echo 'No process found on port 2030'"
		
		-- Show notification
		if killResult contains "No process" then
			display notification "No Bitcoin Drive server was running on port 2030" with title "Bitcoin Drive" sound name "Pop"
		else
			display notification "Successfully stopped Bitcoin Drive server on port 2030" with title "Bitcoin Drive" sound name "Glass"
			
			-- Optional: Wait a moment then offer to restart
			delay 1
			set userResponse to display dialog "Bitcoin Drive server stopped. Would you like to restart it?" buttons {"No", "Yes"} default button "No" with title "Bitcoin Drive" with icon note
			
			if button returned of userResponse is "Yes" then
				tell application "Terminal"
					activate
					do script "cd ~/Projects/bitcoin-drive && npm run dev"
				end tell
				display notification "Starting Bitcoin Drive on port 2030..." with title "Bitcoin Drive" sound name "Blow"
			end if
		end if
		
	on error errMsg
		display dialog "Error: " & errMsg buttons {"OK"} default button "OK" with icon caution with title "Bitcoin Drive Error"
	end try
end run