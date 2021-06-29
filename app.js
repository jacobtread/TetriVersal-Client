const {app, BrowserWindow} = require('electron')

let window;

app.whenReady().then(() => {
    window = new BrowserWindow({
        width: 600,
        height: 900,
        // frame: false,
        fullscreen: true,
        backgroundColor: '#333333',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    window.loadFile('dist/index.html').then().catch()
})
