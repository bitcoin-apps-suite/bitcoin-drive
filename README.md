# Character Notepad

A character-focused desktop application for organizing notes and images by character with automatic saving and a beautiful dark interface. Perfect for writers, game developers, storytellers, and creative professionals who need to organize content by character or persona.

## Features

👥 **Character-Based Organization**
- **Character tabs** across the top for easy switching between characters
- **Character creation** with custom names and emojis
- **Character-specific notes** - each note belongs to a specific character
- **"All Characters" view** to see notes from all characters at once
- **Character deletion** with confirmation (removes character and all their notes)

✨ **Simple & Clean Interface**
- Beautiful dark theme with black background and white text
- Character-aware sidebar that updates based on selected character
- Clean, distraction-free design with horizontal character bar
- Custom app icon

🔐 **Security & Privacy**
- **Password protection** - set your password within the app
- Secure local authentication with 24-hour sessions
- In-app password management and settings
- All data stored locally on your device

🖼️ **Image Management**
- Drag and drop images directly into notes
- Paste images from clipboard (Ctrl/Cmd + V)
- **Mixed content paste** - copy/paste images and text together from websites, documents, or other apps
- High-quality image storage locally
- Visual preview with easy removal

📝 **Smart Note Taking**
- **Auto-generated titles** from your note content (no manual titling!)
- **Automatic saving** - no save button needed
- Real-time auto-save as you type
- Large, comfortable textarea for writing

📋 **Advanced Paste Features**
- **Rich content paste** - copy from any app (websites, documents, etc.) and paste both images and text at once
- Smart text extraction from HTML content
- Automatic note creation when pasting without an active note
- Visual notifications for successful paste operations
- Seamless integration with existing text

⚡ **Instant Features**
- Creates new notes instantly
- Fast search and navigation
- Keyboard shortcuts (Cmd/Ctrl + N for new note)
- Settings panel with gear icon (⚙️)
- Local storage - all data stays on your device

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm start
   ```

3. **Set up your first character:**
   - On first launch, you'll be prompted to set a password
   - Click "+ Add Character" to create your first character
   - Enter a name and optional emoji
   - The character tab will appear at the top

4. **Start creating notes:**
   - Select a character from the character bar
   - Click "New Note" or press Cmd/Ctrl + N  
   - Drag images into the drop zone
   - Start typing your notes
   - Everything saves automatically!

## How It Works

### Character Management
- **Character Tabs**: Horizontal bar at the top shows all characters with their emojis
- **Active Character**: Selected character is highlighted in blue
- **Character Context**: Sidebar header shows the current character's name and emoji
- **Note Assignment**: New notes are automatically assigned to the currently selected character
- **Character Switching**: Click any character tab to filter notes for that character
- **All Characters View**: Click "👥 All Characters" to see notes from all characters

### Auto-Generated Titles
- Note titles are automatically created from the first few words of your content
- No need to think of titles - just start writing
- Titles update automatically as you edit

### Enhanced Copy/Paste
- **Mixed Content**: Copy content from any app (Safari, Chrome, Word, etc.) that contains both images and text
- **Smart Handling**: Images are automatically added to the note, text goes to the textarea
- **Auto-Creation**: If no note is open, a new note is created automatically
- **Text Integration**: New text is appended to existing content with proper spacing
- **Visual Feedback**: Notifications show what was pasted successfully

**Example Use Cases:**
- Copy a blog post with images from a website
- Copy research content from documents
- Copy product listings with photos
- Copy social media posts with images

### Auto-Save
- Every change is saved automatically after 300ms of inactivity
- No save buttons or manual saving required
- Never lose your work

### Dark Theme
- Optimized for comfortable viewing
- Black background with white text
- Modern, clean design

## Building Executables

### For macOS Apple Silicon (ARM64):
```bash
npm run build-mac-arm64
```

### For other platforms:
```bash
npm run build-mac      # macOS (all architectures)
npm run build-win      # Windows
npm run build-linux    # Linux
```

Built files will be in the `dist/` directory.

## File Structure

```
image-sequence-notepad/
├── main.js           # Electron main process
├── server.js         # Local server for static files
├── public/           # Frontend files
│   ├── index.html    # Main interface
│   ├── style.css     # Dark theme styles
│   └── script.js     # App logic
├── dist/             # Built executables
└── package.json      # Project configuration
```

## Storage

- All notes and images are stored locally using localStorage
- No cloud sync or external dependencies
- Your data stays private on your device
- Images stored at full quality as base64

## Keyboard Shortcuts

- `Cmd/Ctrl + N` - Create new note
- `Cmd/Ctrl + V` - Paste image from clipboard (when focused in app)

## Requirements

- Node.js 16+ for development
- No additional requirements for built executables

## License

MIT License - feel free to use and modify! 