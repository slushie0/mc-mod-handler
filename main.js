const { app, ipcMain, BrowserWindow } = require('electron');
const {download} = require("electron-dl");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
  ipcMain.on('download', (event, info) => {
    download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
      .then(dl => win.webContents.send('download complete', dl.getSavePath()));
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});