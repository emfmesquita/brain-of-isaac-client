export default class MacService {
  static handleClose(mainWindow) {
    let forceQuit = false;

    mainWindow.webContents.on("did-finish-load", () => {
      // Handle window logic properly on macOS:
      // 1. App should not terminate if window has been closed
      // 2. Click on icon in dock should re-open the window
      // 3. ⌘+Q should close the window and quit the app
      if (process.platform === "darwin") {
        mainWindow.on("close", function(e) {
          if (!forceQuit) {
            e.preventDefault();
            mainWindow.hide();
          }
        });

        app.on("activate", () => {
          mainWindow.show();
        });

        app.on("before-quit", () => {
          forceQuit = true;
        });
      } else {
        mainWindow.on("closed", () => {
          mainWindow = null;
        });
      }
    });
  }
}
