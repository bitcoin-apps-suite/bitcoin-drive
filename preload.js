const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Data storage methods
    loadNotes: () => ipcRenderer.invoke('load-notes'),
    saveNotes: (notes) => ipcRenderer.invoke('save-notes', notes),
    
    loadCharacters: () => ipcRenderer.invoke('load-characters'),
    saveCharacters: (characters) => ipcRenderer.invoke('save-characters', characters),
    
    // Migration from localStorage
    migrateLocalStorage: (data) => ipcRenderer.invoke('migrate-localStorage', data),
    
    // Get data path for display
    getDataPath: () => ipcRenderer.invoke('get-data-path')
}); 