#!/bin/bash

# Bitcoin Drive macOS App Creator
# This script creates a standalone macOS app that can be added to the dock

APP_NAME="Bitcoin Drive"
APP_DIR="$APP_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

echo "Creating Bitcoin Drive macOS app..."

# Remove existing app if it exists
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
fi

# Create app directory structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create the main executable script
cat > "$MACOS_DIR/BitcoinDrive" << 'EOF'
#!/bin/bash
open "https://bitcoin-drive.vercel.app"
EOF

# Make it executable
chmod +x "$MACOS_DIR/BitcoinDrive"

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>BitcoinDrive</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.bitcoindrive.app</string>
    <key>CFBundleName</key>
    <string>Bitcoin Drive</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.10</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.productivity</string>
</dict>
</plist>
EOF

# Copy icon if it exists
if [ -f "bitcoin-drive-icon.iconset/icon_512x512@2x.png" ]; then
    echo "Found iconset, creating icns file..."
    iconutil -c icns bitcoin-drive-icon.iconset -o "$RESOURCES_DIR/AppIcon.icns"
elif [ -f "public/bitcoindrive-icon.jpg" ]; then
    echo "Creating icon from JPG..."
    # Create iconset directory
    mkdir -p bitcoin-drive-icon.iconset
    
    # Create various icon sizes
    sips -z 16 16     public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_16x16.png
    sips -z 32 32     public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_16x16@2x.png
    sips -z 32 32     public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_32x32.png
    sips -z 64 64     public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_32x32@2x.png
    sips -z 128 128   public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_128x128.png
    sips -z 256 256   public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_128x128@2x.png
    sips -z 256 256   public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_256x256.png
    sips -z 512 512   public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_256x256@2x.png
    sips -z 512 512   public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_512x512.png
    sips -z 1024 1024 public/bitcoindrive-icon.jpg --out bitcoin-drive-icon.iconset/icon_512x512@2x.png
    
    # Create icns file
    iconutil -c icns bitcoin-drive-icon.iconset -o "$RESOURCES_DIR/AppIcon.icns"
fi

echo "✅ Bitcoin Drive app created successfully!"
echo ""
echo "To install:"
echo "1. Drag 'Bitcoin Drive.app' to your Applications folder"
echo "2. Right-click and select 'Open' the first time (due to security settings)"
echo "3. Drag the app to your dock for easy access"
echo ""
echo "Chrome Extension:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' in the top right"
echo "3. Click 'Load unpacked' and select the 'bitcoin-drive-chrome-extension' folder"
echo "4. Pin the extension to your toolbar"