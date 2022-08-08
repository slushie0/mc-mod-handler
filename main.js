const { app, ipcMain, BrowserWindow } = require('electron');
const { download } = require('electron-dl');

ipcMain.on('download-item', async (event, {url}) => {
  let win = BrowserWindow.getFocusedWindow();
  await download(win, url, {
    directory: app.getPath('downloads') + '/MC Mod Folder'
  })/*.then(
    event.sender.send('download-success', url)
  );*/
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
  win.webContents.send('asynchronous-message', {'appData': app.getPath('appData'), 'downloads': app.getPath('downloads')});
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