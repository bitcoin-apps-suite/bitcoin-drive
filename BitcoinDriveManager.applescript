#!/usr/bin/osascript

(*
Bitcoin Drive Manager
Kill and Restart Bitcoin Drive on Port 2030
To create app: 
1. Open this file in Script Editor
2. File > Export > File Format: Application
3. Save as "Bitcoin Drive Manager" to Applications folder
4. Add bitcoindrive-icon.jpg as the app icon
*)

on run
	-- Define the project path
	set projectPath to "~/Projects/bitcoin-drive"
	
	try
		-- First, kill any existing process on port 2030
		set killResult to do shell script "lsof -ti:2030 2>/dev/null || echo 'none'"
		
		if killResult is not equal to "none" then
			do shell script "kill -9 " & killResult
			display notification "Stopped existing Bitcoin Drive server" with title "Bitcoin Drive" subtitle "Port 2030 cleared" sound name "Glass"
			delay 1
		end if
		
		-- Now restart the server
		tell application "Terminal"
			-- Check if Terminal is running
			if not (exists window 1) then
				activate
				delay 0.5
			end if
			
			-- Create a new tab or window for Bitcoin Drive
			if (exists window 1) then
				tell application "System Events"
					keystroke "t" using command down
				end tell
				delay 0.5
			else
				activate
				delay 0.5
			end if
			
			-- Navigate to project and start the server
			do script "cd " & projectPath & " && clear && echo '🚀 Starting Bitcoin Drive on Port 2030...' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && npm run dev" in window 1
			
			-- Bring Terminal to front
			activate
		end tell
		
		-- Show success notification
		delay 2
		display notification "Bitcoin Drive is starting on http://localhost:2030" with title "Bitcoin Drive" subtitle "Server Starting" sound name "Blow"
		
		-- Optionally open in browser after a delay
		delay 3
		set dialogResult to display dialog "Bitcoin Drive is starting on port 2030" & return & return & "Would you like to open it in your browser?" buttons {"No", "Open in Browser"} default button "Open in Browser" with icon note with title "Bitcoin Drive Manager"
		
		if button returned of dialogResult is "Open in Browser" then
			open location "http://localhost:2030"
		end if
		
	on error errMsg number errNum
		display dialog "Error " & errNum & ": " & errMsg buttons {"OK"} default button "OK" with icon caution with title "Bitcoin Drive Error"
	end try
end run

-- Handler for when app is clicked again while running
on reopen
	try
		-- Check if server is running
		set checkResult to do shell script "lsof -ti:2030 2>/dev/null || echo 'none'"
		
		if checkResult is equal to "none" then
			-- Server not running, start it
			run
		else
			-- Server is running, ask what to do
			set userChoice to display dialog "Bitcoin Drive is already running on port 2030" & return & return & "What would you like to do?" buttons {"Cancel", "Restart Server", "Stop Server"} default button "Cancel" with icon note with title "Bitcoin Drive Manager"
			
			if button returned of userChoice is "Stop Server" then
				do shell script "kill -9 " & checkResult
				display notification "Bitcoin Drive server stopped" with title "Bitcoin Drive" subtitle "Port 2030 freed" sound name "Glass"
			else if button returned of userChoice is "Restart Server" then
				run
			end if
		end if
	on error
		run
	end try
end reopen