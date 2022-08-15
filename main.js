const { app, ipcMain, BrowserWindow } = require('electron');
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();
const DownloadManager = require("electron-download-manager");

DownloadManager.register();

ipcMain.on('download-item', async (event, urls) => {
  DownloadManager.bulkDownload({
    urls: urls,
    path: "MC Mod Folder"
  }, function (error, finished, errors) {
      if (error) {
          console.log("finished: " + finished);
          console.log("errors: " + errors);
          return;
      }

      console.log("all finished");
  });
});

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
  remoteMain.enable(win.webContents);
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