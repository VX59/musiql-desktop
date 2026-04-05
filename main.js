const { app, BrowserWindow, globalShortcut } = require("electron");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

let mainWindow;
let cachedSecrets = null;

async function getSecrets() {

    if (cachedSecrets) {
        return cachedSecrets;
    }

    const secret_name = "musiql/db-credentials";
    const client = new SecretsManagerClient({ region: "us-east-2" });

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT",
            })
        );

        // Parse JSON from SecretString
        return JSON.parse(response.SecretString);

    } catch (error) {
        console.error("Failed to load secrets:", error);
        return {};
    }
}

app.whenReady().then(async () => {
    const secrets = await getSecrets();
    // Use API_URL from secrets, fallback to localhost
    const API_URL = secrets.api_url || "http://localhost:8000";

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