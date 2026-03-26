const { app, BrowserWindow, globalShortcut } = require("electron");

let mainWindow;

app.whenReady().then(() => {
    const API_URL = process.env.API_URL || "http://localhost:8000";

    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    mainWindow.loadURL(`${API_URL}/musiql/player/?ts=${Date.now()}`);    
    
    mainWindow.webContents.executeJavaScript("window.library()");

    globalShortcut.register("Control+F9", () => {
        mainWindow.webContents.executeJavaScript("window.sample()");
    });
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});