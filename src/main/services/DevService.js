import { Menu } from 'electron';
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === "development";

export default class DevService {
  static isDev(){
    return isDevelopment;
  }

  static async installExtensions() {
    if (!isDevelopment) return;
    const installer = require("electron-devtools-installer");
    const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {
        console.log(`Error installing ${name} extension: ${e.message}`);
      }
    }
  }

  static devTools(mainWindow) {
    if (!isDevelopment) return;

    // auto-open dev tools
    mainWindow.webContents.openDevTools();

    // add inspect element on right click menu
    mainWindow.webContents.on("context-menu", (e, props) => {
      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click() {
            mainWindow.inspectElement(props.x, props.y);
          }
        }
      ]).popup(mainWindow);
    });
  }
}
