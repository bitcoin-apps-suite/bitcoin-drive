#!/bin/bash

# Create icon from PNG file
# Usage: ./create-icon.sh icon.png

if [ -z "$1" ]; then
    echo "Please provide the path to your PNG icon file"
    echo "Usage: ./create-icon.sh path/to/icon.png"
    exit 1
fi

SOURCE_PNG="$1"
ASSETS_DIR="$(dirname "$0")/assets"

if [ ! -f "$SOURCE_PNG" ]; then
    echo "Error: File $SOURCE_PNG not found"
    exit 1
fi

echo "Creating icon set from $SOURCE_PNG..."

# Create iconset directory
ICONSET_DIR="$ASSETS_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# Generate different sizes for macOS
sips -z 16 16     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16.png"
sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32.png"
sips -z 64 64     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
sips -z 128 128   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128.png"
sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256.png"
sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512.png"
sips -z 1024 1024 "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png"

# Create ICNS file
iconutil -c icns "$ICONSET_DIR" -o "$ASSETS_DIR/icon.icns"

# Copy as PNG
cp "$SOURCE_PNG" "$ASSETS_DIR/icon.png"

# Clean up
rm -rf "$ICONSET_DIR"

echo "✅ Icon created successfully!"
echo "  - $ASSETS_DIR/icon.icns (for macOS)"
echo "  - $ASSETS_DIR/icon.png (for other platforms)"