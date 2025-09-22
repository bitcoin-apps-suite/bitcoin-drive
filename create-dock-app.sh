#!/bin/bash

# Bitcoin Drive - Create Dock Application
# This script creates a complete dock app with icon

PROJECT_DIR="/Users/b0ase/Projects/bitcoin-drive"
APP_NAME="Bitcoin Drive Manager"
APPLESCRIPT_FILE="$PROJECT_DIR/BitcoinDriveManager.applescript"
ICON_FILE="$PROJECT_DIR/bitcoin-drive-icon.iconset/icon_512x512@2x.png"
APPLICATIONS_DIR="/Applications"
APP_PATH="$APPLICATIONS_DIR/$APP_NAME.app"

echo "🚀 Creating Bitcoin Drive Manager application..."

# Check if Script Editor is available
if ! command -v osascript &> /dev/null; then
    echo "❌ osascript not found. This script requires macOS."
    exit 1
fi

# Check if the applescript file exists
if [ ! -f "$APPLESCRIPT_FILE" ]; then
    echo "❌ AppleScript file not found: $APPLESCRIPT_FILE"
    exit 1
fi

# Remove existing app if it exists
if [ -d "$APP_PATH" ]; then
    echo "🗑️  Removing existing application..."
    rm -rf "$APP_PATH"
fi

# Compile the AppleScript to an application
echo "⚙️  Compiling AppleScript to application..."
osacompile -o "$APP_PATH" "$APPLESCRIPT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Application created successfully: $APP_PATH"
else
    echo "❌ Failed to create application"
    exit 1
fi

# Set the icon if it exists
if [ -f "$ICON_FILE" ]; then
    echo "🎨 Setting application icon..."
    
    # Convert PNG to ICNS format and set as app icon
    ICON_DIR="$APP_PATH/Contents/Resources"
    mkdir -p "$ICON_DIR"
    
    # Convert PNG to ICNS using sips
    if command -v sips &> /dev/null; then
        sips -s format icns "$ICON_FILE" --out "$ICON_DIR/applet.icns" &> /dev/null
        if [ $? -eq 0 ]; then
            echo "   ✓ Converted PNG to ICNS format"
        else
            echo "   ⚠️  ICNS conversion failed, copying PNG directly"
            cp "$ICON_FILE" "$ICON_DIR/applet.icns"
        fi
    else
        echo "   ⚠️  sips not available, copying PNG directly"
        cp "$ICON_FILE" "$ICON_DIR/applet.icns"
    fi
    
    echo "✅ Icon set successfully"
else
    echo "⚠️  Icon file not found: $ICON_FILE"
    echo "   You can manually add an icon by:"
    echo "   1. Right-clicking the app in Applications"
    echo "   2. Select 'Get Info'"
    echo "   3. Drag your icon to the app icon in the top-left"
fi

# Make the app executable
chmod +x "$APP_PATH/Contents/MacOS/applet"

echo ""
echo "🎉 Bitcoin Drive Manager created successfully!"
echo ""
echo "📍 Location: $APP_PATH"
echo "🎯 To add to Dock:"
echo "   1. Open Applications folder"
echo "   2. Find 'Bitcoin Drive Manager'"
echo "   3. Drag it to your Dock"
echo ""
echo "🔧 The app will:"
echo "   • Kill any process on port 2030"
echo "   • Start Bitcoin Drive server"
echo "   • Open Terminal with the running server"
echo "   • Optionally open browser to localhost:2030"
echo ""
echo "✨ Click the app in your Dock to restart Bitcoin Drive anytime!"

# Ask if user wants to open Applications folder
read -p "📂 Would you like to open Applications folder now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "$APPLICATIONS_DIR"
fi