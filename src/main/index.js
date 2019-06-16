import path from 'path';
import { app, crashReporter, ipcMain, BrowserWindow } from 'electron';
import MemoryReader from "./services/MemoryReader";
import ABPlusMemoryReader from "./services/ABPlusMemoryReader";
import LoginService from './services/LoginService';
import DevService from './services/DevService';
import MacService from './services/MacService';
import EbsService from './services/EbsService';
require('dotenv').config();

let mainWindow = null;

crashReporter.start({
  productName: 'YourName',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false,
});

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  await DevService.installExtensions();

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (DevService.isDev()) {
    mainWindow.loadURL("http://localhost:8081/");
  } else {
    mainWindow.loadFile(
      path.resolve(path.join(__dirname, "../renderer/index.html"))
    );
  }

  // show window once on first load
  mainWindow.webContents.once('did-finish-load', async () => {
    await LoginService.loadSession(mainWindow);
    mainWindow.show();

    const reader = new ABPlusMemoryReader(MemoryReader);
    MemoryReader.init(async (status) => {
      const data = {
        status
      }
      if(status.ready){
        data.transformations = reader.readGameData();
      }
      mainWindow.webContents.send("update", data);
      if(status.ready){
        await EbsService.update(data);
      }
    }, 3000);
  });

  ipcMain.on("login", async () => {
    await LoginService.login(mainWindow);
  });

  ipcMain.on("logout", async () => {
    await LoginService.logout(mainWindow);
  });

  MacService.handleClose(mainWindow);
  DevService.devTools(mainWindow);
});
